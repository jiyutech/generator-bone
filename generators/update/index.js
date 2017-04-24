const Base = require('../base.js');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const util = require('../util.js');
const colors = require('colors');
const updateFileList = require('../yo-config.json').updateFileList;
const packageInfo = require('../../package.json');

function copyPackageFile() {
  let distText = fs.readFileSync(`${this.destinationRoot()}/package.json`, 'utf-8');
  distText = JSON.parse(distText);
  let sourceText = fs.readFileSync(`${this.sourceRoot()}/package.json`, 'utf-8');
  sourceText = JSON.parse(sourceText);

  const mergeFields = ['dependencies', 'devDependencies'];
  const replaceFields = ['scripts', 'engines'];
  _.forEach(mergeFields, (v) => {
    _.defaults(distText[v], sourceText[v]);
  });
  _.forEach(replaceFields, (v) => {
    distText[v] = sourceText[v];
  });
  distText.boneVersion = packageInfo.version;
  fs.writeFileSync(`${this.destinationRoot()}/package.json`, JSON.stringify(distText, null, '  '));
}

module.exports = class extends Base {
  constructor(args, opts) {
    super(args, opts);
  }
  initializing() {
    this.sourceRoot(path.join(__dirname, '../templates'));
    return Base.prototype.initializing.call(this);
  }
  prompting() {
    this.updateSuccessful = false;
    return this.prompt([{
      type: 'confirm',
      name: 'gitPushed',
      message: 'have push your project to git',
    }]).then((answers) => {
      this.answers = answers;
    });
  }
  writing() {
    if (this.answers.gitPushed) {
      _.forEach(updateFileList, (v) => {
        util.copyFile.call(this, v.path);
      });
      copyPackageFile.call(this);
      this.updateSuccessful = true;
    }
  }
  install() {
    if (this.answers.gitPushed) {
      this.npmInstall();
    }
  }
  end() {
    if (this.updateSuccessful) {
      console.log(colors.green('更新bone成功'));
    }
  }
};
