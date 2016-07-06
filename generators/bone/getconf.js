'use strict';

var env = require('get-env')();
var _ = require('lodash');
var addonConf;

var srcConfig = require('../config/config.json');
var config = srcConfig[env];
if ( !config ) {
  console.error('Config: 在`config/config.json`中找不到当前运行环境（'+ env +'）的配置信息');
  process.exit();
}
var srcConfig = JSON.parse(JSON.stringify( srcConfig ));
var commonConf = srcConfig.common || {};
var config = JSON.parse(JSON.stringify( _.assign( {}, commonConf, config ) ));
var noPrivateConfig = JSON.parse(JSON.stringify( config ));

try{
  var addonConf = require('../config/addon.json');
  _.extend( config, addonConf || {} );
  _.extend( noPrivateConfig, addonConf || {} );
  console.log('Config: 已合并`config/addon.json`配置.');
}catch(e) {
  console.log('Config: 未发现`config/addon.json`配置.');
}

try{
  var privateConf = require('../config/private.json');
  _.extend( config, privateConf || {} );
  console.log('Config: 已合并`config/private.json`配置.');
}catch(e) {
  console.log('Config: 未发现`config/private.json`配置.');
}

module.exports = function( env ){
  if ( env ) {
    return JSON.parse(JSON.stringify( srcConfig[env] ));
  }
  else {
    return JSON.parse(JSON.stringify( config ));
  }
};

module.exports.noPrivate = function(){
  return JSON.parse(JSON.stringify( noPrivateConfig ));
};

module.exports.checkExists = function(){
};
