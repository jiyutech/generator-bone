'use strict';

const projectBase = process.cwd();
const logger = require('../../logger.js')('Bone.page-factory');
const path = require('path');

const views = require('co-views');
const _ = require('lodash');
const env = require('get-env')();

const getconf = require('../../getconf.js');
// const conf = getconf();
const noPrivateConfig = getconf.noPrivate();
const pkgInfo = _.pick( require( projectBase +'/package.json'), ['name', 'version', 'boneVersion']);


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

var doRender = views( projectBase, {
  map: { html: 'swig' }
});

var render = function(viewPath, data){
  data = data || {};
  // package.json version mixin
  mixin( data, 'project', pkgInfo);
  // env mixin
  mixin( data, 'env', env);
  // conf mixin
  mixin( data, 'conf', noPrivateConfig);
  // query mixin
  mixin( data, 'query', this.query);
  mixin( data, 'params', this.params);
  // Middleware mixin
  mixin( data, this.renderMixin );
  // For client mvvm
  mixin( data, '__data', JSON.stringify( data ) );

  if ( viewPath.indexOf(projectBase) === 0 ) {
    viewPath = viewPath.slice( projectBase.length );
  }

  return doRender(path.normalize( viewPath ), data);
};

module.exports = function(){

  // Page Class
  return function ( initBy ){
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
          this.body = yield render.bind(this)( path.normalize( initBy ) );
        };
      }
    }
    // Type 2: Factory -> Generator handler.
    if ( typeof initBy === 'function' ) {
      return initBy( render );
    }
    else {
      logger.error('Unsupported page type.');
    }
  };
};
