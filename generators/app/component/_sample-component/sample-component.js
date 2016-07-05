'use strict';
var Vue = window.Vue;

module.exports = Vue.component( 'sample-component', {
  template: require('./sample-component.html'),
  replace: false,

  data: function(){
    return {
      'greetingsFromVueComponent': 'Greetings from Vue Component'
    };
  },
  props: []
});
