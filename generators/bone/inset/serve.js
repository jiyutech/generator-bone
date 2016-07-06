'use strict';

const projectBase = process.cwd();
const path = require('path');
const vfs = require('vinyl-fs');
const map = require('map-stream');
const env = require('get-env')();
const logger = env === 'dev' ? require('koa-logger') : require('koa-accesslog');
const koa = require('koa');
const koaStatic = require('koa-static');
// const session = require('koa-session');
const app = koa();
const mount = require('koa-mount');
// app.use(session(app));
require('koa-qs')(app);

// const boneConf = require('./bone-config.js');
const conf = require('../getconf.js')();
const pkgInfo = require('../../package.json');
const boneLogger = require('../logger.js')('Bone');

// secret for cookie
app.keys = conf.cookieKeys || ['this is a default key', 'thank nodejs'];

app
  .use(logger());

// 遍历站点列表
conf.sites.forEach(function( site ){

  var server = require( path.normalize(projectBase +'/'+ site.server ) );

  switch (env) {
    case 'dev':

      // 开发环境rootify中间件
      // TODO new rootify
      // server.app.use(mount('/', koaStatic( site.rootifyPath )));
      // 开发环境 Static Server
      server.app.use(mount('/static', require('./middleware/dev-livebuild')({
        src: [
          path.normalize( site.src +'/**/*.js' ),
          path.normalize( site.src +'/**/*.{sass,scss,css}' ),
          '!'+ path.normalize( site.src +'/**/*.server.js' ),
          '!'+ path.normalize( site.src +'/server/*.*' ),
          '!'+ path.normalize( site.src +'/**/server/*.*' ),
          '!'+ path.normalize( site.src +'/**/server/**/*.*' ),
        ],
        base: site.src,
        // dest: site.buildPath,
      })));

      // 开发环境 Livereload
      if ( env === 'dev' ) {
        app.use(function *(next){
          yield next;
          if ( (this.type || '').trim().indexOf('text/html') === 0 && typeof this.body === 'string' ) {
            this.body = this.body.replace('</body>', '<script>document.write(\'<script src="//\'+ (location.host || \'localhost\').split(\':\')[0] +\':'+ conf.clientLrPort +'/livereload.js?snipver=1"></\' + \'script>\')</script></body>');
          }
        });
      }

      // 开发环境 Static Server
      [ site.src ].forEach(function( path ){
        server.app.use(mount('/static', koaStatic( path ), {}));
      });

      break;
    default:

      // 生产环境 Static Server
      [ site.src ].forEach(function( path ){
        server.app.use(mount('/static', koaStatic( path ), {
          maxage: 31536000000
        }));
      });

  }

  // 挂载
  app.use(mount(server.mountPath, server.app));
});

const Router = require('koa-router');
var router = new Router();
router.all('/bone-debug', require('./debug-page.js'));

app.use(router.routes())
    .use(router.allowedMethods());


module.exports = app.listen( conf.port );
boneLogger.info(pkgInfo.name +'@'+ pkgInfo.version +' runing on port '+ conf.port + ' in `'+ env +'` mode');
