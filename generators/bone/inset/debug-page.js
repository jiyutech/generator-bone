'use strict';

const conf = require('../getconf.js')();

module.exports = function *( next ){
  yield next;
  this.body = {
    config: conf
  };
};
