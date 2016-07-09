'use strict';

var $ = window.$,
    win = $(window),
    doc = $(document),
    callbacks = [],
    buffer;

$(window,'body').on('scroll touchmove', function(){
  clearTimeout(buffer);
  if ( doc.scrollTop() + win.height() > (doc.height()-20) ) {
    buffer = setTimeout(function(){
      callbacks.forEach(function(c){ c(); });
    }, 200);
  }
});

module.exports = function onHitBottom( callback ){
  callbacks.push(callback);
};
