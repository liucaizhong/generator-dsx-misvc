const descriptions = {
  start: 'Start the application',
  dev: 'Develop the application',
  test: 'Test the application',
  build: 'Build the application',
  serve: "Serve the application"
}

const printScripts = (pkg, hasYarn) => {
  return Object.keys(pkg.scripts || {}).map(key => {
    if (!descriptions[key]) {
      return ''
    }

    return [
      `\n### ${descriptions[key]}`,
      '```',
      `${hasYarn ? 'yarn' : 'npm run'} ${key}`,
      '```',
      '',
    ].join('\n')
  }).join('')
}

module.exports = (pkg, hasYarn) => {
  return [
    `# ${pkg.name}\n`,
    `# Setup Your Development Environment\n`,
    `## 0. Support .editorconfig\n`,
    `Search <EditorConfig for VS Code> in vscode extensions and install it\n`,
    `## 1. Support prettier\n`,
    `Search <Prettier - Code formatter> in vscode extensions and install it\n`,
    `## 2. Support eslint\n`,
    `Search <Eslint> in vscode extensions and install it\n`,
    `## 3. Typescript configuration\n`,
    `If you don't use Typescript, please remove typescript configuration in .eslintrc's extends.\n`,
    '```js',
    `
    "dsx-base/typescript"
    `,
    '```\n',
    `Please also remove the configuration listed below in jest.config.js:\n`,
    '```js',
    `
    "transform": {
      "^.+\\.ts$": "ts-jest"
    },
    "globals": {
      "ts-jest": {
        "babelConfig": true
      }
    }
    `,
    '```\n',
    '## Setup Your Project',
    '```',
    `${hasYarn ? 'yarn' : 'npm'} install`,
    '```',
    printScripts(pkg, hasYarn),
  ].join('\n')
}
