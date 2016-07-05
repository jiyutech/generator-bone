'use strict';

const basePath = process.cwd();
const renderPage = require( basePath +'/bone/render');
// const env = require('get-env')();
// const _ = require('lodash');
// const qs = require('qs');
// const request = require('co-request');
// const parse = require('co-body');
// const conf = require( basePath +'/bone/getconf')();

module.exports = function *(){
  // 渲染
  this.body = yield renderPage.bind(this)('_sample/sample-page-2/sample-page-2', {
    'greetingsFromServerSide': 'Greetings from Koa.'
  });
};
