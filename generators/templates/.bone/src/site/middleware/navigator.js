'use strict';

const Router = require('koa-router');
const _ = require('lodash');

module.exports = function( navigatorData ){

  var urlIndexMap = {};
  var urlCateObjCrumbMap = {};

  function parseUrlParams( url, srcParams ){
    // var paramReg = /\:[^/]+/g;
    // var params = _.extend({}, srcParams);
    // (url.match(paramReg) || []).forEach(function( matchRes ){
    //   var key = matchRes.slice(1);
    //   if ( params[key] === undefined ) params[key] = '';
    // });
    var parsedUrl;
    try {
      parsedUrl = Router.url( url, srcParams );
    }
    catch(e) {
      parsedUrl = url;
    }
    return parsedUrl;
  }

  (function(){
    var geneMap = function(cate, index, indexStack, cateObjStack ){
      indexStack = indexStack ? indexStack.slice(0) : [];
      cateObjStack = cateObjStack ? cateObjStack.slice(0) : [];
      indexStack.push( index );
      cateObjStack.push( cate );
      if ( cate.url ) {
        cate.srcUrl = cate.url;
        urlIndexMap[ cate.srcUrl ] = indexStack;
        urlCateObjCrumbMap[ cate.srcUrl ] = cateObjStack;
      }
      if ( cate.sub ) {
        cate.sub.forEach(function( cate, index ){
          geneMap( cate, index, indexStack, cateObjStack );
        });
      }
    };
    navigatorData.cates.forEach(function( cate, index ){
      geneMap( cate, index, [], [] );
    });
  })();

  var handleCates = function( cates, fn ){
    cates.forEach(function( cate ){
      if ( cate ) {
        fn(cate);
        if ( cate.sub ) handleCates( cate.sub, fn );
      }
    });
  };

  return function *(next){
    var currPath = this.path,
        currUrl = decodeURIComponent(this.url),
        currentNavIndex,
        currentNavCate,
        currentNavCrumb,
        matchLength = 0,
        outputCates = JSON.parse(JSON.stringify(navigatorData.cates));

    for( var srcUrl in urlIndexMap ) {
      // /:param/ -> /val/
      var parsedUrl = parseUrlParams( srcUrl, this.params );
      if ( currPath == parsedUrl.replace(/\?.*/,'') && currUrl.indexOf( parsedUrl ) === 0 ) {
        // 保留匹配度更高的条目，例如：当前url是`a?a=1&b=2`，在`/a`和`/a?a=1`中优先匹配后者。
        if ( parsedUrl.length > matchLength ) {
          matchLength = parsedUrl.length;
          currentNavIndex = JSON.parse(JSON.stringify( urlIndexMap[ srcUrl ] ));
          currentNavCrumb = JSON.parse(JSON.stringify( urlCateObjCrumbMap[ srcUrl ] ));
          currentNavCate = currentNavCrumb ? currentNavCrumb.slice(-1)[0] : null;
        }
      }
    }

    // 解析输出数据中的URL
    // /:param/ -> /val/
    handleCates(outputCates.concat(currentNavCrumb).concat([currentNavCate]), function(cate){
      if ( cate.url ) cate.url = parseUrlParams( cate.url, this.params );
    }.bind(this));

    this.renderMixin.navigator = {
      currentNavIndex : currentNavIndex,
      currentNavCrumb : currentNavCrumb,
      currentNavCate : currentNavCate,
      cates: outputCates
    };
    yield next;
  };
};
