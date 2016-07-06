'use strict';

const Router = require('koa-router');
// const conf = require('./getconf.js')();

module.exports = function(){
  var router = new Router();
  router.all('/bone-debug', require('./debug-page.js'));
  return router;
};
