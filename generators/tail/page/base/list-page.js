'use strict';

var Vue = window.Vue;
var _ = window._;
var $ = window.$;
var conf = window.data.conf;
var Page = require('./page.js');
var Model = require('../../plugin/rest-model.js');
// var BuyerInfo = new Model( conf.ClientDCAPIBasePath+ '/bm-buyer.json' );

var moment = require('moment');

require('../../component/daterangepicker/daterangepicker.js');
require('../../component/pagination/pagination.js');

Vue.filter('dateTime', function (value) {
  return moment( new Date( isNaN(value) ? value : Number(value) ) ).format('YYYY-MM-DD HH:mm:ss');
});

module.exports = Page.extend({
  replace: false,

  data: function(){
    return _.extend({
      'resultSet': null, // 查询结果集
      'start': null, // 筛选时间：Start Time
      'end': null, // 筛选时间：End Time
      'ob': '',      // 排序：Order By
      'keyword': '', // 搜索关键词：Keywords
      'pageNumber': 1,
      'pageSize': 50,
      'totalRecords': 0,
      'totalPages': 0,
    }, window.data);
  },
  computed: {
    'pageTotal': function(){
      return this.totalPages;
    }
  },
  methods: {
    delayDo: function( id, fn, tmo ){
      // var dfd = $.Deferred();
      clearTimeout( this['_delayDoBfr_' + id] );
      this['_delayDoBfr_' + id] = setTimeout( fn.bind(this) , tmo || 200);
    },
    clearDelay: function( id ){
      clearTimeout( this['_delayDoBfr_' + id] );
    },
    stWeekAgo: function(){
      this.start = moment().subtract(7, 'days').format('YYYY-MM-DD');
      this.end = moment().format('YYYY-MM-DD');
    },
    stMonthAgo: function(){
      this.start = moment().subtract(30, 'days').format('YYYY-MM-DD');
      this.end = moment().format('YYYY-MM-DD');
    },
    refresh: function(){
      // 抽象方法，继承者实现
      // var query = {
      //   'start_date': this.start_date,
      //   'end_date': this.end_date,
      //   'pn': this.pn,
      //   'pb': this.pb,
      // };
      // return Model.get( conf.ClientDCAPIBasePath+ '/api/v2/orders?'+ qs.stringify(query) ).done(function( res ){
      //   if ( conf.debug ) console.log(JSON.parse(JSON.stringify(res)));
      //   _.extend(this, res);
      // }.bind(this));
    }
  },
  watch: {
    'keyword': { handler: function(){ this.delayDo('refresh', this.refresh, 500 ); } },
    'start': { handler: function(){ this.delayDo('refresh', this.refresh ); } },
    'end': { handler: function(){ this.delayDo('refresh', this.refresh ); } },
    'pageNumber': { handler: function(){ this.delayDo('refresh', this.refresh ); } },
    'pageSize': { handler: function(){ this.delayDo('refresh', this.refresh ); } },
    'ob': { handler: function(){ this.delayDo('refresh', this.refresh ); } },
  },
  beforeCompile: function(){
    // this.stMonthAgo();
  },
  ready: function(){
    this.delayDo('refresh', this.refresh );
  }

});
