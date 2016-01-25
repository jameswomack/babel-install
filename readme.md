# babel-install

## Declare &amp; install Babel plugins &amp; transforms the easy way

![Screengrabs](http://i.imgur.com/Fe0vzkd.gif)

### Getting started
From the command line
```sh
npm i babel-install -DE
```

If you haven't already, add this to your *~/.zshrc* or *~/.bashrc* and reload your shell. It allows your to run local Node bins as if they were globally installed.
```sh
export PATH=./node_modules/.bin:$PATH
```

#### CLI usage
```sh
babel-install babel-preset-es2015 babel-plugin-transform-async-to-generator babel-plugin-transform-es2015-arrow-functions
```

...which results in

.babelrc
```json
{
  "presets": ["es2015"],
  "plugins": ["transform-es2015-arrow-functions", "transform-async-to-generator"]
}
```

package.json
```json
{
  "devDependencies": {
    "babel-preset-es2015": "{some latest version here}",
    "babel-plugin-transform-async-to-generator": "{some latest version here}",
    "babel-plugin-transform-es2015-arrow-functions": "{some latest version here}",
  }
}
```

#### Programmatic Usage
```js
import BabelInstaller from 'babel-install';
BabelInstaller().installAndDeclare(someArrayOfBabelPackageNames\, function (installError) {
  return installError ? console.error(installError) : console.info('Install succeeded');
```

### Development

#### Install pre-commit hook
```
npm run install-precommit
```
