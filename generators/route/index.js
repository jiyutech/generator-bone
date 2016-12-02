var baseJs = require('../base.js');
var util = require('util');
var fs = require('fs');
var _ = require('lodash');
var Q = require('q');
var co = require('co');

var Generator = module.exports = function Generator() {
  //兼容命令不输入站点名字
  arguments[0] = arguments[0].length == 0 ? ['app'] : arguments[0];
  baseJs.apply(this, arguments);
  this.answers = {};
  this.answers.site = arguments[0][0];
  this.answers.routeName = arguments[0][1];
};

util.inherits(Generator, baseJs);

var myPrompt = function(question) {
  var defer = Q.defer();
  this.prompt(question, function(answers) {
    defer.resolve(answers);
  });
  return defer.promise;
};

var myPro = function() {

};

myPro.prototype.quest = function() {
  return this;
}

Generator.prototype.initFiles = function() {
  co(function*() {
    var answers = yield myPrompt.call(this, [{
      type: 'list',
      name: 'site',
      message: 'Your site name',
      choices: ['app', 'tail'],
      default: this.answers.site || 'app'
    }, {
      type: 'input',
      name: 'routeName',
      message: 'Your route name',
      default: this.answers.routeName || 'my-route'
    }]);

    var choices = [];
    if (answers.site === 'app') {
      choices = ['sample page', 'server page', 'vue page', 'server + vue page'];
    } else {
      choices = ['sample page', 'list page', 'sample page + server', 'list page + server'];
    }

    var subAnswers = yield myPrompt.call(this, [{
      type: 'list',
      name: 'type',
      message: 'what type of page do you need',
      choices: choices
    }]);

    answers = _.assignIn(answers, subAnswers);
    addRoute.apply(this, [answers]);
    if (answers.site === 'app') {
      createFiles.apply(this, [answers]);
    } else {
      createFilesTail.apply(this, [answers]);
    }
  }.bind(this));
};

var addRoute = function(answers) {
  var distText = fs.readFileSync(this.destinationPath() + '/' + answers.site + '/server/server.js', 'utf-8');
  var template = distText.match(/(\/\*{2}-{2}[\S\s]*-{2}[*]{2}(\/){1})/g);
  var templateString = template[0].replace(/((\/\*{2}-{2})|(-{2}[*]{2}[/]{1}))/g, '');
  templateString = templateString.replace('urlName', "'/" + answers.routeName + "'");
  if (/server/g.test(answers.type)) {
    templateString = templateString.replace('filePath', "'" + answers.routeName + '/' + answers.routeName + '.server.js' + "'");
  } else {
    templateString = templateString.replace('filePath', "'" + answers.routeName + '/' + answers.routeName + '.html' + "'");
  }
  var result = templateString + '\n\n' + '\t' + template[0];
  distText = distText.replace(/(\/\*{2}-{2}[\S\s]*-{2}[*]{2}(\/){1})/g, result);
  fs.writeFileSync(this.destinationPath() + '/' + answers.site + '/server/server.js', distText);
};

var createFiles = function(answers) {
  answers.useVuejs = false;
  this.template(
    this.sourceRoot() + '/../ejs/' + answers.site + '/' + 'template.scss',
    this.destinationPath() + '/' + answers.site + '/page/' + answers.routeName + '/' + answers.routeName + '.scss',
    answers);
  if (answers.type === 'server page' || answers.type === 'server + vue page') {
    this.template(
      this.sourceRoot() + '/../ejs/' + answers.site + '/' + 'template.server.js',
      this.destinationPath() + '/' + answers.site + '/page/' + answers.routeName + '/' + answers.routeName + '.server.js',
      answers);
  }
  if (answers.type === 'vue page' || answers.type === 'server + vue page') {
    answers.useVuejs = true;
    this.template(
      this.sourceRoot() + '/../ejs/' + answers.site + '/' + 'template.js',
      this.destinationPath() + '/' + answers.site + '/page/' + answers.routeName + '/' + answers.routeName + '.js',
      answers);
  }
  this.template(
    this.sourceRoot() + '/../ejs/' + answers.site + '/' + 'template.html',
    this.destinationPath() + '/' + answers.site + '/page/' + answers.routeName + '/' + answers.routeName + '.html',
    answers);
};
var createFilesTail = function(answers) {
  if (/server/g.test(answers.type)) {
    this.template(
      this.sourceRoot() + '/../ejs/' + answers.site + '/' + 'template.server.js',
      this.destinationPath() + '/' + answers.site + '/page/' + answers.routeName + '/' + answers.routeName + '.server.js',
      answers);
  }
  var filenName = 'list-page';
  if (/sample-page/g.test(answers.type)) {
    var filenName = 'sample-page';
  }
  this.template(
    this.sourceRoot() + '/../ejs/' + answers.site + '/' + filenName + '-template.html',
    this.destinationPath() + '/' + answers.site + '/page/' + answers.routeName + '/' + answers.routeName + '.html',
    answers);
  this.template(
    this.sourceRoot() + '/../ejs/' + answers.site + '/' + filenName + '-template.scss',
    this.destinationPath() + '/' + answers.site + '/page/' + answers.routeName + '/' + answers.routeName + '.scss',
    answers);
  this.template(
    this.sourceRoot() + '/../ejs/' + answers.site + '/' + filenName + '-template.js',
    this.destinationPath() + '/' + answers.site + '/page/' + answers.routeName + '/' + answers.routeName + '.js',
    answers);
};
