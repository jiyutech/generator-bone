'use strict';

module.exports = function( type ){
  return function *(next){
    // 指定请求返回类型，以配合error-handler做相应处理
    this.response.type = type || 'html';
    yield next;
  };
};
