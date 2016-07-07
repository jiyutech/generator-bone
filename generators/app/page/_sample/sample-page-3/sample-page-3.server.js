'use strict';

// const basePath = process.cwd();
// const env = require('get-env')();
// const _ = require('lodash');
// const qs = require('qs');
// const request = require('co-request');
// const request = require( basePath +'/app/server/request');
// const parse = require('co-body');
// const conf = require( basePath +'/bone/getconf')();
// const logger = require( basePath +'/bone/logger')();

module.exports = function( c ){
  return function *(){
    // 渲染
    this.body = yield c.render.bind(this)( __dirname +'/sample-page-3.html', {
      'greetingsFromServerSide': 'Greetings from Koa.'
    });
  };
};
