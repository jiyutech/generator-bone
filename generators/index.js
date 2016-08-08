var generators = require('yeoman-generator');
var fs = require('fs');

var MyBase = generators.Base.extend({
  helper: function() {
    console.log('methods on the parent generator won\'t be called automatically');
  },
  constructor: function() {
    // Calling the super constructor is important so our generator is correctly set up
    console.log("this");
    generators.Base.apply(this, arguments);
    // Next, add your custom code
  }
});

module.exports = MyBase.extend({
  prompting: function() {
    var done = this.async(); //当处理完用户输入需要进入下一个生命周期阶段时必须调用这个方法
    return this.prompt([{
      type: 'input',
      name: 'name',
      message: 'Your project name',
      default: this.appname // Default to current folder name
    }], function(answers) {
      this.pkgName = answers.name;
      this.log('app name', answers.name);
      done();
    }.bind(this));
  },
  writing: { //生成目录结构阶段
    app: function() { //默认源目录就是生成器的templates目录
      console.log(this.destinationRoot());
      console.log(this.sourceRoot());
      this.bulkDirectory('./', './');
    }
  }
});