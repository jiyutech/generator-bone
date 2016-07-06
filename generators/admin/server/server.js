'use strict';

const projectBase = process.cwd();
const pageBase = 'admin/page/';
const bone = require( projectBase +'/bone');
const Server = bone.Server;
const middleware = bone.middleware;


module.exports = new Server('/admin', function( router, Page ){

  router.use( middleware.navigator( require( projectBase +'/config/admin-sidemenu.json' ) ) );

  // // # Sample
  // // 不包含server端处理的简单页面
  // router.all('/', new Page( pageBase +'_sample/sample.html'));
  // // 不包含server端处理的简单页面
  // router.all('/sample-page-1', new Page( pageBase +'_sample/sample-page-1/sample-page-1.html'));
  // // 包含server端处理的复杂页面
  // router.all('/sample-page-2', new Page( pageBase +'_sample/sample-page-2/sample-page-2.server.js'));
  // // 包含server端处理以及Vue的复杂前端页面
  // router.all('/sample-page-3', new Page( pageBase +'_sample/sample-page-3/sample-page-3.server.js'));
  // // 包含server端处理以及Vue & Component的复杂前端页面
  // router.all('/sample-page-4', new Page( pageBase +'_sample/sample-page-4/sample-page-4.html'));
  // // / Sample

  router.all('/login', new Page( pageBase +'login/login.html'));
  router.all('/', new Page( pageBase +'sample-page/sample-page.html'));

});
