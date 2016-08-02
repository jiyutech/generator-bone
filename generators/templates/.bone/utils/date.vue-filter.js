'use strict';

var Vue = window.Vue;
var fecha = require('fecha');

// 格式化日期
Vue.filter('date', function (value, formating) {
  return value ? fecha.format(
    new Date(isNaN(value) ? value.replace(/[-/.]/g, '-') : Number(value)),
    formating || 'YYYY.MM.DD HH:mm:dd'
  ) : '';
});
