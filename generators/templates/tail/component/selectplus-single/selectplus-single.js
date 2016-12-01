'use strict';
var Vue = window.Vue;
// var Select2 = require('select2');



module.exports = Vue.component('selectplus-single', {
  template: require('./selectplus-single.html'),
  replace: false,

  data: function() {
    return {
      showDropDown: false,
      selectValue: '',
      seach: '',
      seachOptions: [],
      // selectOptions: [],
      outComponent: true,
      hasResultClass: true,
      noResultClass: false,
      showUpClass: false,
      showDownClass: true,
      isDropDownFlipped: false,
      checkBoxHeight: '',
      activeOption:''
    };
  },
  props: {
    options: {
      type: Array
    },
    value: {
      twoWay: true,
    },
    valueKey: {
      type: String
    },
    labelKey: {
      type: String
    },
    placeholder: {
      type: String,
      default:'select a state'
    },
    noResult: {
      type: String,
      default: '无结果'
    },
    dropDownHeight: {
      type: String,
      default: '300px'
    }

  },
  methods: {
    getSelectValue: function() {
      //有标签的情况
      var temp;
      for (var k = 0; k < this.options.length; k++) {
        if (this.options[k][this.valueKey] == this.value) {
          temp = this.options[k];
        }
      }
      this.selectValue = temp;
    },
    filterSeachOptions: function() {
      //获取输入框中内容并过滤
      var k = 0;
      var temp = [];
      this.hasResultClass = true;
      this.noResultClass = false;
      for (var i = 0; i < this.options.length; i++) {
        if (this.options[i][this.labelKey].toLowerCase().indexOf(this.seach.toLowerCase()) != -1) {
          temp[k] = this.options[i];
          k++;
        }
      }
      //没有搜索结果
      if (k === 0) {
        var object = new Object();
        object[this.labelKey] = this.noResult;
        temp.push(object);
        this.hasResultClass = false;
        this.noResultClass = true;
      }
      this.seachOptions = temp;
    },
    changeSelectValue:function(index){
      if (this.seachOptions[0][this.labelKey] === this.noResult) {
        return;
      }
      this.value=this.seachOptions[index][this.valueKey];
      this.activeOption=this.value;
      this.showDropDown = false;
      this.outComponent = true;
    },
    locateDropDown: function() {
      //下方空间不足时下拉框翻转
      this.showUpClass = false;
      this.showDownClass = true;
      this.isDropDownFlipped = false;
      var selectRect = this.$els.select.getBoundingClientRect();
      var dropDownRect = this.$els.dropDown.getBoundingClientRect();
      if (
        (document.documentElement.clientHeight - selectRect.top - selectRect.height) < dropDownRect.height &&
        (selectRect.height + dropDownRect.height) < document.documentElement.clientHeight
      ) {
        this.showUpClass = true;
        this.showDownClass = false;
        this.isDropDownFlipped = true;
      } else {
        this.showUpClass = false;
        this.showDownClass = true;
        this.isDropDownFlipped = false;
      }
    }
  },
  watch: {
    'seach': 'filterSeachOptions',
    'value': 'getSelectValue',
  },
  beforeCompile: function() {
    this.filterSeachOptions();
  },
  ready: function() {
    this.getSelectValue();
    document.addEventListener('click', function(event) {
      var ele = event.target;
      var component = this.$el;
      if (this.$els.select == ele) {
        if (this.showDropDown) {
          this.showDropDown = false;
          this.outComponent = true;
          return;
        }
      }
      while (ele && ele != document.body) {
        if (ele.parentNode == component) {
          //点击事件在组件内
          this.outComponent = false;
          this.$nextTick(function() {
            this.$el.getElementsByTagName('input')[0].focus();
            this.locateDropDown();
          });
          this.showDropDown = true;
          return;
        }
        ele = ele.parentNode;
      }
      //点击事件在组件外
      this.showDropDown = false;
      this.outComponent = true;
    }.bind(this), true);

  }
});
