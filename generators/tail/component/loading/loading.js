'use strict';

var _ = window._;
var Vue = window.Vue;
var pace = require('../../vendor/pace/pace.js');

pace.options = {
  ajax: false, // disabled
  document: false, // disabled
  eventLag: false, // disabled
};
pace.go(1);

module.exports = Vue.component( 'loading', {
  template: require('./loading.html'),
  replace: true,

  data: function(){
    return {
      'errMsg': '',
      'isErrPopping': false
    };
  },
  props: ['loading', 'error'],
  computed: {
    'isLoading': function(){
      return _.isArray( this.loading ) ? this.loading.length : this.loading;
    }
  },
  watch: {
    'isLoading': {
      handler: function(val, stale){
        if ( val ) {
          if ( stale != val ) pace.restart();
        }
        else pace.go(1);
      }
    },
    'error': {
      deep: true,
      handler: function(){
        this.popError();
      }
    }
  },
  methods: {
    popError: function(){
      if ( _.isArray( this.error ) && this.error.length ) {
        this.popNext();
      }
    },
    // 10 秒后切换到下一个错误提示
    popNext: function(){
      if ( !this.error.length ) {
        this.isErrPopping = false;
        return false;
      }
      this.isErrPopping = true;
      this.errMsg = this.error.pop();
      clearTimeout(this.errPopBuffer);
      this.errPopBuffer = setTimeout(this.popNext.bind(this), 10000);
    }
  },
  ready: function(){
    // setInterval(function(){
    //   this.loading = !this.loading;
    // }.bind(this), 2000);
  }

});
