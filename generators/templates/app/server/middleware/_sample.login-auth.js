'use strict';

var qs = require('qs');

module.exports = function *(next){

  this.redirectToLogin = function(){
    this.redirect( '/login?'+ qs.stringify({
      'return': this.protocol+'://'+this.host+this.url
    }) );
  };

  if ( !this.cookie.loginToken.value ) {
    return this.redirectToLogin();
  }

  yield next;
};
