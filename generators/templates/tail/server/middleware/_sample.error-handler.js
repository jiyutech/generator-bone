'use strict';

// const co = require('co');

module.exports = function *(next){
  try {
    yield next;
  }
  catch(e) {
    // 未登录状态截获（ 通过this.throw(401)抛出 ）
    if ( e.status == 401 ) {
      // 若为HTML页面，则重定向至登陆页
      if ( this.response.is('html') && this.redirectToLogin ) {
        return this.redirectToLogin();
      }
    }

    // 抛出不处理的错误
    throw e;
  }
};
