const Base = require('./base.js');
const _ = require('lodash');
const packageInfo = require('../package.json');
const colors = require('colors');
const util = require('./util.js');
const updateFileList = require('./yo-config.json').updateFileList;
const fs = require('fs');

module.exports = class extends Base {
  constructor(args, opts) {
    super(args, opts);
    this.description = fs.readFileSync(`${__dirname}/usage.txt`, 'utf-8');
  }
  initializing() {
    return Base.prototype.initializing.call(this);
  }
  prompting() {
    // this.appname默认会将 - 替换为空格，这里是将它变回来
    this.appname = this.appname.replace(/\s/g,'-');
    let confirmVersionQuestion = [{
      type: 'confirm',
      name: 'enupdate',
      message: `bone的最新版本为${colors.green(this.latestVersion)},当前版本为${colors.yellow(packageInfo.version)},是否要更新到最新版本`,
    }];
    let getAppNameQuestion = [{
      type: 'input',
      name: 'pkgName',
      message: 'Your project name',
      default: this.appname, // Default to current folder name
    }];

    let answers = {
      enupdate: false,
    };
    if (this.latestVersion !== packageInfo.version) {
      return this.prompt(confirmVersionQuestion).then((res) => {
        _.extend(answers, res);
        if (!res.enupdate) {
          return this.prompt(getAppNameQuestion);
        }
      }).then((res) => {
        _.extend(answers, res);
        this.answers = answers;
      });
    }
    return this.prompt(getAppNameQuestion).then((res) => {
      _.extend(answers, res);
      this.answers = answers;
    });
  }
  writing() {
    let answers = this.answers;
    if (!answers.enupdate) {
      this.answers.boneVersion = packageInfo.version;
      _.forEach(updateFileList, (v) => {
        util.copyFile.call(this, v.path);
      })
      util.copyFile.call(this, '/app');
      util.copyFile.call(this, '/config');
      util.copyFile.call(this, '/tail');
      util.copyFileTpl.call(this, '/package.json', null, answers);
      this.initSuccessful = true;
    } else {
      console.log('升级bone：' + colors.green('npm install -g generator-bone'));
    }
  }
  end() {
    if (this.initSuccessful) {
      console.log('项目初始化成功：\n' + colors.green('1.安装依赖  npm install \n') + colors.green('2.启动项目  npm run dev \n'));
    }
  }
};
