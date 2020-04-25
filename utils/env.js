const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs-extra')
const LRU = require('lru-cache')

let _hasYarn
const _yarnProjects = new LRU({
  max: 10,
  maxAge: 1000,
})

let _hasGit
const _gitProjects = new LRU({
  max: 10,
  maxAge: 1000,
})

exports.hasYarn = () => {
  // FIXME:https://github.com/yarnpkg/yarn/issues/7807
  return false

  if (_hasYarn !== undefined) {
    return _hasYarn
  }

  try {
    execSync('yarn --version', { stdio: 'ignore' })
    return (_hasYarn = true)
  } catch (e) {
    return (_hasYarn = false)
  }
}

exports.hasProjectYarn = (cwd) => {
  // FIXME:https://github.com/yarnpkg/yarn/issues/7807
  return false

  if (_yarnProjects.has(cwd)) {
    return _yarnProjects.get(cwd)
  }

  const lockFile = path.join(cwd, 'yarn.lock')
  const result = fs.existsSync(lockFile)
  _yarnProjects.set(cwd, result)

  return result
}

exports.hasGit = () => {
  if (_hasGit !== undefined) {
    return _hasGit
  }

  try {
    execSync('git --version', { stdio: 'ignore' })
    return (_hasGit = true)
  } catch (e) {
    return (_hasGit = false)
  }
}

exports.hasProjectGit = (cwd) => {
  if (_gitProjects.has(cwd)) {
    return _gitProjects.get(cwd)
  }

  let result
  try {
    execSync('git status', { stdio: 'ignore', cwd })
    result = true
  } catch (e) {
    result = false
  }
  _gitProjects.set(cwd, result)
  return result
}
