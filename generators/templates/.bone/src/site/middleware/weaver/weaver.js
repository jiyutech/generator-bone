'use strict';
/**
 * [weaver the middleware is uesd to get data form weaver]
 * [usage weaver([id1,id2])
 * ps 1.if parameter id include 'all',it will be replaced by idList , it means you will get all data
 */
var request = require('co-request');
var weaverTrigger = require('./weaver-trigger.js');
const _ = require('lodash');
const co = require('co');
var config = {
  defaultLang: 'zh',
  weaverHostName: 'http://sta.weaver.jiyu.tech',
  env: 'prod',
  sync: false
};
const weaverUrl = config.weaverHostName + '/tail/api/getValue?';
const jsonFileHandle = require('./jsonFile.js')();
const boneInfo = require(process.cwd() + '/package.json');

var weaverContext = {};
var packageContext = {};
var lastUpdate = 0;
var isRequesting = false;
var firstGetDataTimeOut;
var ids = [];
var commonIds = [];
var jsonFilePath = process.cwd() + '/weaver-data.json';

jsonFileHandle.initFile(jsonFilePath, {});
weaverContext = jsonFileHandle.readJsonFile(jsonFilePath);

var _validateConfig = function(config) {
  if (!config.mrechant) {
    console.error('weaver配置中缺少mrechant');
    return false;
  }
  return true;
};

