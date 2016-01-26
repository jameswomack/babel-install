import test from 'tape';

// Testing the output file
import BabelInstaller from './index'


test('BabelInstaller', (t) => {

  t.ok(typeof BabelInstaller === 'function', 'BabelInstaller is a fn')

  const bi = BabelInstaller()
  t.ok(bi instanceof BabelInstaller, 'BabelInstaller returns an instance of itself')
  t.equal(bi.config['save-dev'],   true, 'save-dev should be on by default')
  t.equal(bi.config['save-exact'], true, 'save-exact should be on by default')
  t.equal(bi.checkBabelRC, true, 'Babel resource file checking should be on by default')

  t.test('installAndDeclare', (t) => {
    t.throws(() => {
      bi.installAndDeclare([], () => { })
    }, Error, 'installAndDeclare throws on an empty names collection')

    t.end()
  })

  t.test('babelNameForField', (t) => {
    let babelName

    babelName = bi.babelNameForField('babel-preset-es2015', 'presets')
    t.equal(babelName, 'es2015', 'babelNameForField should remove  presets prefix')

    babelName = bi.babelNameForField('babel-plugin-es2015', 'plugins')
    t.equal(babelName, 'es2015', 'babelNameForField should remove  plugins prefix')

    babelName = bi.babelNameForField('babel-preset-es2015@v1.0.0-beta-5', 'presets')
    t.equal(babelName, 'es2015', 'babelNameForField should remove semver & presets prefix')

    babelName = bi.babelNameForField('babel-plugin-es2015@v1.0.0-beta-5', 'plugins')
    t.equal(babelName, 'es2015', 'babelNameForField should remove semver & plugins prefix')

    t.throws(() => {
      bi.babelNameForField('babel-preset-es2015@v1.0.0-beta-5', 'preset')
    }, ReferenceError, 'babelNameForField throws on invalid Babel field name')

    t.end()
  })

  t.end()

})
