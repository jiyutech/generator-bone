'use strict';

// const projectBase = process.cwd();
// const path = require('path');
// const vfs = require('vinyl-fs');
// const map = require('map-stream');
const env = require('get-env')({
  test: ['test', 'testing']
});
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

// 开发环境 Livereload
if ( env === 'dev' && (conf.livereload === undefined || conf.livereload) ) {
  app.use(function *(next){
    yield next;
    if (
      (this.type || '').trim().indexOf('text/html') === 0 &&
      typeof this.body === 'string' &&
      !(/MSIE\s[5-8]/i.test( this.headers['user-agent'] || '' )) // 低版本IE不加载Livereload
    ) {
      this.body = this.body.replace('</body>', '<script>document.write(\'<script src="//\'+ (location.host || \'localhost\').split(\':\')[0] +\':'+ conf.clientLrPort +'/livereload.js?snipver=1"></\' + \'script>\')</script></body>');
    }
  });
}

// 遍历子站点列表
conf.sites.forEach(function( siteConf ){
  var site = new Site( siteConf );
  // 挂载子站点
  app.use(mount( '/', site.app ));
});

const Router = require('koa-router');
var router = new Router();
router.all('/bone-debug', require('./src/debug-page.js'));

app.use(router.routes())
    .use(router.allowedMethods());

var port = process.env.PORT || conf.port;
module.exports = app.listen( port );
boneLogger.info(pkgInfo.name +'@'+ pkgInfo.version +' runing on port '+ port + ' in `'+ env +'` mode');
