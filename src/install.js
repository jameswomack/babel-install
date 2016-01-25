import FS   from 'fs';
import NPM  from 'npm';
import Path from 'path';
import yp   from 'yargs-parser';

function BabelInstaller (options = {
  checkBabelRC : true,
  config : {
    saveDev   : true,
    saveExact : true
  }
}) {
  if (!(this instanceof BabelInstaller)) return new BabelInstaller(options);

  [ 'checkBabelRC', 'config' ].forEach(k => (this[k] = options[k]))
  this.pkgNamesFromCLI = yp(process.argv.slice(2))._
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
    Object.keys(babelPrefixes).forEach(prfx => {
      (name.indexOf(babelPrefixes[prfx]) === 0) && (prefix = prfx)
    })
    babelrc[prefix] || (babelrc[prefix] = [ ])
    const savableName = name.replace(babelPrefixes[prefix],'')
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
  const pkg = readJSON('package.json')
  const devPkgNames = Object.keys(pkg.devDependencies)
  const missingPackages = [ ]
  Object.keys(babelPrefixes).forEach(prfx => {
    if (babelrc[prfx]) {
      babelrc[prfx].forEach(shortName => {
        const fullName = `${prfx}${shortName}`
        if (devPkgNames.indexOf(fullName) === -1) {
          missingPackages.push(fullName)
        }
      })
    }
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

const babelPrefixes = {
  plugins : 'babel-plugin-',
  preset  : 'babel-preset-'
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
