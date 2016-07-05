'use strict';

const basePath = process.cwd();
const renderPage = require( basePath +'/bone/render');
// const env = require('get-env')();
// const _ = require('lodash');
// const qs = require('qs');
// const request = require('co-request');
// const request = require( basePath +'/app/server/request');
// const parse = require('co-body');
// const conf = require( basePath +'/bone/getconf')();
// const logger = require( basePath +'/bone/logger')();

module.exports = function *(){
  // 渲染
  this.body = yield renderPage.bind(this)('_sample/sample-page-3/sample-page-3', {
    'greetingsFromServerSide': 'Greetings from Koa.'
  });
};
