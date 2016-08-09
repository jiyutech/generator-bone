var baseJs = require('../base.js');
var util = require('util');
var fs = require('fs');

var Generator = module.exports = function Generator() {
  baseJs.apply(this, arguments);
};

util.inherits(Generator, baseJs);



Generator.prototype.initFiles = function() {
  console.log(this.sourceRoot());
  console.log(this.destinationPath());
  console.log(this.answers);
  this.prompt([{
    type: 'input',
    name: 'site',
    message: 'Your site name',
    default: 'app' // Default to current folder name
  }, {
    type: 'input',
    name: 'routeName',
    message: 'Your route name',
    default: 'my-route' // Default to current folder name
  }, {
    type: 'list',
    name: 'type',
    message: 'what route do you need',
    choices: ['sample page', 'server page', 'vue page', 'server + vue page']
  }], function(answers) {
    console.log(answers);
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

  //console.log(templateString);
  var result = templateString + '\n\n' + '\t' + template[0];
  distText = distText.replace(/(\/\*{2}-{2}[\S\s]*-{2}[*]{2}(\/){1})/g, result);
  fs.writeFileSync(this.destinationPath() + '/' + answers.site + '/server/server.js', distText);
};

var createFiles = function(answers) {
  console.log(answers);
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