var weaver = function() {
  //compatible 确保idList为array,idList为当前路由的所有key
  var idList = _.flattenDeep(arguments);
  var temporaryIdList = _.flattenDeep(arguments[1]);
  //合并所有用到的id,除了all,ids为本站点用到的所有的key
  ids = _.union(ids, _.difference(idList, ['all']));
  //设置定时去获取第一次数据，只会在所有id加载结束后去获取
  try {
    clearTimeout(firstGetDataTimeOut);
    firstGetDataTimeOut = setTimeout(getWeaverContext, 100);
  } catch (e) {
    console.error(e);
  }

  var fn = {};
  fn.getWeaverContext = getWeaverContext;
  /**
   * [nowTime 获取当前时间，Unix时间戳](private)
   * @return {[type]} [description]
   */
  var nowTime = function() {
    return parseInt((new Date()).getTime() / 1000, 10);
  };

  /**
   * [getFilterParam 获取对象中所有key为filter_开头的对象，组成一个新的对象]
   * @param  {[type]} query [源对象]
   * @return {[type]}       [新的对象]
   */
  var getFilterParam = function(query) {
    var filterValue = {};
    _.forEach(query, function(v, k) {
      if (/^filter_/.test(k)) {
        let filterKey = _.camelCase(k.replace('filter_', ''));
        filterValue[filterKey] = v;
      }
    });
    return filterValue;
  };

  var divideWeaverDataByLang = function(weaverData) {
    var res = {};
    _.forEach(weaverData, function(data, key) {
      try {
        // list数据
        if (_.isArray(data)) {
          _.forEach(data, function(list) {
            _.forEach(list.value, function(value, lang) {
              res[lang] = res[lang] || {};
              res[lang][key] = res[lang][key] || [];
              res[lang][key].push(_.extend({ $indexId: list.schemaId }, value));
            });
          });
        } else if (data.value) { // default数据
          _.forEach(data.value, function(value, lang) {
            res[lang] = res[lang] || {};
            res[lang][key] = value;
          });
        }
      } catch (e) {
        console.error(e);
      }
    });
    return res;
  };

  var addToWeaverContext = function(data) {
    _.forEach(data, function(everyLangData, lang) {
      weaverContext[lang] = _.assignIn({}, weaverContext[lang], everyLangData);
    });
  };

  /**
   * [getWeaverContext 获取ids里面所有的数据，使用post方式](private)
   * @return {[empty]} [null]
   */
  function getWeaverContext(once) {
    co(function*() {
      console.log('send request');
      console.log(new Date());
      isRequesting = true;
      try {
        var result = yield request.post({
          uri: weaverUrl,
          method: 'POST',
          json: {
            id: ids,
            boneVersion: boneInfo.boneVersion,
            lastUpdate: lastUpdate,
            mrechant: config.mrechant
          }
        });
        isRequesting = false;
        lastUpdate = nowTime();
        if (result && result.statusCode == 200) {
          if (!result.body.errCode) {
            let res = divideWeaverDataByLang(result.body.data);
            addToWeaverContext(res);
            _.extend(packageContext, result.body.packageInfo);
            jsonFileHandle.saveJsonFile(jsonFilePath, weaverContext);
          } else {
            console.error(result.body.errCode);
          }
        }
      } catch (e) {
        console.log(e);
      }
    });
  }

  /**
   * [get 获取指定key的数据]
   * @param  {[String]} key [获取数据的key]
   * @return {[Object]}
   */
  fn.get = function(key) {
    return this.renderMixin.weaverResult[key];
  };

  /**
   * [set 设定指定key的数据]
   * @param  {[String]} key [获取数据的key]
   * @param {[Object]} object [数据]
   */
  fn.set = function(key, object) {
    if (!this.renderMixin.weaverResult[key]) return false;
    return this.renderMixin.weaverResult[key] = object;
  };

  /**
   * [getListData 获取指定区域的数据（slice），数据会自动绑定到weaverResult上](public)
   * @param  {[type]} key   [获取数据的key]
   * @param  {[type]} start [开始的位置（>=0）]
   * @param  {[type]} end   [结束的位置]
   * @return {[type]}       [区域数据]
   */
  fn.getListData = function(key, start, end, filterValue) {
    if (!this.renderMixin.weaverResult[key]) return;
    var filterData = [];
    if (filterValue) {
      filterData = this.weaverFn.getDataFromListByFields(key, filterValue);
    } else {
      filterData = this.renderMixin.weaverResult[key];
    }
    this.renderMixin.weaverResult[key] = filterData.slice(start, end);
    return {
      start: start,
      end: end,
      totalNumber: parseInt(filterData.length, 10)
    };
  };

  /**
   * [getListDataByPagination 通过分页来获取数据，数据会自动绑定到weaverResult上，内部的获取数据的实现是调用了getListData](public)
   * @param  {[type]} key        [获取数据的key]
   * @param  {[type]} pageNumber [页码(>=1)]
   * @param  {[type]} pageSize   [每页数量]
   * @return {[type]}            [分页信息]
   */
  fn.getListDataByPagination = function(key, pageNumber, pageSize, filterValue) {
    if (!this.renderMixin.weaverResult[key]) return;
    var res = fn.getListData.call(this, key, (pageNumber - 1) * pageSize, pageNumber * pageSize, filterValue);
    let totalNumber = res.totalNumber;
    let totalPages = Math.ceil(totalNumber / pageSize);
    return {
      totalNumber: parseInt(totalNumber, 10),
      totalPages: parseInt(totalPages, 10),
      pageNumber: parseInt(pageNumber, 10),
      pageSize: parseInt(pageSize, 10)
    };
  };

  /**
   * [getDataFromListByID 获取到指定key下的指定id的数据，只可以用于List数据，因为只有List才有id（$indexId）](public)
   * @param  {[String]} key      [keyName]
   * @param  {[int]} $indexId    [id]
   * @return {[Object]}          [data]
   */
  fn.getDataFromListByID = function(key, $indexId) {
    var datas = this.renderMixin.weaverResult[key];
    var res = _.find(datas, function(o) {
      return o.$indexId == $indexId;
    });
    this.renderMixin.weaverResult[key] = res;
    return res;
  };

  fn.getDataFromListByFieldName = function(key, fieldName, fieldValue) {
    var datas = this.renderMixin.weaverResult[key];
    return _.find(datas, function(o) {
      return o[fieldName].toUpperCase() == fieldValue.toUpperCase();
    });
  }

  /**
   * [getDataFromListByFields 多条件筛选]
   * @param  {[type]} key         [key]
   * @param  {[type]} filterValue [删选条件]
   * @return {[type]}             [description]
   */
  fn.getDataFromListByFields = function(key, filterValue) {
    var datas = this.renderMixin.weaverResult[key];
    var filterData = [];
    _.forEach(datas, function(v, k) {
      _.every(filterValue, function(d, o) {
        if (!_.isArray(d)) d = [d];
        return _.includes(d, v[o]);
      }) && filterData.push(v);
    });
    return filterData;
  };

  /**
   * [changeLang 修改语言](public)
   * @param  {[String]} newLang [新的语言简写]
   * @return {[bool]}         [true]
   */
  fn.changeLang = function(newLang) {
    this.cookies.set('lang', newLang);
    return true;
  };

  /**
   * [getPreId 获取指定id的前一个数据，这里的前一个是指数组里位置前一个，无所谓时间顺序，这个交由开发者判断]
   * @param  {[type]} key [description]
   * @param  {[type]} id  [description]
   * @return {[type]}     [description]
   */
  fn.getPreId = function(key, id) {
    var datas = this.renderMixin.weaverResult[key];
    var index = -1;
    //获取id在当前数据的序号
    _.find(datas, function(o, k) {
      if (o.$indexId == id) {
        index = k;
        return true;
      }
      return false;
    });
    if (index != -1 && datas[index - 1]) {
      return datas[index - 1].$indexId;
    } else {
      return false;
    }
  };

  /**
   * [getAfterId 获取指定id的后一个数据，这里的前一个是指数组里位置后一个，无所谓时间顺序，这个交由开发者判断]
   * @param  {[type]} key [description]
   * @param  {[type]} id  [description]
   * @return {[type]}     [description]
   */
  fn.getAfterId = function(key, id) {
    var datas = this.renderMixin.weaverResult[key];
    var index = -1;
    //获取id在当前数据的序号
    _.find(datas, function(o, k) {
      if (o.$indexId == id) {
        index = k;
        return true;
      }
      return false;
    });
    if (index != -1 && datas[index + 1]) {
      return datas[index + 1].$indexId;
    } else {
      return false;
    }
  };

  fn.removeTemporaryId = function() {
    _.forEach(temporaryIdList, function(o) {
      delete this.renderMixin.weaverResult[o];
    }.bind(this));
  };

  return function*(next) {
    var params = this.request.query;
    var reqtime = new Date().getTime();
    var weaverResult = {};
    var packageInfo = {};
    var lang = this.query.lang || this.cookies.get('lang') || config.defaultLang;

    idList = _.union(idList, commonIds);

    //自动添加url中的key到idList中
    if (params.key) {
      idList = _.union(idList, _.isArray(params.key) ? params.key : [params.key], commonIds);
    }
    //如果idList中有all则获取本站点所有的id（直接获取ids）
    if (_.indexOf(idList, 'all') != '-1') {
      idList = ids;
    }

    if (config.sync || (params && params.mode == 'dev' && params.expireTime && params.expireTime - reqtime > 0 && params.expireTime - reqtime < 86400000)) {
      //获取所有id的预览数据
      var result = yield request.post({
        uri: weaverUrl,
        method: "POST",
        json: {
          id: idList,
          boneVersion: boneInfo.boneVersion,
          lastUpdate: lastUpdate,
          mode: 'preview',
          mrechant: config.mrechant
        }
      });
      if (result && result.statusCode == 200) {
        if (!result.body.errCode) {
          let res = divideWeaverDataByLang(result.body.data);
          _.extend(weaverResult, res[lang]);
          _.extend(packageInfo, result.body.packageInfo);
        } else {
          console.error(result.body.errCode);
        }
      }
    } else {
      //获取weaver数据和package数据
      _.forEach(idList, function(v) {
        weaverResult[v] = _.cloneDeep(weaverContext[lang][v]);
        packageInfo[v] = _.cloneDeep(packageContext[v]);
      });
    }

    this.weaverFn = {};
    _.forEach(fn, function(d, k) {
      this.weaverFn[k] = d.bind(this);
    }.bind(this));

    this.renderMixin.weaverResult = weaverResult;
    this.renderMixin.packageInfo = packageInfo;
    this.renderMixin.lang = lang;
    this.renderMixin.weaverHostName = config.weaverHostName;

    if (this.query.key) {
      let key = _.camelCase(this.query.key);

      if (this.query.id) {
        this.renderMixin.weaverResult.detailInfo = this.weaverFn.getDataFromListByID(key, this.query.id);
        this.renderMixin.weaverResult[this.query.key] = undefined;
      }
      if (this.query.pn) {
        let filterValue = getFilterParam(this.query);
        this.weaverFn.getListDataByPagination(key, this.query.pn, this.query.ps || 10, filterValue);
      }
      if (this.query.start && this.query.end) {
        let filterValue = getFilterParam(this.query);
        this.weaverFn.getListData(key, this.query.start, this.query.end, filterValue);
      }
    }
    this.weaverFn.removeTemporaryId();
    yield next;
  };
};

weaver.setCommonKey = function(commonIdList) {
  commonIds = commonIdList;
  ids.concat(commonIds);
};

module.exports = function(s, selfConfig) {

  config.env = s.env;

  if (config.env === 'dev') {
    config.sync = true;
  }

  if (selfConfig.proxy) {
    request = request.defaults({ 'proxy': selfConfig.proxy });
  }

  config = _.assignIn(config, selfConfig);

  //保证线上环境一定是异步获取数据
  if (config.env === 'prod') {
    config.sync = false;
  }

  let res = _validateConfig(config);

  s.router.post('/weaverTrigger', weaver(), weaverTrigger);

  s.router.post('/getWeaverData', weaver('all'), require('./getWeaverData.js'));

  if (res) {
    return weaver;
  } else {
    process.exit();
  }

};
