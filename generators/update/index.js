var updateJs = require('../update.js');
var util = require('util');

var Generator = module.exports = function Generator() {
  updateJs.apply(this, arguments);
};

util.inherits(Generator, updateJs);
Generator.prototype.createControllerFiles = function createControllerFiles() {
};