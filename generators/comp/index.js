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
      name: 'componentName',
      message: 'Your component name',
      default: this.answers.componentName || 'my-route'
    }]);
    createFiles.apply(this, [answers]);
  }.bind(this));
};

var createFiles = function(answers) {
  answers.useVuejs = false;
  this.template(
    this.sourceRoot() + '/../ejs/component/' + 'template-component.scss',
    this.destinationPath() + '/' + answers.site + '/component/' + answers.componentName + '/' + answers.componentName + '.scss',
    answers);

    this.template(
      this.sourceRoot() + '/../ejs/component/' + 'template-component.js',
      this.destinationPath() + '/' + answers.site + '/component/' + answers.componentName + '/' + answers.componentName + '.js',
      answers);

  this.template(
    this.sourceRoot() + '/../ejs/component/' + 'template-component.html',
     this.destinationPath() + '/' + answers.site + '/component/' + answers.componentName + '/' + answers.componentName + '.html',
    answers);
};
