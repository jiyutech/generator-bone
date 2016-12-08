'use strict';

const projectBase = process.cwd();
const logger = require('../logger.js')('Bone.render');
const path = require('path');

const views = require('co-views');
const _ = require('lodash');
const env = require('get-env')({
  test: ['test', 'testing']
});

const getconf = require('../getconf.js');
// const conf = getconf();
const noPrivateConfig = getconf.noPrivate();
const pkgInfo = _.pick( require( projectBase +'/package.json'), ['name', 'version', 'boneVersion']);
const boneConf = require('../bone-config');


function mixin( data, key, mixin ){
  if ( data.hasOwnProperty( key ) ) {
    logger.error('"'+ key +'" 这个Key已经被中间件占了，改个名吧');
  }
  if ( arguments.length === 3 ) {
    data[ key ] = mixin;
  }
  else if ( arguments.length === 2 ) {
    _.extend( data, key || {} );
  }
}

// 避免XSS攻击
function htmlSave( str ) {
  return str.replace(/<[/]?script.*?>/ig, '');
}

var doRender = views( projectBase, { map: { html: 'swig' } });
var devDoRender = views( projectBase, { map: { html: 'swig' }, cache: false, });

// Render Interface
module.exports = function( controllerHelper, siteConf ){

  var noPrivateFullSiteConfig = _.assign({}, noPrivateConfig, siteConf);

  var _render = function(viewPath, data){
    data = data || {};
    // package.json version mixin
    mixin( data, 'project', pkgInfo);
    // env mixin
    mixin( data, 'env', env);
    // conf mixin
    mixin( data, 'conf', noPrivateFullSiteConfig);
    // query mixin
    mixin( data, 'query', JSON.parse( htmlSave( JSON.stringify( this.query || {} ) ) ));
    mixin( data, 'params', JSON.parse( htmlSave( JSON.stringify( this.params || {} ) ) ));
    // Middleware mixin
    mixin( data, this.renderMixin );
    // For client mvvm
    mixin( data, '__data', JSON.stringify( data ) );
    if ( viewPath.indexOf(projectBase) === 0 ) {
      viewPath = viewPath.slice( projectBase.length );
    }
    // 非开发环境使用build后的html
    if ( env != 'dev' ) {
      viewPath = path.normalize(
        boneConf.buildPath +'/'+ siteConf.src +'/{{staticPrefix}}/'+
        viewPath.slice( siteConf.src.length )
      );
    }
    if ( env == 'dev' ) {
      return devDoRender(path.normalize( viewPath ), data);
    }
    else {
      return doRender(path.normalize( viewPath ), data);
    }
  };

  controllerHelper.render = _render;

  return function( initBy ){
    // Type 1: View path string.
    if ( typeof initBy === 'string' ) {
      if ( initBy.slice(-3) === '.js' ) {
        if ( initBy.indexOf(projectBase) !== 0 ) {
          initBy = path.normalize( projectBase +'/'+ initBy ); // require() needs absolute path.
        }
        initBy = require(initBy);
      }
      else {
        return function *(){
          this.body = yield _render.bind(this)( path.normalize( initBy ) );
        };
      }
    }
    // Type 2: Factory -> Generator handler.
    if ( typeof initBy === 'function' ) {
      return initBy( controllerHelper );
    }
    else {
      logger.error('Unsupported page type.');
    }
  };
};

module.exports.renderMixin = function *(next){
  // renderMixin中的参数将会被混入到渲染数据中（window.data）
  this.renderMixin = {};
  yield next;
};
