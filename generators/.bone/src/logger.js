'use strict';

const _ = require('lodash');
const conf = require('./getconf')();

// TODO 根据当前env的不同采取不同执行策略，处理服务端和客户端差异
const Logger = function( prefix ){
  return {
    prefix: prefix,
    resolve: function(){
      var args = _.toArray(arguments);
      if ( this.prefix ) { args.unshift(this.prefix +':'); }
      return args;
    },
    log: function(){
      return console.log.apply(console, this.resolve.apply( this, arguments ));
    },
    info: function(){
      return console.info.apply(console, this.resolve.apply( this, arguments ));
    },
    warn: function(){
      return console.warn.apply(console, this.resolve.apply( this, arguments ));
    },
    error: function(){
      return console.error.apply(console, this.resolve.apply( this, arguments ));
    },
    debug: function(){
      if ( conf.debug ) {
        return console.log.apply(console, this.resolve.apply( this, arguments ));
      }
    }
  };
};

module.exports = Logger;
