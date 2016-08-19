'use strict';
var Vue = window.Vue;
// var Select2 = require('select2');



module.exports = Vue.component('selectplus-multi', {
  template: require('./selectplus-multi.html'),
  replace: false,

  data: function() {
    return {
        dropDown:'none',
        selectValue:[],
        seach:'',
        seachOptions:[],
        isSelected:[],
        inputBorder:'0',
        placeHolder:'',
        inputWidth:'100',
    };
  },
  props: {
    options:{
      type:Array
    },
    value:{
      twoWay: true
    },
    valueKey:{
      type:String
    },
    labelKey:{
      type:String
    },
    placeholder:{
      type:String
    }
  },
  computed: {
    isSelected:function(){
      var temp=[];
      for (var i = 0; i < this.seachOptions.length; i++) {
        for (var k = 0; k < this.selectValue.length; k++) {
          if (this.selectValue[k] == this.seachOptions[i]) {
              temp[i] = '#e8e8e8';
              break;
          }
          else {
            temp[i] = '#fff';
          }
        }
      }
      return temp;
    },

  },
  methods: {
    chooseAll:function(){
      var temp = [];
      for (var i = 0; i < this.seachOptions.length; i++) {
        temp[i]= this.seachOptions[i][this.valueKey];
        this.value = temp;
      }
      this.selectValue = this.seachOptions.slice(0);
      this.getFoucus();
    },
    invertSelect:function(){
      var temp = this.value.slice(0);
      this.chooseAll();
      for (var i = 0; i < temp.length; i++) {
        for (var k = 0; k < this.value.length; k++) {
          if (temp[i] == this.value[k]) {
            this.value.splice(k,1);
            this.selectValue.splice(k,1);
          }
        }
      }
      this.dropDown = 'block';
      this.seach = '';
      this.inputBorder = 1;
      //exist value
      if (this.value.length > 0) {
        this.inputWidth = 10;
        this.placeHolder = '';
      }
      //not exist value
      else {
        this.placeHolder = this.placeholder;
        this.inputWidth = 100;
      }
      if (this.seachOptions.length === 0) {

      }
    },
    changeSelectValue:function(option){
      for (var i = 0; i < this.value.length; i++) {
        //value-当前选择 option-所有的可选择值
        if (this.value[i] == option[this.valueKey]) {
          this.value.splice(i,1);
          this.selectValue.splice(i,1);
          return;
        }
      }
      this.value.push(option[this.valueKey]);
      this.selectValue.push(option);
    },
    getFoucus:function(){
      this.$el.getElementsByTagName('input')[0].focus();
    },
    inputFocus:function(){
        this.dropDown = 'block';
        this.seach = '';
        this.inputBorder = 1;
        //exist value
        if (this.value.length > 0) {
          this.inputWidth = 10;
          this.placeHolder = '';
        }
        //not exist value
        else {
          this.placeHolder = this.placeholder;
          this.inputWidth = 100;
        }
        if (this.seachOptions.length === 0) {

        }
    },
    inputBlur:function(){
      this.inputBorder = 0;
      if (this.value.length !== 0) {
        this.placeHolder = '';
        this.inputWidth = 10;
      }
      else {
        this.placeHolder = this.placeholder;
        this.inputWidth = 100;
      }
    },
    each:function(){
      //强制下拉打开
      this.dropDown = 'block';
      //获取输入框中内容并过滤
      var k = 0;
      var temp = [];
      for (var i = 0; i < this.options.length; i++) {
        if (this.options[i][this.labelKey].indexOf(this.seach) != -1) {
            temp[k] = this.options[i];
            k++;
        }
      }
      if (k === 0) {
        temp[0] = this.seach;
      }
      this.seachOptions = temp;
    },
    getSelectValue:function(){
      //有标签的情况
      this.getFoucus();
      var temp = [];
      for (var i = 0; i < this.value.length; i++) {
        for (var k = 0; k < this.options.length; k++) {
          if (this.options[k][this.valueKey] == this.value[i]) {
              temp.push(this.options[k]);
          }
        }
      }
      this.selectValue = temp;
    }
  },
  watch: {
    'seach':'each',
    'value':'getSelectValue',
  },
  beforeCompile:function(){
    this.each();
    this.getSelectValue();
  },
  ready: function() {
    this.placeHolder = this.placeholder;
    this.dropDown = 'none';
    document.addEventListener('click',function(event){
      var ele = event.target;
      var component = this.$el;
      while (ele != document.body) {
        if (ele.parentNode == component) {
          this.dropDown = 'block';
          break;
        }
        else {
          ele = ele.parentNode;
          this.dropDown = 'none';

        }
      }
    }.bind(this),true);
  }
});
