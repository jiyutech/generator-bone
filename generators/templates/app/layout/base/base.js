'use strict';

require('es5-shim');

// Vue
var Vue = window.Vue = require('vue');
Vue.config.devtools = Vue.config.debug = window.data.conf.debug;
// Lodash
window._ = require('lodash');
// jQuery
window.$ = window.jQuery = require('jquery');
// Fastclick
var Fastclick = require('fastclick');
/**-- # parse markdown (如果有需要则开启) --**/
// window.marked = require('marked');
// marked.setOptions({
//   gfm: true,
//   breaks: true
// });
// Vue.filter('marked', function(value) {
//   return marked(value);
// });
/**-- / parse markdown (如果有需要则开启) --**/
$(function() {
  Fastclick.attach(document.body);
});
