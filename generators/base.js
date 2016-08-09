var yeoman = require('yeoman-generator');
var inquirer = require('inquirer');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var util = require('util');


var Generator = module.exports = function Generator() {

  yeoman.generators.NamedBase.apply(this, arguments);
  //console.log(yeoman.generators.Base.prototype);
  var sourceRoot = path.join(__dirname, '/templates');
  this.sourceRoot(sourceRoot);
  var destinationPath = this.destinationPath();
};

util.inherits(Generator, yeoman.generators.NamedBase);