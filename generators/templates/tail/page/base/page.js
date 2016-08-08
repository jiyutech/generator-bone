'use strict';

var Vue = window.Vue;
var _ = window._;
// var $ = window.$;
var conf = window.data.conf;
var Model = require('../../plugin/rest-model.js');

module.exports = Vue.extend({
  replace: false,

  data: function(){
    return _.extend({
      'loading': Model.loadingStack,
      'error': Model.errorStack,
    }, window.data);
  },
  computed: {},
  methods: {},
  watch: {},
  beforeCompile: function(){},
  ready: function(){
    if ( conf.debug ) console.log(JSON.parse(JSON.stringify(this.$data)));
    // 将视图实例赋值到全局
    window.pageVM = this;
  }

});
