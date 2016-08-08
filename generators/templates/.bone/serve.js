'use strict';

// const projectBase = process.cwd();
// const path = require('path');
// const vfs = require('vinyl-fs');
// const map = require('map-stream');
const env = require('get-env')();
const logger = env === 'dev' ? require('koa-logger') : require('koa-accesslog');
const koa = require('koa');
// const session = require('koa-session');
const app = koa();
const mount = require('koa-mount');
// app.use(session(app));
require('koa-qs')(app);

// const boneConf = require('./bone-config.js');
const conf = require('./src/getconf.js')();
const pkgInfo = require('../package.json');
const boneLogger = require('./src/logger.js')('Bone');
const Site = require('./src/site');

// secret for cookie
app.keys = conf.cookieKeys || ['this is a default key', 'thank nodejs'];

app
  .use(logger());

// 遍历站点列表
conf.sites.forEach(function( siteConf ){
  var site = new Site( siteConf );
  // 挂载
  app.use(mount( '/', site.app ));
});

const Router = require('koa-router');
var router = new Router();
router.all('/bone-debug', require('./src/debug-page.js'));

app.use(router.routes())
    .use(router.allowedMethods());


module.exports = app.listen( conf.port );
boneLogger.info(pkgInfo.name +'@'+ pkgInfo.version +' runing on port '+ conf.port + ' in `'+ env +'` mode');
