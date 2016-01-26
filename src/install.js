#!/usr/bin/env node

import FS   from 'fs';
import NPM  from 'npm';
import Path from 'path';
import yp   from 'yargs-parser';


const BabelPrefixes  = { plugins: 'babel-plugin-', presets: 'babel-preset-' }
const prefixNames    = Object.keys(BabelPrefixes)
const eachPrefixName = (iter) => prefixNames.forEach(iter)

function BabelInstaller (options = {
  checkBabelRC : true,
  config : {
    'save-dev'   : true,
    'save-exact' : true
  }
}) {
  if (!(this instanceof BabelInstaller)) return new BabelInstaller(options);

  [ 'checkBabelRC', 'config' ].forEach(k => (this[k] = options[k]))

  const args = yp(process.argv.slice(2), {
    array : prefixNames
  })
  this.pkgNamesFromCLI = args._

  eachPrefixName(k => args[k] &&
      this.pkgNamesFromCLI.push(...args[k].map(arg => `${BabelPrefixes[k]}${arg}`)))
}

BabelInstaller.prototype.load = function (next) {
  if (this.loaded) return next()
  NPM.load((error) => {
    if (!error) {
      Object.keys(this.config).forEach(k => (NPM.config.set(k, this.config[k])))
      this.loaded = true
    }
    return next(error)
  })
  return this
}

BabelInstaller.prototype.saveToBabel = function (names) {
  const fileName = '.babelrc'
  return writeJSON(fileName, names.reduce((babelrc, name) => {
    let prefix
    eachPrefixName(prfx =>
      (name.indexOf(BabelPrefixes[prfx]) === 0) && (prefix = prfx))
    babelrc[prefix] || (babelrc[prefix] = [ ])
    const savableName = name.replace(BabelPrefixes[prefix],'')
    if (babelrc[prefix].indexOf(savableName) !== -1) {
      console.error(`${savableName} (${name}) was already saved to ${fileName}`)
    } else {
      babelrc[prefix].push(savableName)
    }
    return babelrc
  }, readJSON(fileName)))
}

BabelInstaller.prototype.installAndDeclare = function (names, next) {
  typeof names === 'function' && (next = names) && (names = this.pkgNamesFromCLI)

  if (!names.length) {
    throw new Error('We need some package names in order to install anything dudette (or dude)!')
  }

  const nameMapper = (name) => {
    return name.indexOf('@') !== -1 ? name : name + '@latest'
  }
  return this.load((loadError) => {
    if (loadError) return console.error(loadError)
    return NPM.commands.install(names.map(nameMapper), installError => {
      if (!installError) {
        this.saveToBabel(names)
        Object.keys(this.config).forEach(k => (NPM.config.set(k, undefined)))
      }
      return next ? next(installError) : console.error(installError)
    })
  })
}

// Declared but uninstalled plugins & transforms
BabelInstaller.prototype.getUninstalled = function () {
  const babelrc = readJSON('.babelrc')
  const devDeps = readJSON('package.json').devDependencies
  const missingPackages = [ ]
  eachPrefixName(prfx => {
    babelrc[prfx] &&
      babelrc[prfx].forEach(shortName => {
        const fullName = `${babelrc[prfx]}${shortName}`
        (fullName in devDeps) && missingPackages.push(fullName)
      })
  })
  return missingPackages
}

BabelInstaller.prototype.smartNames = function () {
  return this.pkgNamesFromCLI.concat(this.checkBabelRC ? this.getUninstalled() : [ ])
}

function prependCwd (fileName) {
  return Path.join(process.cwd(), fileName)
}

function readJSON (fileName) {
  return JSON.parse(FS.readFileSync(prependCwd(fileName), 'utf8'))
}

function writeJSON (fileName, json) {
  const string = JSON.stringify(json, null, 2) + '\n'
  return FS.writeFileSync(prependCwd(fileName), string, 'ascii')
}

// CLI up
if (!module.parent) {
  BabelInstaller().installAndDeclare(installError =>
    installError ?
      console.error(installError) :
      console.info('Install succeeded')
  )
}

export default BabelInstaller
