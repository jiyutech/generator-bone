const Base = require('../base.js');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const util = require('../util.js');

module.exports = class extends Base {
  constructor(args, opts) {
    super(args, opts);
    this.answers = {
      site: args[0] || 'app',
      routeName: args[1] || 'my-route',
      useVuejs: false,
      useServer: false,
    };
  }
  initializing() {
    this.sourceRoot(path.join(__dirname, '../../generators/ejs'));
    return Base.prototype.initializing.call(this);
  }
  prompting() {
    return this.prompt(this._private_siteAndRouteQuestion()).then((answers) => {
      _.extend(this.answers, answers);
      return this.prompt(this._private_pageTypeQuestion(answers.site));
    }).then((answers) => {
      _.extend(this.answers, answers);
    });
  }
  writing() {
    this._private_addRoute(this.answers);
    if (this.answers.site === 'app') {
      this._private_createAppFiles(this.answers);
    } else if (this.answers.site === 'tail') {
      this._private_createTailFiles(this.answers);
    }
  }
  end() {
  }
  _private_siteAndRouteQuestion() {
    return [{
      type: 'list',
      name: 'site',
      message: 'Your site name',
      choices: ['app', 'tail'],
      default: this.answers.site || 'app',
    }, {
      type: 'input',
      name: 'routeName',
      message: 'Your route name',
      default: this.answers.routeName || 'my-route',
    }];
  }
  _private_pageTypeQuestion(site) {
    let choices;
    if (site === 'app') choices = ['simple page', 'server page', 'vue page', 'server + vue page'];
    else choices = ['simple page', 'list page', 'simple page + server', 'list page + server'];
    return [{
      type: 'list',
      name: 'type',
      message: 'what type of page do you need',
      choices,
    }];
  }
  _private_addRoute(answers) {
    let serverFilePath = `${this.destinationRoot()}/${answers.site}/server/server.js`;
    let distText = fs.readFileSync(serverFilePath, 'utf-8');
    let template = distText.match(/(\/\*{2}-{2}[\S\s]*-{2}[*]{2}(\/){1})/g);
    let templateString = template[0].replace(/((\/\*{2}-{2})|(-{2}[*]{2}[/]{1}))/g, '');
    templateString = templateString.replace('urlName', `'${answers.routeName}'`);
    if (/server/g.test(answers.type)) {
      templateString = templateString.replace('filePath', `'${answers.routeName}/${answers.routeName}.server.js'`);
    } else {
      templateString = templateString.replace('filePath', `'${answers.routeName}/${answers.routeName}.html'`);
    }
    let result = `${templateString}\n\n\t${template[0]}`;
    distText = distText.replace(/(\/\*{2}-{2}[\S\s]*-{2}[*]{2}(\/){1})/g, result);
    fs.writeFileSync(serverFilePath, distText);
  }
  _private_createAppFiles(answers) {
    let sourceRelativeRoot = `/${answers.site}`;
    let destinationRelativeFile = `/${answers.site}/page/${answers.routeName}/${answers.routeName}`;
    util.copyFileTpl.call(this, `${sourceRelativeRoot}/template.scss`, `${destinationRelativeFile}.scss`, answers);
    if (answers.type === 'server page' || answers.type === 'server + vue page') {
      answers.useServer = true;
      util.copyFileTpl.call(this, `${sourceRelativeRoot}/template.server.js`, `${destinationRelativeFile}.server.js`, answers);
    }
    if (answers.type === 'vue page' || answers.type === 'server + vue page') {
      answers.useVuejs = true;
      util.copyFileTpl.call(this, `${sourceRelativeRoot}/template.js`, `${destinationRelativeFile}.js`, answers);
    }
    util.copyFileTpl.call(this, `${sourceRelativeRoot}/template.html`, `${destinationRelativeFile}.html`, answers);
  }
  _private_createTailFiles(answers) {
    let sourceRelativeRoot = `/${answers.site}`;
    let destinationRelativeFile = `/${answers.site}/page/${answers.routeName}/${answers.routeName}`;
    if (/server/g.test(answers.type)) {
      util.copyFileTpl.call(this, `${sourceRelativeRoot}/template.server.js`, `${destinationRelativeFile}.server.js`, answers);
    }
    let filenName = 'list-page';
    if (/sample-page/g.test(answers.type)) {
      filenName = 'sample-page';
    }
    util.copyFileTpl.call(this, `${sourceRelativeRoot}/${filenName}-template.html`, `${destinationRelativeFile}.html`, answers);
    util.copyFileTpl.call(this, `${sourceRelativeRoot}/${filenName}-template.scss`, `${destinationRelativeFile}.scss`, answers);
    util.copyFileTpl.call(this, `${sourceRelativeRoot}/${filenName}-template.js`, `${destinationRelativeFile}.js`, answers);
  }
};
