'use strict';

module.exports = function( navigatorData ){

  var urlIndexMap = {};
  var urlCateObjCrumbMap = {};

  (function(){
    var geneMap = function(cate, index, indexStack, cateObjStack ){
      indexStack = indexStack ? indexStack.slice(0) : [];
      cateObjStack = cateObjStack ? cateObjStack.slice(0) : [];
      indexStack.push( index );
      cateObjStack.push( cate );
      if ( cate.url ) {
        urlIndexMap[ cate.url ] = indexStack;
        urlCateObjCrumbMap[ cate.url ] = cateObjStack;
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

  return function *(next){
    var currPath = this.path,
        currUrl = decodeURIComponent(this.url),
        currentNavIndex,
        currentNavCate,
        currentNavCrumb,
        matchLength = 0;

    for( var url in urlIndexMap ) {
      if ( currPath == url.replace(/\?.*/,'') && currUrl.indexOf( url ) === 0 ) {
        // 保留匹配度更高的条目，例如：当前url是`a?a=1&b=2`，在`/a`和`/a?a=1`中优先匹配后者。
        if ( url.length > matchLength ) {
          matchLength = url.length;
          currentNavIndex = urlIndexMap[ url ];
          currentNavCrumb = urlCateObjCrumbMap[ url ];
          currentNavCate = currentNavCrumb.slice(-1)[0];
        }
      }
    }

    if ( !this.renderMixin ) this.renderMixin = {};
    this.renderMixin.navigator = {
      currentNavIndex : currentNavIndex,
      currentNavCrumb : currentNavCrumb,
      currentNavCate : currentNavCate,
      cates: navigatorData.cates
    };
    yield next;
  };
};
