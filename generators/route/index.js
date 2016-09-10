var baseJs = require('../base.js');
var util = require('util');
var fs = require('fs');

var Generator = module.exports = function Generator() {
  baseJs.apply(this, arguments);
  console.log(arguments[0]);
  this.answers = {};
  this.answers.site = arguments[0][0];
  this.answers.routeName = arguments[0][1];
};

util.inherits(Generator, baseJs);



Generator.prototype.initFiles = function() {
  this.prompt([{
    type: 'input',
    name: 'site',
    message: 'Your site name',
    default: this.answers.site || 'app' // Default to current folder name
  }, {
    type: 'input',
    name: 'routeName',
    message: 'Your route name',
    default: this.answers.routeName || 'my-route' // Default to current folder name
  }, {
    type: 'list',
    name: 'type',
    message: 'what route do you need',
    choices: ['sample page', 'server page', 'vue page', 'server + vue page']
  }], function(answers) {
    addRoute.apply(this, [answers]);
    createFiles.apply(this, [answers]);
  }.bind(this));
  //this.template(this.sourceRoot() + '/demo.html',this.destinationPath() + '/demo.html');
};

var addRoute = function(answers) {
  var distText = fs.readFileSync(this.destinationPath() + '/' + answers.site + '/server/server.js', 'utf-8');
  var template = distText.match(/(\/\*{2}-{2}[\S\s]*-{2}[*]{2}(\/){1})/g);
  var templateString = template[0].replace(/((\/\*{2}-{2})|(-{2}[*]{2}[/]{1}))/g, '');
  templateString = templateString.replace('urlName', "'/" + answers.routeName + "'");
  if (answers.type === 'server page' || answers.type === 'server + vue page') {
    templateString = templateString.replace('filePath', "'" + answers.routeName + '/' + answers.routeName + 'server.js' + "'");
  } else {
    templateString = templateString.replace('filePath', "'" + answers.routeName + '/' + answers.routeName + '.html' + "'");
  }
  var result = templateString + '\n\n' + '\t' +template[0];
  distText = distText.replace(/(\/\*{2}-{2}[\S\s]*-{2}[*]{2}(\/){1})/g, result);
  fs.writeFileSync(this.destinationPath() + '/' + answers.site + '/server/server.js', distText);
};

var createFiles = function(answers) {
  console.log(answers);
  this.template(
    this.sourceRoot() + '/' + answers.site + '/page/' + '_sample-page-1/sample-page-1.scss',
    this.destinationPath() + '/' + answers.site + '/page/' + answers.routeName + '/' + answers.routeName + '.scss',
    answers);
  if (answers.type === 'server page' || answers.type === 'server + vue page') {
    this.template(
      this.sourceRoot() + '/' + answers.site + '/page/' + '_sample-page-2/sample-page-2.server.js',
      this.destinationPath() + '/' + answers.site + '/page/' + answers.routeName + '/' + answers.routeName + '.server.js',
      answers);
  }
  if (answers.type === 'vue page' || answers.type === 'server + vue page') {
    this.template(
      this.sourceRoot() + '/' + answers.site + '/page/' + '_sample-page-3/sample-page-3.html',
      this.destinationPath() + '/' + answers.site + '/page/' + answers.routeName + '/' + answers.routeName + '.html',
      answers);
    this.template(
      this.sourceRoot() + '/' + answers.site + '/page/' + '_sample-page-3/sample-page-3.js',
      this.destinationPath() + '/' + answers.site + '/page/' + answers.routeName + '/' + answers.routeName + '.js',
      answers);
  } else {
    this.template(
      this.sourceRoot() + '/' + answers.site + '/page/' + '_sample-page-1/sample-page-1.html',
      this.destinationPath() + '/' + answers.site + '/page/' + answers.routeName + '/' + answers.routeName + '.html',
      answers);
  }


};