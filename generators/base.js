var Generator = require('yeoman-generator');
const echoCow = require('./lib/echo-cow.js');
const moduleVersion = require('./lib/module-version.js');
const packageInfo = require('../package.json');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
  }
  initializing() {
    let moduleName = 'generator-bone';
    return moduleVersion(moduleName).then((result) => {
      this.latestVersion = result.replace(/\n/g, '');
      echoCow(this.latestVersion, packageInfo.version);
    });
  }
};
