'use strict';

const basePath = process.cwd();
const conf = require( basePath +'/bone/getconf')();
const srcRequest = require('co-request');

var rConfig = {
  'headers': {
    'content-type': 'application/json'
  }
};

// 让所有请求走代理供调试，在config.json中配置proxy地址。
if ( conf.proxy ) {
  rConfig.proxy = conf.proxy;
}

// 使用这个requst封装发送请求，能省去一些默认设置。
module.exports = srcRequest.defaults(rConfig);
