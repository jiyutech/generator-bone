'use strict';
var Vue = window.Vue;

module.exports = Vue.component( 'pagination', {
  template: require('./pagination.html'),
  replace: false,

  props: {
    'page': {
      type: Number,
      default: 1
    },
    'pageTotal': {
      type: Number,
      default: 1
    }
  },
});
