'use strict';

// const basePath = process.cwd();
// const env = require('get-env')();
// const _ = require('lodash');
// const qs = require('qs');
// const request = require('../../server/request.js');
// const parse = require('co-body');
// const conf = require( basePath +'/bone/getconf')();

module.exports = function(c) {
  return function*() {
    this.body = yield c.render.bind(this)(__dirname + '/<%= routeName %>.html');
  };
};