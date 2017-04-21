var Generator = require('yeoman-generator');
var fs = require('fs');
const echoCow = require('./lib/echo-cow.js');
const moduleVersion = require('./lib/module-version.js');

// var MyBase = generators.Base.extend({
//   helper: function() {
//     console.log('methods on the parent generator won\'t be called automatically');
//   },
//
// });


module.exports = class extends Generator {
  constructor(args, opts) {
    echoCow();
    super(args, opts);

    // this.argument('appname', { type: String, required: true });
    // Generator.Base(arguments);
    // moduleVersion('generator-bone').then((res) => {
    //   console.log(res);
    //   // TODO: 可以使用下面的var done = this.async()试试看
    // });
  }
  prompting() {
    // this.appname默认会将 - 替换为空格，这里是将它变回来
    this.appname = this.appname.replace(/\s/g,'-');
    let moduleName = 'generator-bone';
    // let version = this.spawnCommandSync('npm', ['show', moduleName, 'version']);
    // console.log(version);
    return this.prompt([{
      type: 'input',
      name: 'name',
      message: 'Your project name',
      default: this.appname, // Default to current folder name
    }]).then((answers) => {
      this.log('app name', answers.name);
      this.writing();
    });
  }
  writing() {
    // app: function() { //默认源目录就是生成器的templates目录
    // this.fs.
    // this.bulkDirectory('./.bone', './.bone');
    // this.bulkDirectory('./app', './app');
    // this.bulkDirectory('./config', './config');
    // this.bulkDirectory('./tail', './tail');
    console.log(this.sourceRoot());
    console.log(this.destinationRoot());
    this.fs.copy(this.sourceRoot() + '/package.json', this.destinationRoot() + '/');
    // this.fs.copy('./.gitignore', '.gitignore');
    // this.copy('./gulpfile.js', './gulpfile.js');
    // this.copy('./package.json', './package.json');
    // this.copy('./README.md', './README.md');
    // this.fs.copy(this.templatePath('./.*'), './');
    // }
  }
};
