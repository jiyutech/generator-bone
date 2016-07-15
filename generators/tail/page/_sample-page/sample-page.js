'use strict';

// var Vue = window.Vue;
var _ = window._;
// var $ = window.$;
// var conf = window.data.conf;
// var Model = require('../../plugin/rest-model.js');
// require('../../component/sample/sample.js');

var Page = require('../base/page.js');


new Page({
  el: '#content',
  template: '#template',
  replace: false,

  data: _.extend({

  }, window.data),
  computed: {},
  methods: {},
  watch: {},
  ready: function(){}

});
