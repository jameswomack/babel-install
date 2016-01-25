import test from 'tape';

// Testing the output file
import BabelInstaller from './index'


test('BabelInstaller', (t) => {

  t.ok(typeof BabelInstaller === 'function', 'BabelInstaller is a fn')

  const bi = BabelInstaller()
  t.ok(bi instanceof BabelInstaller, 'BabelInstaller returns an instance of itself')
  t.equal(bi.config.saveDev, true)
  t.equal(bi.config.saveExact, true)

  t.end()

})
