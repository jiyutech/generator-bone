'use strict';

const qs = require('qs');
const logger = require('../logger')('WeChat Utils:');

module.exports = {
  // 判断请求是否在微信中
  isWeChatUA: function( ua ){
    return (ua || '').toLowerCase().indexOf('micromessenger') != -1;
  },
  // 生成授权登录URL
  oauth2Callback: function( returnUrl, args ){
    args = args || {};
    var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?'+ qs.stringify({
      'appid': args.appId,
      'redirect_uri': this.pureUrl( returnUrl ),
      'response_type': 'code',
      'scope': args.scope || 'snsapi_base',
      'state': args.state || 'anonymous',
      'component_appid': args.componentAppId, // 三方授权用
    }) + '#wechat_redirect';
    logger.info('WX Redirect to: '+ url);
    return url;
  },
  // 剔除URL中的code和state参数
  pureUrl: function ( url ){
    var q;
    if ( /.+?(\?.*)/.test(url) ) {
      q = qs.parse( RegExp.$1.slice(1) );
    }
    else {
      return url;
    }
    delete q.code;
    delete q.state;
    return url.replace(/\?.*/,'') +'?'+ qs.stringify(q);
  },
};
