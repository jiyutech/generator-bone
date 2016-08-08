var yeoman = require('yeoman-generator');
var inquirer = require('inquirer');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var util = require('util');
var config = require('./yo-config.json');


var Generator = module.exports = function Generator() {
  config = config['update'];
  yeoman.generators.Base.apply(this, arguments);

  var sourceRoot = path.join(__dirname, '/templates');
  var destinationPath = this.destinationPath();
  this.sourceRoot(sourceRoot);
  _.forEach(config.copyFileList,function(v){
    if (v.type === 'directory') {
      yeoman.generators.Base.prototype.bulkDirectory.apply(this,[v.path,v.path]);
    }else{
      yeoman.generators.Base.prototype.copy.apply(this,[v.path,v.path]);
    }
  }.bind(this));
  

  var distText = fs.readFileSync(destinationPath + '/package.json', 'utf-8');
  var sourceText = fs.readFileSync(sourceRoot + '/package.json', 'utf-8');
  sourceText = JSON.parse(sourceText);
  try {
    distText = JSON.parse(distText);
  } catch (err) {
    console.log('package.json is invaild');
  }
  if (typeof distText === 'object') {
    var mergeFields = ['dependencies', 'devDependencies'];
    var replaceFields = ['boneVersion', 'scripts', 'engines'];
    _.forEach(mergeFields, function(v) {
      _.defaults(distText[v], sourceText[v]);
    });
    _.forEach(replaceFields, function(v) {
      distText[v] = sourceText[v];
    });
  } else {
    distText = sourceText;
  }
  // console.log(JSON.parse(distText));
  // console.log(JSON.parse(sourceText));
  // 
  // _.forEach()
  fs.writeFileSync(destinationPath + '/package.json', JSON.stringify(distText, null, "  "));

};

util.inherits(Generator, yeoman.generators.Base);