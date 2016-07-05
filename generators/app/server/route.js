'use strict';

const basePath = process.cwd();
const router = require( basePath +'/bone/route.js');
const page = require( basePath +'/bone/page.js');

// # Sample
// 不包含server端处理的简单页面
router.all('/', page('_sample/sample.html'));
// 不包含server端处理的简单页面
router.all('/sample-page-1', page('_sample/sample-page-1/sample-page-1.html'));
// 包含server端处理的复杂页面
router.all('/sample-page-2', require('../page/_sample/sample-page-2/sample-page-2.server.js'));
// 包含server端处理以及Vue MVVM的复杂前端页面
router.all('/sample-page-4', page('_sample/sample-page-4/sample-page-4.html'));
// / Sample

module.exports = router;
