'use strict';

// var Vue = window.Vue;
var _ = window._;
// var $ = window.$;
// var qs = window.qs;
// var conf = window.data.conf;
// var Model = require('../../plugin/rest-model.js');

var ListPage = require('../base/list-page.js');

new ListPage({
  el: '#content',
  template: '#template',

  data: _.extend({
    'searchText': '',
    // 'ob': 'create_time.desc'
  }, window.data),
  computed: {},
  methods: {

    refreshBySearch: function(){
      // 抽象方法，需要搜索功能时实现
      // this.keyword = this.searchText;
    },

    refresh: function(){
      // 抽象方法，继承者实现
      // var query = {
      //   'start': this.start,
      //   'end': this.end,
      //   'pn': this.pn,
      //   'pb': this.pb,
      // };
      // return Model.get( conf.ClientDCAPIBasePath+ '/api/v2/orders?'+ qs.stringify(query) ).done(function( res ){
      //   if ( conf.debug ) console.log(JSON.parse(JSON.stringify(res)));
      //   _.extend(this, res);
      // }.bind(this));
    }
  },
  watch: {},
  ready: function(){
    this.delayDo('refresh', this.refresh, 1 );
  }

});
