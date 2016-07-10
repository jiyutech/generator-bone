'use strict';

/*
  Simple Controller Helper Object API
  c: {
    env: dev | prod | test, // 运行环境
    conf: fullSiteConf, // 配置
    request: Object, // 包装后的co-request
    render: Function, // 渲染 html
    logger: like `console` Object, // 日志类实例
  };
*/
module.exports = function( c ){
  return function *(next){
    // 指定请求返回类型，以配合error-handler做相应处理
    c.logger.log('Wrapped middleware works fine.');
    yield next;
  };
};
