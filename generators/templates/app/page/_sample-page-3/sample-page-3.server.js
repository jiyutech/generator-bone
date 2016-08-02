'use strict';

// const _ = require('lodash');
// const qs = require('qs');
// const parse = require('co-body');

/*
  Simple Controller Helper Object API
  c: {
    env: dev | prod | test, // 运行环境
    conf: fullSiteConf, // 配置
    request: Object, // 包装后的co-request
    render: Function, // 渲染 html
    logger: like `console` Object, // 日志类实例
  };
*/
module.exports = function( c ){
  return function *(){
    // 渲染
    this.body = yield c.render.bind(this)( __dirname +'/sample-page-3.html', {
      'greetingsFromServerSide': 'Greetings from Koa.'
    });
  };
};
