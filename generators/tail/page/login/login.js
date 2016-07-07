'use strict';
var _ = window._;
var $ = window.$;

new Vue({
  el: '#content',
  template: '#template',
  replace: false,
  data: _.extend(window.data,{
    loading: false,
    errMsg: '',
    username: '',
    password: ''
  }),
  computed: {
    formPass: function(){
      return this.username != '' && this.password != '';
    }
  },
  methods: {
    login: function(){
      this.errMsg = '';
      if ( !this.loading && this.formPass ) {
        this.loading = true;
        $.post( this.conf.ClientDCAPIBasePath+ '/operator-login', {
          username: this.username,
          password: this.password
        })
        .done(function( res ){
          this.loading = false;
          if ( res ) {
            if ( res.err ) {
              this.errMsg = res.msg;
            }
            else {
              this.afterLogin();
            }
          }
        }.bind(this))
        .fail(function( res ){
          this.loading = false;
          this.errMsg = '网络错误，请稍后重试';
        }.bind(this));
      }
    },
    afterLogin: function(  ){
      location.href = this.query.return || '/';
    }
  },
  ready: function(){
    // $.get( this.conf.ClientDCAPIBasePath+ '/operator-login' );
  }
});
