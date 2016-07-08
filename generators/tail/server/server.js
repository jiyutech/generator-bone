'use strict';

const projectBase = process.cwd();


module.exports = function( s ){

  const pageBase = 'tail/page/';

  // 菜单
  s.router.use( s.middleware.navigator( require( projectBase +'/tail/config/admin-sidemenu.json' ) ) );

  // 页面 & API
  s.router.all('/login', s.render( pageBase +'login/login.html'));
  s.router.all('/', s.render( pageBase +'sample-page/sample-page.html'));
  s.router.all('*', s.render( pageBase +'sample-page/sample-page.html'));

};
