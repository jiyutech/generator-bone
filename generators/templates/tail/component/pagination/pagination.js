'use strict';
var Vue = window.Vue;

module.exports = Vue.component( 'pagination', {
  template: require('./pagination.html'),
  replace: false,

  props: {
    // 当前页码
    'page': {
      type: Number,
      default: 1
    },
    // 总页数
    'pageTotal': {
      type: Number,
      default: 1
    },
    // 点击页码后的URL Hash变化
    'hash': {
      type: String,
      default: ''
    },
    // 开始省略的页码数
    'ignoreNum': {
      type: Number,
      default: 5
    }
  },
});
