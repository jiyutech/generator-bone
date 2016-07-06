'use strict';

var Vue = window.Vue;
var _ = window._;
// var $ = window.jQuery;
// var conf = window.data.conf;

new Vue({
  el: '#content',
  template: '#template',
  data: _.extend({
    'greetingsFromMvvm': 'Greetings from Vue.'
  }, window.data),
  computed: {},
  methods: {},
  watch: {},
  ready: function(){}
});
