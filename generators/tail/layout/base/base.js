'use strict';

var Vue = window.Vue = require('vue');
Vue.config.debug = window.data.conf.debug;
window.qs = require('qs');
window.$ = window.jQuery = require('jquery');
window._ = require('lodash');

require('../../vendor/bootstrap-sass/assets/javascripts/bootstrap.js');
// require('select2');
require('../../vendor/adminlte/adminlte.js');

// CORS 全局设置
// $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
//   options.crossDomain = {
//     crossDomain: true
//   };
//   options.xhrFields = {
//     withCredentials: true
//   };
// });

// 全局登出方法
// window.logout = function(){
//   return $.ajax({
//     url: window.data.conf.ClientDCAPIBasePath+ '/operator-login',
//     type: 'DELETE'
//   }).done(function(){
//     location.reload();
//   });
// };

// Global Components
require('../../component/loading/loading.js');
