'use strict';

const projectBase = process.cwd();

/*
  Simple Site Object API
  s: {
    app: koa(), // 站点应用实例
    conf: fullSiteConf, // 配置
    router: Object, // 路由
    render: Function, // 渲染 html / *.server.js / *.api.server.js
    request: Object, // co-request
    middleware: {
      navigator: Function, // 菜单中间件
    },
  },
  logger: like console Object, // 日志类实例
  }
*/
module.exports = function( s ){

  s.logger.log('Hello.');

  const pageBase = 'tail/page/';

  // 菜单
  s.router.use( s.middleware.navigator( require( projectBase +'/tail/config/admin-sidemenu.json' ) ) );

  // 页面 & API
  s.router.all('/login', s.render( pageBase +'login/login.html'));
  s.router.all('/', s.render( pageBase +'sample-page/sample-page.html'));
  s.router.all('*', s.render( pageBase +'sample-page/sample-page.html'));

};
