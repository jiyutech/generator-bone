'use strict';

// const projectBase = process.cwd();

module.exports = function( s ){

  const pageBase = 'app/page/';

  // # Sample
  // 不包含server端处理的简单页面
  s.router.all('/', s.render( pageBase +'_sample/sample.html'));
  // 不包含server端处理的简单页面
  s.router.all('/sample-page-1', s.render( pageBase +'_sample/sample-page-1/sample-page-1.html'));
  // 包含server端处理的复杂页面
  s.router.all('/sample-page-2', s.render( pageBase +'_sample/sample-page-2/sample-page-2.server.js'));
  // 包含server端处理以及Vue的复杂前端页面
  s.router.all('/sample-page-3', s.render( pageBase +'_sample/sample-page-3/sample-page-3.server.js'));
  // 包含server端处理以及Vue & Component的复杂前端页面
  s.router.all('/sample-page-4', s.render( pageBase +'_sample/sample-page-4/sample-page-4.html'));
  // / Sample

};
