var updateJs = require('../update.js');
var util = require('util');
var config = require('../yo-config.json');
var yeoman = require('yeoman-generator');
var _ = require('lodash');
var fs = require('fs');

var Generator = module.exports = function Generator() {
  updateJs.apply(this, arguments);
};

util.inherits(Generator, updateJs);

Generator.prototype.updateBone = function() {
  this.prompt([{
    type: 'confirm',
    name: 'gitPushed',
    message: 'have push your project to git'
  }], function(answers) {
    if (answers.gitPushed) {
      updateTask.apply(this, [answers]);
    }
  }.bind(this));
}

var updateTask = function() {
  config = config['update'];
  _.forEach(config.copyFileList, function(v) {
    if (v.type === 'directory') {
      yeoman.generators.Base.prototype.bulkDirectory.apply(this, [v.path, v.path]);
    } else {
      yeoman.generators.Base.prototype.copy.apply(this, [v.path, v.path]);
    }
  }.bind(this));
  var destinationPath = this.destinationPath();
  var sourceRoot = this.sourceRoot();

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
  fs.writeFileSync(destinationPath + '/package.json', JSON.stringify(distText, null, "  "));
}