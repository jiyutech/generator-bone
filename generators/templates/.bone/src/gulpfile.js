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
var modify = require('gulp-modify');
var rename = require('gulp-rename');


var conf = require('./getconf.js')();
var devConf = require('./getconf.js')('dev');

var sitePrefixTemplate = '{{staticPrefix}}';

var boneConf = require('./bone-config');
var buildPath = boneConf.buildPath;

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

function resolveBySites(){
  var pathes = _.flatten([].slice.call(arguments, 0));
  var res = [];
  pathes.forEach(function( p ){
    conf.sites.forEach(function( s ){
      res.push( path.normalize( s.src +'/'+ p ) );
    });
  });
  return res;
}

function resolveExcludeBySites(){
  var pathes = _.flatten([].slice.call(arguments, 0));
  var res = [];
  pathes.forEach(function( p ){
    conf.sites.forEach(function( s ){
      res.push( '!'+ path.normalize( s.src +'/'+ p ) );
    });
  });
  return res;
}

module.exports = {
  setup: function(){
    gulp.task('serve', function () {
      var server = gls(['--harmony', '.bone/serve.js'], {env: {NODE_ENV: 'dev'}}, devConf.serverLrPort);
      server.start();
      // Restart server when server code changed.
      gulp.watch([
        '.bone/**/*',
        'config/**/*',
        resolveBySites([
          '/**/*.common.js',
          '/**/*.server.js',
          '/**/*.json',
          '/server/**/*.js'
        ]),
      ], function( args ){
        console.error('Reloading Server.');
        server.start().then(function(){
          console.error('Server Reloaded.');
          livereload.changed( args.path );
        });
      });

      // Livereload for JS
      gulp.watch([
        resolveBySites([ '/**/*.html' ]),
      ], function( args ){
        console.error('Reload HTML.');
        livereload.changed( args.path );
      });

      // Livereload for CSS
      gulp.watch([
        resolveBySites([ '/**/*.scss', '/**/*.sass' ]),
      ], function( args ){
        console.error('Reload CSS.');
        livereload.changed( args.path.replace(/.s[ca]ss$/i,'.css') );
      });

      // Livereload for Client JS & other resources
      gulp.watch([
        resolveBySites( '/**/*' ),
        resolveExcludeBySites([
          '/**/*.html',
          '/**/*.common.js',
          '/**/*.server.js',
          '/**/*.json',
          '/server/**/*.js',
          '/**/*.scss',
          '/**/*.sass',
        ]),
      ], function( args ){
        console.error('Reload Browser.');
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
        require('del').bind(null, [ buildPath ])(done);
      });
    });

    var compileTaskSets = [];
    var revPrepareTaskSets = [];
    var revTaskSets = [];
    var revParsedTaskSets = [];
    conf.sites.forEach(function( siteConf, i ){

      var taskName;

      taskName = 'build-copy-other-'+ i;
      compileTaskSets.push(taskName);
      gulp.task(taskName, function () {
        return gulp.src([
          path.normalize( siteConf.src +'/**/*' ),
          '!'+ path.normalize( siteConf.src +'/**/*.js' ),
          '!'+ path.normalize( siteConf.src +'/**/*.scss' ),
          '!'+ path.normalize( siteConf.src +'/**/*.sass' ),
        ])
        .pipe(gulp.dest(
          path.normalize( buildPath +'/'+ siteConf.src +'/'+ sitePrefixTemplate )
        ));
      });


      if ( siteConf.rootifyPaths.length ) {
        siteConf.rootifyPaths.forEach(function( rootifyPath, j ){
          taskName = 'build-copy-rootify-'+ i +'-'+ j;
          compileTaskSets.push(taskName);
          gulp.task(taskName, function () {
            return gulp.src([
              path.normalize( rootifyPath +'/**/*' ),
            ], { base: rootifyPath } )
            .pipe(gulp.dest(
              path.normalize( buildPath +'/'+ siteConf.src +'/'+ sitePrefixTemplate )
            ));
          });
        });
      }

      taskName = 'build-compile-css-'+ i;
      compileTaskSets.push(taskName);
      gulp.task(taskName, function () {
        return gulp.src([
              path.normalize( siteConf.src +'/**/*.scss' ),
              path.normalize( siteConf.src +'/**/*.sass' ),
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
            path.normalize( buildPath +'/'+ siteConf.src +'/'+ sitePrefixTemplate )
          ));
      });

      taskName = 'build-compile-js-'+ i;
      compileTaskSets.push(taskName);
      gulp.task(taskName, function () {
        var FILE_SPLIT_REG = /^(.+?)(([^\/]+?)(?:\.([^.]+))?)$/;
        var fullBuildPath = path.resolve( path.normalize( buildPath +'/'+ siteConf.src +'/'+ sitePrefixTemplate ) );
        var fullSrcPath = path.resolve( siteConf.src );
        return gulp.src([
          path.normalize( siteConf.src +'/**/*.js' ),
          '!'+ path.normalize( siteConf.src +'/**/*.babel.js' ),
          '!'+ path.normalize( siteConf.src +'/**/*.jsx' ),
          '!'+ path.normalize( siteConf.src +'/**/*.server.js' ),
          '!'+ path.normalize( siteConf.src +'/server/**/*.js' ),
          '!'+ path.normalize( siteConf.src +'/vendor/**/*.js' ),
        ])
        .pipe(map(function(file, cb) {
          var targetPath = path.normalize( fullBuildPath +'/'+ file.path.slice( fullSrcPath.length ) );
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


      taskName = 'build-rev-prepare-'+ i;
      revPrepareTaskSets.push(taskName);
      gulp.task(taskName, function () {
        return gulp.src([
            path.normalize( buildPath +'/'+ siteConf.src +'/**/*.*' ),
          ], {base: path.resolve( buildPath +'/'+ siteConf.src ) })
          .pipe(rev())
          .pipe(gulp.dest( path.normalize( buildPath +'/'+ siteConf.src ) ))
          .pipe(rev.manifest({path: 'rev-manifest.json' }))
          .pipe(gulp.dest( path.normalize( buildPath +'/'+ siteConf.src ) ))
          .pipe(modify({
            fileModifier: function(file, contents) {
              return contents.replace(/\{\{staticPrefix\}\}/g, siteConf.staticPrefix );
            }
          }))
          .pipe(rename({
            suffix: '-parsed',
          }))
          .pipe(gulp.dest( path.normalize( buildPath +'/'+ siteConf.src ) ));
      });


      taskName = 'build-rev-'+ i;
      revTaskSets.push(taskName);
      gulp.task(taskName, function () {
        return gulp.src(
            path.normalize( buildPath +'/'+ siteConf.src +'/**/*.{html,xml,txt,json,css,js}' ),
            { base: path.resolve( buildPath +'/'+ siteConf.src ) }
          )
          .pipe(revReplace({ manifest: gulp.src( path.resolve( buildPath +'/'+ siteConf.src +'/rev-manifest.json' ) ) }))
          .pipe(gulp.dest( path.normalize( buildPath +'/'+ siteConf.src ) ));
      });

      taskName = 'build-rev-parsed-'+ i;
      revParsedTaskSets.push(taskName);
      gulp.task(taskName, function () {
        return gulp.src(
            path.normalize( buildPath +'/'+ siteConf.src +'/**/*.{html,xml,txt,json,css,js}' ),
            { base: path.resolve( buildPath +'/'+ siteConf.src ) }
          )
          .pipe(revReplace({ manifest: gulp.src( path.resolve( buildPath +'/'+ siteConf.src +'/rev-manifest-parsed.json' ) ) }))
          .pipe(gulp.dest( path.normalize( buildPath +'/'+ siteConf.src ) ));
      });

    });


    gulp.task('build', function(callback) {
      runSequence(
          'clean',
          compileTaskSets,
          revPrepareTaskSets,
          revTaskSets,
          revParsedTaskSets,
          // 'build-copy-rootify',
          callback
      );
    });

  }
};
