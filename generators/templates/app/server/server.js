'use strict';

// const projectBase = process.cwd();

/*
  Simple Site Object API
  s: {
    app: koa(), // 站点应用实例
    conf: fullSiteConf, // 配置
    router: Object, // 路由
    render: Function, // 渲染 html / *.server.js / *.api.server.js
    request: Object, // co-request
    middleware: {
      navigator: Function, // 菜单中间件Hello
  }
*/
module.exports = function( s ){

  s.logger.log('Hello.');

  const pageBase = 'app/page/';
  const middlewareBase = 'app/server/middleware/';

  // # Sample
  // 一个 wrapped 中间件示例
  s.router.use( s.wrap( middlewareBase +'_sample.wrapped-middleware.js') );
  // 一个路由示例，不包含server端处理的简单页面
  s.router.all('/sample', s.render( pageBase +'_sample-page-intro/sample.html'));
  // 不包含server端处理的简单页面
  s.router.all('/sample-page-1', s.render( pageBase +'_sample-page-1/sample-page-1.html'));
  // 包含server端处理的复杂页面
  s.router.all('/sample-page-2', s.render( pageBase +'_sample-page-2/sample-page-2.server.js'));
  // 包含server端处理以及Vue的复杂前端页面
  s.router.all('/sample-page-3', s.render( pageBase +'_sample-page-3/sample-page-3.server.js'));
  // 包含server端处理以及Vue & Component的复杂前端页面
  s.router.all('/sample-page-4', s.render( pageBase +'_sample-page-4/sample-page-4.html'));
  // / Sample

  // 从删除这条配置开始
  s.router.redirect('/', '/sample');
  


  /**--s.router.all(urlName, s.render( pageBase + filePath ));--**/

};
