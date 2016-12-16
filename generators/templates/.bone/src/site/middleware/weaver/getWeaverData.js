'use strict';
const parse = require('co-body');
const _ = require('lodash');

module.exports = function*() {
  let param = yield parse.form(this.request);
  var paInfo = this.weaverFn.getListDataByPagination(param.key,param.pageNumber,param.pageSize);
  this.body = {
    errCode:0,
    data:this.renderMixin.weaverResult[param.key],
    paInfo:paInfo
  };
};