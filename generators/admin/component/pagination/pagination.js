'use strict';
var Vue = window.Vue;

module.exports = Vue.component( 'pagination', {
  template: require('./pagination.html'),
  replace: false,

  data: function(){
    return {
      'page': 1,
      'pageTotal': 1
    };
  },
  props: ['page', 'pageTotal'],
});
