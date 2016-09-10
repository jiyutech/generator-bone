'use strict';
var Vue = window.Vue;
var $ = window.$;
var _ = window._;

module.exports = Vue.component('selectplus-multi', {
  template: require('./selectplus-multi.html'),
  replace: false,
  data: function() {
    return {
      showDropDown: false,
      selectValue: [],
      seach: '',
      seachOptions: [],
      // selectOptions: [],
      inputBorder: '0',
      placeHolder: '',
      inputWidth: '100',
      outComponent: '0',
      hasResultClass: true,
      noResultClass: false,
      showUpClass: false,
      showDownClass: true,
      isDropDownFlipped: false,
      checkBoxHeight: '',
      // compHeight: '',
    };
  },
  props: {
    options: {
      type: Array
    },
    value: {
      twoWay: true
    },
    valueKey: {
      type: String
    },
    labelKey: {
      type: String
    },
    placeholder: {
      type: String
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
  computed: {
    selectOptions: function() {
      var temp = [];
      for (var i = 0; i < this.seachOptions.length; i++) {
        for (var k = 0; k < this.selectValue.length; k++) {
          if (this.selectValue[k] == this.seachOptions[i]) {
            temp[i] = '#e8e8e8';
            break;
          } else {
            temp[i] = '#fff';
          }
        }
      }
      return temp;
    },

    outPlaceHolder: function() {
      return this.selectValue.length === 0 && this.outComponent;
    }
  },
  methods: {
    // toTopDistance: function() {
    //   var e = this.$el;
    //   var offset = e.offsetTop;
    //   // var scrollTop = document.body.scrollTop;
    //   while (e.offsetParent !== null) {
    //     e = e.offsetParent;
    //     offset += e.offsetTop;
    //   }
    //   var result = offset;
    //   return result;
    // },
    chooseAll: function() {
      for (var i = 0; i < this.seachOptions.length; i++) {
        var id = this.seachOptions[i][this.valueKey];
        if (this.value.indexOf(id) == -1) this.value.push(id);
      }
      this.selectValue = this.seachOptions.slice(0);
      this.getFoucus();
    },
    invertSelect: function() {
      for (var i = 0; i < this.seachOptions.length; i++) {
        var id = this.seachOptions[i][this.valueKey];
        var index = this.value.indexOf(id);
        if (index == -1) this.value.push(id);
        else this.value.splice(index, 1);
      }
      this.selectValue = _.filter(this.seachOptions, function(o) {
        return this.value.indexOf(o[this.valueKey]) != -1;
      }.bind(this));
      this.getFoucus();
    },
    changeSelectValue: function(option) {
      for (var i = 0; i < this.value.length; i++) {
        //value-当前选择 option-所有的可选择值
        if (this.value[i] == option[this.valueKey]) {
          this.value.splice(i, 1);
          this.selectValue.splice(i, 1);
          this.getFoucus();
          return;
        }
      }
      console.log(1);
      this.value.push(option[this.valueKey]);
      this.selectValue.push(option);
      this.getFoucus();
    },
    getFoucus: function() {
      this.$el.getElementsByTagName('input')[0].focus();
    },
    // scrollDropDown: function() {
    //   var visiHeight = document.documentElement.clientHeight;
    //   var scrollTop = document.body.scrollTop;
    //   if (visiHeight - this.toTopDistance() + scrollTop < this.compHeight) {
    //     var offsetY = this.toTopDistance() - visiHeight + this.compHeight;
    //     $('body').animate({
    //       scrollTop: offsetY
    //     }, 300);
    //   }
    // },
    inputFocus: function() {
      this.inputBorder = 1;
      // this.scrollDropDown();
      //exist value
      if (this.selectValue.length > 0) {
        this.inputWidth = 10;
        this.placeHolder = '';
      }
      //not exist value
      else {
        this.placeHolder = this.placeholder;
        this.inputWidth = 100;
      }
    },

    //根据输入款过滤下拉列表选项
    filterSeachOptions: function() {
      //获取输入框中内容并过滤
      var k = 0;
      var temp = [];
      this.hasResultClass = true;
      this.noResultClass = false;
      for (var i = 0; i < this.options.length; i++) {
        if (this.options[i][this.labelKey].indexOf(this.seach) != -1) {
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
    getSelectValue: function() {
      //有标签的情况
      var temp = [];
      for (var i = 0; i < this.value.length; i++) {
        for (var k = 0; k < this.options.length; k++) {
          if (this.options[k][this.valueKey] == this.value[i]) {
            temp.push(this.options[k]);
          }
        }
      }
      this.selectValue = temp;
      this.checkBoxHeight = this.$els.checkBox.getBoundingClientRect().height;
      // this.compHeight = Number(this.dropDownHeight.split('px')[0]) + this.checkBoxHeight + 35;
      if (this.selectValue.length > 0) {
        this.inputWidth = 10;
        this.placeHolder = '';
      }
      //not exist value
      else {
        this.placeHolder = this.placeholder;
        this.inputWidth = 100;
      }
    },
    locateDropDown: function() {
      //下方空间不足时下拉框翻转
      this.showUpClass = false;
      this.showDownClass = true;
      this.isDropDownFlipped = false;
      var checkboxRect = this.$els.checkBox.getBoundingClientRect();
      var dropDownRect = this.$els.dropDown.getBoundingClientRect();
      if (
        (document.documentElement.clientHeight - checkboxRect.top - checkboxRect.height) < dropDownRect.height &&
        (checkboxRect.height + dropDownRect.height) < document.documentElement.clientHeight
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
    'checkBoxHeight': 'locateDropDown',
    // 'compHeight': 'scrollDropDown'
  },
  beforeCompile: function() {
    this.filterSeachOptions();
  },
  ready: function() {
    //监听点击事件
    this.getSelectValue();
    document.addEventListener('click', function(event) {
      var ele = event.target;
      var component = this.$el;
      var tagName = this.$el.getElementsByClassName('tagName')[0];
      if (ele == tagName) {
        return;
      }
      while (ele && ele != document.body) {
        if (ele.parentNode == component) {
          //点击事件在组件内
          this.outComponent = 0;
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
      this.outComponent = 1;
    }.bind(this), true);
  }
});
