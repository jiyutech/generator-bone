'use strict';
var Vue = window.Vue;
var _ = window._;
var $ = window.$;

require('../../vendor/qiniu/plupload/moxie.js');
require('../../vendor/qiniu/plupload/plupload.dev.js');
require('../../vendor/qiniu/plupload/i18n/zh_CN.js');
require('../../vendor/qiniu/qiniu-ui.js');
require('../../vendor/qiniu/qiniu.js');
require('../../vendor/qiniu/highlight.js');

var cid = 0;

module.exports = Vue.component( 'img-uploader', {
  template: require('./img-uploader.html'),
  replace: true,

  data: function(){
    return {
      'imgObjList': [
        // id: file.id,
        // status: 'added', // 'loading', 'uploaded', 'error'
        // percent: 0,
        // src: '',
        // key: ''
      ],
      'imgRounded': true,
    };
  },
  props: [
    'imgRounded',
    'imgSize',
    'width',
    'height',
    'outputImg',
    'outputImgList',
    'maxLength',
    'uptokenUrl',
    'domain'
  ],
  computed: {
    'isSinglePic': function(){
      return this.maxLength == 1;
    }
  },
  methods: {
    remove: function( o ){
      this.imgObjList = _.reject( this.imgObjList, function(_o){
        return _o.id == o.id;
      });
    },
    moveLeft: function( o ){
      var i = _.findIndex( this.imgObjList, function(_o){
        return _o.id == o.id;
      });
      if ( i > 0 ) {
        var clone = this.imgObjList.slice(0);
        var tmp = clone[i-1];
        clone[i-1] = this.imgObjList[i];
        clone[i] = tmp;
        this.imgObjList = clone;
      }
    },
    moveRight: function( o ){
      var i = _.findIndex( this.imgObjList, function(_o){
        return _o.id == o.id;
      });
      if ( i < this.imgObjList.length-1 && i != -1 ) {
        var clone = this.imgObjList.slice(0);
        var tmp = clone[i+1];
        clone[i+1] = this.imgObjList[i];
        clone[i] = tmp;
        this.imgObjList = clone;
      }
    }
  },
  watch: {
    imgObjList: {
      deep: true,
      handler: function( val, old ){
        // 处理最长长度
        if ( this.maxLength && val.length > this.maxLength ) {
          this.imgObjList = val.slice(0, this.maxLength);
          return ;
        }
        // UI修正
        Vue.nextTick(function(){
          var btn = $(this.$$.pickfiles);
          var el = $(this.$el);
          $(this.$el).find('.moxie-shim').css({
            left: btn.offset().left - el.offset().left,
            top:  btn.offset().top  - el.offset().top
          });
        }.bind(this));
        // 输出修正
        this.outputImgList = _.pluck( _.filter( this.imgObjList, function(o){
          return o.status == 'uploaded';
        }), 'key' );
        // 更新单图
        this.outputImg = this.outputImgList[0];
      }
    },

    // 处理单图场景下，图片从外部变更时的情况
    'outputImg': {
      handler: function(){
        if ( this.outputImg ) {
          this.outputImgList = [this.outputImg];
        }
        else {
          this.outputImgList = [];
        }
        this.imgObjList = [];
        _.forEach(this.outputImgList, function( val, i ){
          this.imgObjList.push({
            id: ++cid,
            status: 'uploaded',
            key: val
          })
        }.bind(this));
      }
    }
  },
  beforeCompile: function(){
    if ( this.imgSize ) {
      this.width = this.height = this.imgSize;
    }
    if ( this.outputImgList ) {
      // Import data from output images at the first time
      if ( this.maxLength ) {
        this.outputImgList = this.outputImgList.slice(0, this.maxLength);
      }
    }
    else {
      this.outputImgList = [];
    }

    if ( this.outputImgList.length ) {
      this.outputImg = this.outputImgList[0];
    }
    else if ( this.outputImg ) {
      this.outputImgList = [this.outputImg];
    }
    else {
      this.outputImgList = [];
    }

    _.forEach(this.outputImgList, function( val, i ){
      this.imgObjList.push({
        id: ++cid,
        status: 'uploaded',
        key: val
      })
    }.bind(this));
  },
  attached: function(){
    // Setup uploader
    var vm = this;
    var uploader = Qiniu.uploader({
      runtimes: 'html5,flash,html4',
      browse_button: this.$$['pickfile'+ (this.isSinglePic ? '':'s')],
      container: this.$$.container,
      drop_element: this.$$.container,
      max_file_size: '100mb',
      flash_swf_url: '/static/vendor/qiniu/plupload/Moxie.swf',
      dragdrop: true,
      chunk_size: '4mb',
      unique_names: true,
      save_key: true,
      uptoken_url: '/uptoken',
      domain: this.domain,
      auto_start: true,
      init: {
        'FilesAdded': function(up, files) {
          _.forEach(files, function( file ){
            var o = {
              id: file.id,
              status: 'added',
              percent: 0,
              src: '',
              key: ''
            };
            var reader = new FileReader();
            reader.onload = function(evt){
              o.src = evt.target.result;
              o.status = 'loading';
            };
            reader.readAsDataURL(file.getNative());

            if ( vm.isSinglePic ) {
              vm.imgObjList = [o];
            }
            else {
              vm.imgObjList.push(o);
            }
          });
        },
        'BeforeUpload': function(up, file) {
            // var progress = new FileProgress(file, 'fsUploadProgress');
            // var chunk_size = plupload.parseSize(this.getOption('chunk_size'));
            // if (up.runtime === 'html5' && chunk_size) {
            //     progress.setChunkProgess(chunk_size);
            // }
        },
        'UploadProgress': function(up, file) {
          var o = _.find(vm.imgObjList, function(o){ return o.id == file.id; });
          if ( o ) {
            o.percent = file.percent;
          }
            // var progress = new FileProgress(file, 'fsUploadProgress');
            // var chunk_size = plupload.parseSize(this.getOption('chunk_size'));
            //
            // progress = (file.percent + "%", file.speed, chunk_size);
        },
        'UploadComplete': function() {
            // $('#success').show();
        },
        'FileUploaded': function(up, file, info) {
          info = JSON.parse(info);
          var o = _.find(vm.imgObjList, function(o){ return o.id == file.id; });
          if ( o ) {
            o.status = 'uploaded';
            o.key = info.key;
          }
            // var progress = new FileProgress(file, 'fsUploadProgress');
            // progress.setComplete(up, info);
        },
        'Error': function(up, err, errTip) {
          var o = _.find(vm.imgObjList, function(o){ return o.id == err.file.id; });
          if ( o ) {
            console.log(err);
            o.status = 'error';
          }
        }
      }
    });
  }
})
