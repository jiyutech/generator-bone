var yeoman = require('yeoman-generator');
var path = require('path');
var util = require('util');


var Generator = module.exports = function Generator() {
  yeoman.generators.Base.apply(this, arguments);
  var sourceRoot = path.join(__dirname, '/templates');
  this.sourceRoot(sourceRoot);
  var destinationPath = this.destinationPath();
  this.sourceRoot(sourceRoot);
};

util.inherits(Generator, yeoman.generators.Base);