'use strict';

/*
  TODO
*/

module.exports = function( conf ){
  return function *(next){

    this.cookie  = {};

    this.cookie.customerId = {
      'key': 'cstmid',
      'singed': false,
      'value': ''
    };
    this.cookie.customerId.value = this.cookies.get(
      this.cookie.customerId.key,
      this.cookie.customerId.signed
    );

    this.cookie.loginToken = {
      'key': 'cstmt',
      'singed': true,
      'value': ''
    };
    this.cookie.loginToken.value = this.cookies.get(
      this.cookie.loginToken.key,
      this.cookie.loginToken.signed
    );

    yield next;
  };
};
