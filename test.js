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

  t.end()

})
