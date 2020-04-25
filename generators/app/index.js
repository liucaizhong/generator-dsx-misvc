const Generator = require('yeoman-generator')
const fs = require('fs-extra')
const chalk = require('chalk')
const minimist = require('minimist')
const path = require('path')
const execa = require('execa')
const { execSync } = require('child_process')
const validateServiceName = require('validate-npm-package-name')
const { clearConsole } = require('../../utils/logger')
const { logWithSpinner, stopSpinner } = require('../../utils/spinner')
const { hasYarn, hasProjectYarn, hasGit, hasProjectGit } = require('../../utils/env')
const generateReadme = require('../../utils/generateReadme')
const generateChangelog = require('../../utils/generateChangelog')

module.exports = class extends Generator {
  constructor (args, opts) {
    super(args, opts)

    // rewrite _options
    this._options = {}

    // options
    this.option('help', {
      desc: 'Output usage information',
      alias: 'h',
    })

    // desc
    this.desc('create a new microservice powered by dsx-misvc')

    // arguments
    this.argument('svcName', {
      type: String,
      required: false,
      desc: 'The name for your new microservice',
    })
  }

  // private funtion
  _runSync (command, options = {}) {
    return execSync(command, Object.assign({
      cwd: this.targetDir,
      stdio: 'inherit',
    }, options))
  }

  _checkSvcNameExistOrNot () {
    const argvLen = minimist(process.argv.slice(3))._.length

    if (!argvLen) {
      console.error(chalk.red(`\nMissing required argument ${chalk.yellow('<svcName>')}.`))
      return false
    } else {
      if (argvLen > 1) {
        console.info(chalk.yellow('\nInfo: You provided more than one argument. The first one will be used as the microservice\'s name, the rest are ignored.'))
      }
      return true
    }
  }

  _shouldInitGit (cliOptions) {
    if (!hasGit()) {
      return false
    }
    // default: true unless already in a git repo
    return !hasProjectGit(this.cwd)
  }

  _shouldInstallDeps (cliOptions, type = 'node') {
    // force to install dependencies
    return true
  }

  _replaceFileContent(filePath, from, to) {
    try {
      const fileContent = fs.readFileSync(filePath).toString('utf8')
      const re = new RegExp(from,'g')
      const result = fileContent.replace(re, to)
      fs.writeFileSync(filePath, result, 'utf8')
    } catch (error) {
      console.error(error)
    }
  }

  initializing () {}

  async prompting () {
    // get the name of microservice
    if (!this._checkSvcNameExistOrNot()) {
      clearConsole()
      const { svcName } = await this.prompt([{
        name: 'svcName',
        type: 'input',
        message: 'Please enter your microservice\'s name:',
      }])
      this.options.svcName = svcName
    }
    this.cwd = this.destinationRoot() || process.cwd()
    this.inCurrent = this.options.svcName === '.'
    this.serviceName = this.inCurrent ? path.relative('../', this.cwd) : this.options.svcName
    this.targetDir = path.resolve(this.cwd, this.options.svcName || '.')

    // validate service name
    const validResult = validateServiceName(this.serviceName)

    if (!validResult.validForNewPackages) {
      console.error(chalk.red(`Invalid microservice name: "${this.serviceName}"`))
      validResult.errors && validResult.errors.forEach(err => {
        console.error(chalk.red.dim(`Error: ${err}`))
      })
      validResult.warnings && validResult.warnings.forEach(warn => {
        console.warn(chalk.red.dim(`Warning: ${warn}`))
      })
      process.exit(1)
    }

    // check microservice exist or not
    if (fs.existsSync(this.targetDir)) {
      clearConsole()
      if (this.inCurrent) {
        const { ok } = await this.prompt([{
          name: 'ok',
          type: 'confirm',
          message: 'Generate microservice in current directory?',
          default: true,
        }])
        if (!ok) {
          process.exit(1)
        }
      } else {
        const { action } = await this.prompt([{
          name: 'action',
          type: 'list',
          message: `Target directory ${chalk.cyan(this.targetDir)} already exists. Pick an action:`,
          choices: [{
            name: 'Override',
            value: 'override',
          }, {
            name: 'Cancel',
            value: false,
          }],
        }])
        if (!action) {
          process.exit(1)
        } else {
          console.log(`\nRemoving ${chalk.cyan(this.targetDir)}...`)
          await fs.remove(this.targetDir)
        }
      }
    }
    // ask the users for the application type of microservice
    // which they want to create
    clearConsole()
    const { type } = await this.prompt([{
      name: 'type',
      type: 'list',
      message: 'Choose the microservice\'s type which you want to create:',
      choices: [{
        name: 'Node',
        value: 'node',
      }, {
        name: 'React',
        value: 'react',
      }, {
        name: 'Vue',
        value: 'vue',
      }, {
        name: 'Python',
        value: 'python',
      }],
    }])
    this.cliOptions = Object.assign({}, {
      type,
    })
    // ask the users if need to install dependencies
    Object.assign(this.cliOptions, {
      installDeps: this._shouldInstallDeps(this.options, type),
    })
    if (this.cliOptions.installDeps === undefined) {
      clearConsole()
      const { installDeps } = await this.prompt([{
        name: 'installDeps',
        type: 'confirm',
        message: 'Do you want to install all the dependencies/packages now?',
        default: false,
      }])
      this.cliOptions.installDeps = installDeps
    }
  }

  configuring () {}

  default () {}

  writing () {
    switch(this.cliOptions.type) {
    case 'react':
      execa(
        'npx',
        [
          'create-react-app', this.serviceName,
          '--use-npm', '--template', 'typescript',
        ],
        {
          stdio: 'inherit',
        },
      ).then(() => {
        if (fs.existsSync(path.resolve(this.targetDir, 'package.json'))) {
          fs.copySync(path.resolve(this.sourceRoot(), this.cliOptions.type, 'template'),
            this.targetDir)

          // enable Eslint and Prettier
          console.log()
          logWithSpinner('Enabling Eslint and Prettier...', '🎀')
          console.log()
          const useYarn = hasProjectYarn(this.cwd) || hasYarn()
          this._runSync(
            `npx install-peerdeps --dev eslint-config-dsx-react`)

          if (useYarn) {
            this._runSync('yarn add -D husky lint-staged eclint in-publish safe-publish-latest')
          } else {
            this._runSync('npm i -D husky lint-staged eclint in-publish safe-publish-latest')
          }
          // update package.json
          const pkg = fs.readJsonSync(path.resolve(this.targetDir, 'package.json'))

          if (pkg['eslintConfig']) delete pkg['eslintConfig']

          Object.assign(pkg.scripts, {
            "prelint": "eclint check $(git ls-files)",
            "lint": "eslint --report-unused-disable-directives . --ext .ts,.tsx --fix --quiet",
            "lint:editor": "eclint fix $(git ls-files)",
            "pretest": "npm run --silent lint",
            "prepare": "(not-in-publish || npm test) && safe-publish-latest"
          })
          fs.writeJsonSync(path.resolve(this.targetDir, 'package.json'), pkg, {
            spaces: 2,
          })
          stopSpinner()
          console.log('🎉  Successfully enable Eslint and Prettier.')
          console.log()
        }
      })

      break
    case 'vue':
      execa(
        'npx',
        [
          'vue', 'create', '-p',
          path.resolve(this.sourceRoot(), this.cliOptions.type, 'presets.json'),
          // use npm as default
          '-m', 'npm',
          this.serviceName
        ],
        {
          stdio: 'inherit',
        },
      ).then(() => {
        if (fs.existsSync(path.resolve(this.targetDir, 'package.json'))) {
          fs.copySync(path.resolve(this.sourceRoot(), this.cliOptions.type, 'template'),
            this.targetDir)

          // enable Eslint and Prettier
          console.log()
          logWithSpinner('Enabling Eslint and Prettier...', '🎀')
          console.log()
          const useYarn = hasProjectYarn(this.cwd) || hasYarn()
          this._runSync(
            `npx install-peerdeps --dev eslint-config-dsx-vue`)

          if (useYarn) {
            this._runSync('yarn add -D husky lint-staged eclint in-publish safe-publish-latest eslint-import-resolver-webpack')
          } else {
            this._runSync('npm i -D husky lint-staged eclint in-publish safe-publish-latest eslint-import-resolver-webpack')
          }
          // update package.json
          const pkg = fs.readJsonSync(path.resolve(this.targetDir, 'package.json'))

          Object.assign(pkg.scripts, {
            "prelint": "eclint check $(git ls-files)",
            "lint": "eslint --report-unused-disable-directives . --ext .ts,.tsx,.vue --fix --quiet",
            "lint:editor": "eclint fix $(git ls-files)",
            "pretest": "npm run --silent lint",
            "test": "npm run --silent test:unit",
            "prepare": "(not-in-publish || npm test) && safe-publish-latest"
          })
          fs.writeJsonSync(path.resolve(this.targetDir, 'package.json'), pkg, {
            spaces: 2,
          })
          stopSpinner()
          console.log('🎉  Successfully enable Eslint and Prettier.')
          console.log()
        }
      })
      process.on('SIGINT', () => {
        fs.removeSync(this.targetDir)
      })
      process.on('SIGTERM', () => {
        fs.removeSync(this.targetDir)
      })
      break

    case 'python':

      console.log('🎉  Creating Python Project')

      clearConsole()

      // create project directory structure
      logWithSpinner(`Creating project in ${chalk.yellow(this.targetDir)}.`, '✨')
      if (!this.inCurrent) {
        fs.ensureDirSync(this.targetDir)
      }

      // copy template files to destination directory
      fs.copySync(path.resolve(this.sourceRoot(), this.cliOptions.type),
        this.targetDir)

      // install packages
      if (this.cliOptions.installDeps) {
        stopSpinner()
        console.log('⚙  Installing required Packages using PIP')
        console.log()
        this._runSync('pip install --upgrade pip')
        this._runSync('pip install -r requirements.txt')
      }
      stopSpinner()
      console.log()

      console.log(`🎉  Successfully created a python project ${chalk.yellow(this.serviceName)}.\n`)
      console.log('👉  Get started with the following commands:\n\n' +
      (this.targetDir === process.cwd() ? '' : chalk.cyan(`cd ${this.serviceName}\n`)) +
      (this.cliOptions.installDeps ? '' : chalk.cyan('pip install -r requirements.txt\n')))
      this._runSync('make')

      break

    default:
      // start the process of microservice application creation
      clearConsole()
      // 1.create project directory structure
      logWithSpinner(`Creating project in ${chalk.yellow(this.targetDir)}.`, '✨')
      if (!this.inCurrent) {
        fs.ensureDirSync(this.targetDir)
      }
      // copy template files to destination directory
      fs.copySync(path.resolve(this.sourceRoot(), this.cliOptions.type),
        this.targetDir)
      // update package.json
      const pkg = fs.readJsonSync(path.resolve(this.targetDir, 'package.json'))
      Object.assign(pkg, {
        name: this.serviceName,
        version: '1.0.0',
      })
      fs.writeJsonSync(path.resolve(this.targetDir, 'package.json'), pkg, {
        spaces: 2,
      })

      // intilaize git repository before installing deps
      const shouldInitGit = this._shouldInitGit(this.options)
      if (shouldInitGit) {
        logWithSpinner('Initializing git repository...', '🗃')
        this._runSync('git init', { stdio: 'ignore' })
      }
      // install plugins
      const useYarn = hasProjectYarn(this.cwd) || hasYarn()
      if (this.cliOptions.installDeps) {
        stopSpinner()
        console.log('⚙  Installing CLI plugins. This might take a while...')
        console.log()
        if (useYarn) {
          this._runSync('yarn install')
        } else {
          this._runSync('npm install')
        }
      }

      // enable Eslint and Prettier
      stopSpinner()
      console.log()
      logWithSpinner('Enabling Eslint and Prettier...', '🎀')
      console.log()
      this._runSync('npx install-peerdeps --dev eslint-config-dsx-base')

      // generate README.md
      stopSpinner()
      console.log()

      logWithSpinner('Generating README.md...', '📄')
      const readmeText = generateReadme(pkg, useYarn)
      fs.outputFileSync(path.resolve(this.targetDir, 'README.md'), readmeText)
      console.log()
      logWithSpinner('Generating CHANGELOG.md...', '📄')
      const changelogText = generateChangelog(this.serviceName)
      fs.outputFileSync(path.resolve(this.targetDir, 'CHANGELOG.md'), changelogText)

      // commit initial state
      let gitCommitFailed = false
      if (shouldInitGit) {
        this._runSync('git add -A', { stdio: 'ignore' })
        let commitMsg = 'feat: first commit'
        const argvMsg = minimist(process.argv.slice(5))._
        if (argvMsg.length) {
          commitMsg = argvMsg.join(' ')
        }
        try {
          this._runSync(`git commit -m '${commitMsg}'`, { stdio: 'ignore' })
        } catch (e) {
          gitCommitFailed = true
        }
      }

      // log instructions
      stopSpinner()
      console.log()
      console.log(`🎉  Successfully created project ${chalk.yellow(this.serviceName)}.`)
      console.log('👉  Get started with the following commands:\n\n' +
      (this.targetDir === process.cwd() ? '' : chalk.cyan(` ${chalk.gray('$')} cd ${this.serviceName}\n`)) +
      (this.cliOptions.installDeps ? '' : chalk.cyan(` ${chalk.gray('$')} ${useYarn ? 'yarn install' : 'npm install'}\n`)) +
      chalk.cyan(` ${chalk.gray('$')} ${useYarn ? 'yarn start' : 'npm run start'}`))
      console.log()

      if (gitCommitFailed) {
        console.warn(
          'Skipped git commit due to missing username and email in git config.\n' +
          'You will need to perform the initial commit yourself.\n',
        )
      }
      break
    }
  }

  conflicts () {}

  install () {}

  end () {}

}
