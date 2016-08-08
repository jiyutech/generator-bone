'use strict';
// base on Vue 1.x

var _ = window._;
var Vue = window.Vue;
var $ = window.jQuery;

module.export = Vue.directive('multicheck', (function(){

  function getVal() {
    if ( this.params && this.params.value !== undefined ) {
      return this.params.value;
    }
    if ( this.el.tagName == 'INPUT' ) {
      return this.el.value;
    }
    else {
      var val = this.el.getAttribute('value');
      if ( val === undefined || val === null ) {
        val = this.el.innerText;
      }
      return val;
    }
  }

  function up( val, checked ){
    var data = this.vm.$get( this.expression );
    var index = data.indexOf( val );
    if ( checked ) {
      if ( index == -1 ) {
        data.push( val );
      }
    }
    else {
      if ( index != -1 ) {
        data.splice( index, 1 );
      }
    }
  }

  function toggle( val ){
    var data = this.vm.$get( this.expression );
    var index = data.indexOf( val );
    if ( index > -1 ) {
      data.splice( index, 1 );
    }
    else {
      data.push( val );
    }
  }

  return {
    params: ['value'],
    bind: function () {
      var startVal = this.vm.$get( this.expression );
      if ( startVal == undefined ) {
        this.vm.$set( this.expression, [] );
      }
      else if ( !_.isArray( startVal )  ) {
        throw 'multicheck指令必须传入数组类型的数据';
      }

      if ( this.el.tagName == 'INPUT' ) {
        this._inputChangeHandler = function(e){
          up.call(this, getVal.call(this), this.el.checked )
        }.bind(this);
        this.el.addEventListener('change', this._inputChangeHandler);
      }
      else {
        this._inputClickHandler = function(e){
          toggle.call(this, getVal.call(this) );
        }.bind(this);
        this.el.addEventListener('click', this._inputClickHandler);
      }
    },
    update: function (val, oldValue) {
      if ( _.isArray( this.vm.$get( this.expression ) ) ) {
        if ( this.el.tagName == 'INPUT' ) {
          var checked = this.vm.$get( this.expression ).indexOf( getVal.call(this) ) != -1;
          if ( checked != this.el.checked ) this.el.checked = checked;
        }
      }
    },
    unbind: function () {
      this.el.removeEventListener(
        this.el.tagName == 'INPUT' ? 'change' : 'click',
        this.el.tagName == 'INPUT' ? this._inputChangeHandler : this._inputClickHandler
      );
    }
  };
})() );
