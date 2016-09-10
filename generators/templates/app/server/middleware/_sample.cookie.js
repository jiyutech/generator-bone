'use strict';

module.exports = function( c ){
  return function *(next){

    this.cookie  = {};
    var mchId = this.params.mchId;
    var tenYearsLater = new Date( Date.now() + 10*365*24*3600000 );


    this.cookie.loginId = {
      'key': c.env +'_'+ mchId +'_cstm_id',
      'singed': false,
      'value': '',
      'expires': tenYearsLater
    };
    this.cookie.loginId.value = this.cookies.get(
      this.cookie.loginId.key,
      this.cookie.loginId.signed
    );

    this.cookie.loginToken = {
      'key': c.env +'_'+ mchId +'_cstm_t',
      'singed': true,
      'value': '',
      'expires': tenYearsLater
    };
    this.cookie.loginToken.value = this.cookies.get(
      this.cookie.loginToken.key,
      this.cookie.loginToken.signed
    );

    yield next;
  };
};
