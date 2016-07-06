'use strict';

const path = require('path');
const koa = require('koa');
const Router = require('koa-router');
const conf = require('../../getconf.js')();
const render = require('./render');

module.exports = function( init ){

  var server = {
    mount: '/',
    app: koa(),
    router: new Router()
  };
  server.app.keys = conf.cookieKeys || ['this is a default key', 'thank nodejs'];

  init( server.router, render );
  server.app
    .use(require('../middleware/render-mixin.js'))
    .use(function *( next ){
      this.renderMixin.siteBase = path.normalize('/'+ server.mount);
      yield next;
    })
    .use(server.router.routes())
    .use(server.router.allowedMethods());

  return server;
};
