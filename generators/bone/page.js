'use strict';

var render = require('./render');

module.exports = function( viewName ){
  return function *(){
    this.body = yield render.bind(this)(viewName);
  };
};
