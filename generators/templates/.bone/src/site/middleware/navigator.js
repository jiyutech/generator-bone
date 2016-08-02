'use strict';

const Router = require('koa-router');
const _ = require('lodash');

module.exports = function( navigatorData, options ){

  options = _.assign({
    'parseUrl': false // 是否使用params来解析URL中的``:foo`变量
  }, options || {});

  var urlIndexMap = {};
  var urlCateObjCrumbMap = {};

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
        outputCates = options.parseUrl ? JSON.parse(JSON.stringify(navigatorData.cates)) : navigatorData.cates;

    for( var srcUrl in urlIndexMap ) {
      // /:param/ -> /val/
      var parsedUrl = Router.url( srcUrl, this.params );
      if ( currPath == parsedUrl.replace(/\?.*/,'') && currUrl.indexOf( parsedUrl ) === 0 ) {
        // 保留匹配度更高的条目，例如：当前url是`a?a=1&b=2`，在`/a`和`/a?a=1`中优先匹配后者。
        if ( parsedUrl.length > matchLength ) {
          matchLength = parsedUrl.length;
          currentNavIndex = options.parseUrl ? JSON.parse(JSON.stringify( urlIndexMap[ srcUrl ] )) : urlIndexMap[ srcUrl ];
          currentNavCrumb = options.parseUrl ? JSON.parse(JSON.stringify( urlCateObjCrumbMap[ srcUrl ] )) : urlCateObjCrumbMap[ srcUrl ];
          currentNavCate = currentNavCrumb ? currentNavCrumb.slice(-1)[0] : null;
        }
      }
    }

    // 解析输出数据中的URL
    // /:param/ -> /val/
    if ( options.parseUrl ) {
      handleCates(outputCates.concat(currentNavCrumb).concat([currentNavCate]), function(cate){
        if ( cate.url ) cate.url = Router.url( cate.url, this.params );
      }.bind(this));
    }

    this.renderMixin.navigator = {
      currentNavIndex : currentNavIndex,
      currentNavCrumb : currentNavCrumb,
      currentNavCate : currentNavCate,
      cates: outputCates
    };
    yield next;
  };
};
