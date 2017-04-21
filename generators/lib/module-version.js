const exec = require('child_process').exec;
module.exports = function(moduleName) {
  return new Promise(function(resolve, reject) {
    exec(`npm show ${moduleName} version`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });

}
