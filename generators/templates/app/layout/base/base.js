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
$(function() {
  Fastclick.attach(document.body);
});
