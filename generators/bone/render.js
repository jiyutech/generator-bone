'use strict';

var views = require('co-views');
var _ = require('lodash');
var env = require('get-env')();

var getconf = require('./getconf.js');
var conf = getconf();
var noPrivateConfig = getconf.noPrivate();
var pkgInfo = _.pick( require('../package.json'), ['name', 'version', 'boneVersion']);

var render = views( conf.viewPath, {
  map: { html: 'swig' }
});

function mixin( data, key, mixin ){
  if ( data.hasOwnProperty( key ) ) {
    console.error('"'+ key +'" 这个Key已经被中间件占了，改个名吧');
  }
  if ( arguments.length === 3 ) {
    data[ key ] = mixin;
  }
  else if ( arguments.length === 2 ) {
    _.extend( data, key || {} );
  }
}

module.exports = function(view, data){
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

  return render('/'+ view, data);
};
