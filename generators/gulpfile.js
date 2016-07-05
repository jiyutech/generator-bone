/*global -$ */
'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var _ = require('lodash');
var path = require('path');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var runSequence = require('run-sequence');
var livereload = require('gulp-livereload');
// var browserify = require('gulp-browserify');
var gls = require('gulp-live-server');
// var opn = require('opn');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var gulpWebpack = require('webpack-stream');
// var through = require('through2');
// var changed = require('gulp-changed');
var map = require('map-stream');
// var vfs = require('vinyl-fs');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');

/*
  Batch Normalize Pathes
  ---
  ( 'a/', 'b' ) => 'a/b'
  ( ['a/'], 'b' ) => ['a/b']
*/
function batchNormalize( src ){
  var args = [].slice.call(arguments, 0);
  var adds = args.slice(1).join('');

  if ( _.isArray( src ) ) {
    return src.map(function( p ){
      return path.normalize( p + adds );
    });
  }
  else {
    return path.normalize( args.join('') );
  }
}

var devConf = require('./bone/getconf.js')('dev');
var prodConf = require('./bone/getconf.js')('prod');

gulp.task('serve', function () {
  var server = gls(['--harmony', 'bone/inset/serve.js'], {env: {NODE_ENV: 'dev'}}, devConf.serverLrPort);
  server.start();
  // Restart server when server code changed.
  gulp.watch([
    'bone/**/*',
    path.normalize( devConf.srcPath +'/**/*.common.js' ),
    path.normalize( devConf.srcPath +'/**/*.server.js' ),
    path.normalize( devConf.srcPath +'/server/**/*.js' ),
    path.normalize( devConf.srcPath +'/**/*.html' ),
  ], function( args ){
    server.start().done(function(){
      setTimeout(function(){
        livereload.changed( args.path );
      }, 2000);
    });
  });

  // Livereload for CSS
  gulp.watch([
    path.normalize( devConf.srcPath +'/**/*.scss' ),
    path.normalize( devConf.srcPath +'/**/*.sass' ),
  ], function( args ){
    livereload.changed( args.path.replace(/.s[ca]ss$/i,'.css') );
  });

  // Livereload for Client JS & other resources
  gulp.watch([
    path.normalize( devConf.srcPath +'/**/*' ),
    '!'+ path.normalize( devConf.srcPath +'/**/*.html' ),
    '!'+ path.normalize( devConf.srcPath +'/**/*.common.js' ),
    '!'+ path.normalize( devConf.srcPath +'/**/*.server.js' ),
    '!'+ path.normalize( devConf.srcPath +'/server/**/*.js' ),
    '!'+ path.normalize( devConf.srcPath +'/**/*.scss' ),
    '!'+ path.normalize( devConf.srcPath +'/**/*.sass' ),
  ], function( args ){
    livereload.changed( args.path );
  });

  // Watch static files
  livereload.listen({
    port: devConf.clientLrPort
  });
});

/*
  待处理文件分类：
  1. html
  2. scss
  3. js
  5. 其他非server目录下的js文件，以及非.server.js|.common.js结尾的js文件
  6. 需要放到根目录的文件（rootify）

  处理流程：
  1. 拷贝无需编译的静态资源文件到生产环境build目录
  2. 编译JS
  3. 编译CSS
  4. Reversion
  4. 保存到生产环境build目录
*/
gulp.task('clean', function(done){
  return $.cache.clearAll(function(){
    require('del').bind(null, [ prodConf.buildPath ])(done);
  });
});

gulp.task('build-copy-other', function () {
  return gulp.src([
    path.normalize( devConf.srcPath +'/**/*' ),
    '!'+ path.normalize( devConf.srcPath +'/**/*.js' ),
    '!'+ path.normalize( devConf.srcPath +'/**/*.scss' ),
    '!'+ path.normalize( devConf.srcPath +'/**/*.sass' ),
  ])
    .pipe(gulp.dest( path.normalize( prodConf.buildPath + prodConf.assetsPrefix ) ));
});

