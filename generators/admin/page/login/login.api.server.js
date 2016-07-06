'use strict';

// const basePath = process.cwd();
// const env = require('get-env')();
// const _ = require('lodash');
// const qs = require('qs');
// const request = require('co-request');
// const parse = require('co-body');
// const conf = require( basePath +'/bone/getconf')();

module.exports = function( render ){
  return function *(){
    // 渲染
    this.body = yield render.bind(this)( __dirname +'/sample-page-2.html', {
      'greetingsFromServerSide': 'Greetings from Koa.'
    });
  };
};
