'use strict';

var _ = window._;
var $ = window.$;

var qs = require('qs');

function errorToMessage( res ){
  var msg = '未知错误';
  if ( res && res.status == 401 ) {
    msg = '登录状态过期，请<a href="'+ window.data.sitePrefix +'/mch/'+ window.data.mchId +'/login?return='+ encodeURIComponent(location.href) +'">重新登录</a>';
  }
  else if ( res && res.responseJSON ) {
    try{
      msg = res.responseJSON.error || res.responseJSON.msg || res.responseJSON.errorMessage;
    } catch(e) { msg = '系统错误，请反馈给开发者'; }
  }
  else {
    msg = '网络错误，请检查网络';
  }
  return msg;
}

var Model = function ( args ){

  this.api = '';

  this.get = function( args ){
    Model.loadingStack.push(1);
    return $.get( this.api +'?'+ qs.stringify(args) ).always(function(){
      Model.loadingStack.pop();
    }).fail(function(res){
      Model.errorStack.push( errorToMessage(res) );
    });
  };

  this.delete = function( args ){
    Model.loadingStack.push(1);
    return $.ajax({
      url: this.api +'?'+ qs.stringify(args),
      type: 'DELETE'
    }).always(function(){
      Model.loadingStack.pop();
    }).fail(function(res){
      Model.errorStack.push( errorToMessage(res) );
    });
  };

  this.post = function( data ){
    Model.loadingStack.push(1);
    return $.ajax({
      url: this.api,
      type: 'POST',
      data: {
        data: JSON.stringify(data)
      }
    }).always(function(){
      Model.loadingStack.pop();
    }).fail(function(res){
      Model.errorStack.push( errorToMessage(res) );
    });
  };

  this.put = function( data ){
    Model.loadingStack.push(1);
    return $.ajax({
      url: this.api,
      type: 'PUT',
      data: {
        data: JSON.stringify(data)
      }
    }).always(function(){
      Model.loadingStack.pop();
    }).fail(function(res){
      Model.errorStack.push( errorToMessage(res) );
      console.log(Model.errorStack);
    });
  };

  if ( typeof args == 'string' ) {
    this.api = args;
  }
  else {
    _.extend(this, args || {});
  }

};


Model.loadingStack = [];
Model.errorStack = [];

function getFactory( method ) {
  return function( url, options ){
    Model.loadingStack.push(1);
    return $.ajax( _.extend( {
      url: url,
      type: method || 'GET',
    }, options || {}) ).always(function(){
      Model.loadingStack.pop();
    }).fail(function(res){
      Model.errorStack.push( errorToMessage(res) );
    });
  };
}

function postFactory( method ) {
  return function( url, data, options ){
    Model.loadingStack.push(1);
    return $.ajax(_.extend( {
      url: url,
      type: method || 'POST',
      data: data ? JSON.stringify(data) : '',
      dataType: 'json',
      contentType: 'application/json; charset=UTF-8'
    }, options || {}) ).always(function(){
      Model.loadingStack.pop();
    }).fail(function(res){
      Model.errorStack.push( errorToMessage(res) );
    });
  };
}

Model.get = getFactory('GET');
Model.post = postFactory('POST');
Model.put = postFactory('PUT');
Model.patch = postFactory('PATCH');
Model.delete = getFactory('DELETE');

module.exports = Model;