gulp.task('build-compile-css', function () {
  return gulp.src([
        path.normalize( devConf.srcPath +'/**/*.scss' ),
        path.normalize( devConf.srcPath +'/**/*.sass' ),
      ]
    )
    .pipe(sass())
    .on('error', notify.onError('SASS Compile Error'))
    .on('error', function( e ){ gutil.log(e.stack); })
    .pipe(postcss([
      autoprefixer({
        browsers: ['last 3 versions', 'not ie <= 8']
      }),
    ]))
    .on('error', notify.onError('CSS Autoprefixer Error'))
    .on('error', function( e ){ gutil.log(e.stack); })
    .pipe($.csso())
    .pipe($.sourcemaps.write())
    .on('error', notify.onError('CSS csso Error'))
    .on('error', function( e ){ gutil.log(e.stack); })
    .pipe(gulp.dest(
      path.normalize( prodConf.buildPath + prodConf.assetsPrefix )
    ));
});

gulp.task('build-compile-js', function () {
  var FILE_SPLIT_REG = /^(.+?)(([^\/]+?)(?:\.([^.]+))?)$/;
  var fullBuildPath = path.resolve( path.normalize( prodConf.buildPath + prodConf.assetsPrefix ) );
  var fullSrcPath = path.resolve( devConf.srcPath );
  return gulp.src([
    path.normalize( devConf.srcPath +'/**/*.js' ),
    '!'+ path.normalize( devConf.srcPath +'/**/*.server.js' ),
    '!'+ path.normalize( devConf.srcPath +'/server/**/*.js' ),
    '!'+ path.normalize( devConf.srcPath +'/vendor/**/*.js' ),
  ])
  .pipe(map(function(file, cb) {
    var targetPath = fullBuildPath + file.path.slice( fullSrcPath.length );
    FILE_SPLIT_REG.test( targetPath );
    var targetDir = RegExp.$1;
    var fileName = RegExp.$2;
    return gulpWebpack({
      entry: file.path,
      module: {
        loaders: [
          { test: /\.html$/, loader: 'html' },
        ]
      },
      output: {
        path: '',
        filename: fileName
      }
    })
    .on('error', notify.onError('JS Compile Error'))
    .on('error', function( e ){ gutil.log(e.stack); })
    .pipe($.sourcemaps.write())
    .pipe($.uglify())
    .on('error', notify.onError('JS Uglify Error'))
    .on('error', function( e ){ gutil.log(e.stack); })
    .pipe(gulp.dest( targetDir ))
    .on('finish', function(){ cb(null, file); });
  }));
});

gulp.task('build-copy-rootify', function () {
  return gulp.src( path.normalize( prodConf.rootifyPath +'/**/*.*' ), { base: prodConf.rootifyPath } )
    .pipe(gulp.dest( path.normalize( prodConf.buildPath + prodConf.assetsPrefix ) ));
});

gulp.task('build-rev-prepare', function () {
  return gulp.src([
      path.normalize( prodConf.buildPath +'/**/*.*' ),
      '!'+ path.normalize( prodConf.buildPath +'/**/*.html' )
    ], {base: prodConf.buildPath })
    .pipe(rev())
    .pipe(gulp.dest( prodConf.buildPath ))
    .pipe(rev.manifest({path: 'rev-manifest.json' }))
    .pipe(gulp.dest( path.normalize( prodConf.buildPath + prodConf.assetsPrefix ) ));
});

gulp.task('build-rev-replace', function () {
  return gulp.src(
      path.normalize( prodConf.buildPath + '/**/*.{html,xml,txt,json,css,js}' ),
      { base: prodConf.buildPath }
    )
    .pipe(revReplace({ manifest: gulp.src( path.resolve( prodConf.buildPath + prodConf.assetsPrefix + '/rev-manifest.json' ) ) }))
    .pipe(gulp.dest( prodConf.buildPath ));
});

gulp.task('build', function(callback) {
  runSequence(
    'clean',
    ['build-copy-other', 'build-compile-css', 'build-compile-js'],
    'build-copy-rootify',
    'build-rev-prepare',
    'build-rev-replace',
    callback
  );
});
