'use strict';

const projectBase = process.cwd();
const pageBase = 'app/page/';
const Server = require( projectBase +'/bone').Server;


module.exports = new Server(function( router, render ){

  // # Sample
  // 不包含server端处理的简单页面
  router.all('/', render( pageBase +'_sample/sample.html'));
  // 不包含server端处理的简单页面
  router.all('/sample-page-1', render( pageBase +'_sample/sample-page-1/sample-page-1.html'));
  // 包含server端处理的复杂页面
  router.all('/sample-page-2', render( pageBase +'_sample/sample-page-2/sample-page-2.server.js'));
  // 包含server端处理以及Vue的复杂前端页面
  router.all('/sample-page-3', render( pageBase +'_sample/sample-page-3/sample-page-3.server.js'));
  // 包含server端处理以及Vue & Component的复杂前端页面
  router.all('/sample-page-4', render( pageBase +'_sample/sample-page-4/sample-page-4.html'));
  // / Sample

});
