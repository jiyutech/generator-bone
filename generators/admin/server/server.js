'use strict';

const projectBase = process.cwd();
const pageBase = 'admin/page/';
const bone = require( projectBase +'/bone');
const Server = bone.Server;
const middleware = bone.middleware;


module.exports = new Server('/admin', function( router, render ){

  // 菜单
  router.use( middleware.navigator( require( projectBase +'/admin/config/admin-sidemenu.json' ) ) );

  // 页面
  router.all('/login', render( pageBase +'login/login.html'));
  router.all('/', render( pageBase +'sample-page/sample-page.html'));

});
