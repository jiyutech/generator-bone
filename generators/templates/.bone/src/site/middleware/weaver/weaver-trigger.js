'use strict';
const parse = require('co-body');

module.exports = function*() {
  this.weaverFn.getWeaverContext();
  this.body = {
    errCode: 0,
    mess: 'trigger weaver successful'
  };
};
