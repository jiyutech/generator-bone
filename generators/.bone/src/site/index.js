'use strict';

const projectBase = process.cwd();
const _ = require('lodash');
const path = require('path');
const koa = require('koa');
const Router = require('koa-router');
const conf = require('../getconf.js')();
const Render = require('./render');
const request = require('./request');
const env = require('get-env')();
const koaStatic = require('koa-static');
const mount = require('koa-mount');
const nav = require('./middleware/navigator');
const Logger = require('../logger.js');

module.exports = function( siteConf ){

  const fullSiteConf = _.assign({}, conf, siteConf);
  const init = require( path.normalize( projectBase +'/'+ siteConf.server ) );

  const siteLogger = new Logger( 'Site '+ (siteConf.sitePrefix || '/') );

  const controllerHelper = {
    conf: fullSiteConf,
    request: request,
    render: null, // 将在Render中被完善
    logger: siteLogger,
    utils: {
      weChat: require('../util/wechat-utils')
    }
  };

  const render = new Render( controllerHelper, siteConf );

  const site = {
    app: koa(),
    conf: fullSiteConf,
    router: new Router({
      prefix: (!siteConf.sitePrefix || siteConf.sitePrefix == '/') ? undefined : siteConf.sitePrefix
    }),
    render: render,
    wrap: render, // 包裹中间件（render在中间件场景下的语法糖）
    request: request,
    middleware: {
      navigator: nav,
    },
    logger: siteLogger,
  };

  // 初始化 koa App
  site.app.keys = fullSiteConf.cookieKeys || ['this is a default key', 'thank nodejs'];
  site.app
    .use( Render.renderMixin )
    .use(function *( next ){
      this.sitePrefix = this.renderMixin.sitePrefix = siteConf.sitePrefix;
      this.staticPrefix = this.renderMixin.staticPrefix = siteConf.staticPrefix;
      yield next;
    });
  init( site );

  // 初始化静态资源服务
  switch (env) {
    case 'dev':
      const Livebuilder = require('./middleware/dev-livebuild');
      // 开发环境rootify中间件
      if ( siteConf.rootifyPaths && siteConf.rootifyPaths.length ) {
        siteConf.rootifyPaths.forEach(function( dir ){
          site.app.use(mount('/', koaStatic( dir )));
        });
      }
      // 开发环境 Static Server
      site.app.use(mount(siteConf.staticPrefix, new Livebuilder({
        src: [
          path.normalize( siteConf.src +'/**/*.js' ),
          path.normalize( siteConf.src +'/**/*.{sass,scss,css}' ),
          '!'+ path.normalize( siteConf.src +'/**/*.server.js' ),
          '!'+ path.normalize( siteConf.src +'/server/*.*' ),
          '!'+ path.normalize( siteConf.src +'/**/server/*.*' ),
          '!'+ path.normalize( siteConf.src +'/**/server/**/*.*' ),
        ],
        srcBase: siteConf.src,
        urlPrefix: siteConf.staticPrefix,
        // dest: site.buildPath,
      })));

      // 开发环境 Livereload
      if ( env === 'dev' ) {
        site.app.use(function *(next){
          yield next;
          if ( (this.type || '').trim().indexOf('text/html') === 0 && typeof this.body === 'string' ) {
            this.body = this.body.replace('</body>', '<script>document.write(\'<script src="//\'+ (location.host || \'localhost\').split(\':\')[0] +\':'+ conf.clientLrPort +'/livereload.js?snipver=1"></\' + \'script>\')</script></body>');
          }
        });
      }

      // 开发环境 Static Server
      [ siteConf.src ].forEach(function( path ){
        site.app.use(mount(siteConf.staticPrefix, koaStatic( path ), {}));
      });

      break;
    default:

      // 生产环境 Static Server
      [ path.normalize( conf.buildPath +'/'+ siteConf.src  +'/{{staticPrefix}}' ) ].forEach(function( path ){
        site.app.use(mount(siteConf.staticPrefix, koaStatic( path ), {
          maxage: 31536000000
        }));
      });

    }

  site.app
    .use(site.router.routes())
    .use(site.router.allowedMethods());

  siteLogger.log('running...');

  return site;
};
