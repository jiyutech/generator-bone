'use strict';
var Vue = window.Vue;

module.exports = Vue.component( '<%= componentName %>', {
  template: require('./<%= componentName %>.html'),
  replace: false,

  data: function(){
    return {
      'greetingsFromVueComponent': 'Greetings from Vue Component'
    };
  },
  props: []
});
