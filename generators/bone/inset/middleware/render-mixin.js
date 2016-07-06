'use strict';


module.exports = function *(next){
  // renderMixin中的参数将会被混入到渲染数据中（window.data）
  this.renderMixin = {};
  yield next;
};
