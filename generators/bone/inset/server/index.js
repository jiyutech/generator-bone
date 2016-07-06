'use strict';

const path = require('path');
const koa = require('koa');
const Router = require('koa-router');
const conf = require('../../getconf.js')();
const render = require('./render');

module.exports = function( mountPath, init ){

  var app = koa();
  var router = new Router();
  app.keys = conf.cookieKeys || ['this is a default key', 'thank nodejs'];

  init( router, render );

  app
    .use(require('../middleware/render-mixin.js'))
    .use(function *( next ){
      this.renderMixin.siteBase = path.normalize('/'+ mountPath);
      yield next;
    })
    .use(router.routes())
    .use(router.allowedMethods());

  return {
    mountPath: mountPath,
    app: app
  };
};
