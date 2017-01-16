const fs = require('fs');
var initFile = function(filepath, initValue) {
  if (!filepath) {
    throw new Error('filepath is unvalued');
    return;
  }
  if (!fs.existsSync(filepath)) {
    fs.openSync(filepath, 'w+');
    if (initValue) {
      fs.writeFileSync(filepath, JSON.stringify(initValue, null, '   '), 'UTF-8');
    }
  }
};
var readJsonFile = function(filepath) {
  try {
    var r = fs.readFileSync(filepath);
  } catch (e) {
    console.error(e);
    throw new Error('no such file or directory');
  }
  try {
    r = JSON.parse(r)
  } catch (e) {
    console.error(e);
    throw new Error('JSON.parse() error');
  }
  return r;
};
var saveJsonFile = function(filepath, value) {
  try {
    fs.writeFileSync(filepath, JSON.stringify(value, null, '   '), 'UTF-8');
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
};
module.exports = function() {
  return {
    initFile: initFile,
    readJsonFile: readJsonFile,
    saveJsonFile: saveJsonFile
  };
};
