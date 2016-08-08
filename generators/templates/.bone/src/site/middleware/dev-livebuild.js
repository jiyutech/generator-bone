'use strict';

// const basePath = process.cwd();
const path = require('path');
const isValidGlob = require('is-valid-glob');
const mm = require('micromatch');
const boneLogger = require('../../logger.js')('Bone.liveBuild');
// const webpack = require('webpack');
const gulpWebpack = require('webpack-stream');
const vfs = require('vinyl-fs');
const PassThrough = require('stream').PassThrough;
const fs = require('graceful-fs');
const through = require('through');
// const crypto = require('crypto');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const notify = require('gulp-notify');
const autoprefixer = require('autoprefixer');
// const cssnano = require('cssnano');

// var srcFileHash = {};

module.exports = function( options ){

  if ( !options.src ) {
    boneLogger.error('need src path.'); // TODO文案
    throw '';
  }
  if ( !isValidGlob(options.src) ) {
    boneLogger.error('need valid src path.'); // TODO文案
    throw '';
  }

  options.srcBase = options.srcBase || '';
  options.urlPrefix = options.urlPrefix || '';
  options.dest = options.dest || '';

  const COMPILETYPE_TO_EXT_MAPPING = {
    'js': ['js'],
    'sass': ['css', 'scss', 'sass']
  };

  const FILE_SPLIT_REG = /^(.+?)(([^\/]+?)(?:\.([^.]+))?)$/;


  const compilers = {
    // {fileInfo} structure
    // {
    //   path: '',
    //   dir: '',
    //   fileName: '',
    //   pureFileName: '',
    //   ext: ''
    //   outputFileName: '',
    //   outputFilePath: '',
    // }
    'js': function( fileInfo ){
      var responseStream = new PassThrough();
      gulpWebpack({
        entry: fileInfo.path,
        module: {
          loaders: [
            { test: /\.html$/, loader: 'html' },
            // { test: /\.scss$/, loader: 'sass' }
            // TODO Sass Loader
          ]
        }
      })
      .on('error', notify.onError('JS Compile Error'))
      .on('error', function( e ){
        boneLogger.error('Error when compiling js file '+ fileInfo.path );
        boneLogger.error('Error Message: ');
        boneLogger.error(e.message);
      })
      .pipe(through(function( file ){
        responseStream.push(file.contents);
      }, function(){
        responseStream.end();
      }));
      // Error Handler
      // TODO dest file to .tmp: .pipe(vfs.dest( fileInfo.outputFilePath ));
      // TODO add Babel Loader after this
      return responseStream;
    },

    'sass': function( fileInfo ){
      var responseStream = new PassThrough();
      vfs.src(
        fileInfo.path
      )
      .pipe(sass())
      .on('error', function( e ){
        boneLogger.error('Error when compiling sass file '+ fileInfo.path );
        boneLogger.error('Error Message: ');
        boneLogger.error(e.message);
      })
      .pipe(postcss([
          autoprefixer({
            browsers: ['last 3 versions', 'not ie <= 8']
          }),
          // cssnano(),
      ]))
      .on('error', function( e ){
        boneLogger.error('Error when autoprefix css file '+ fileInfo.path );
        boneLogger.error('Error Message: ');
        boneLogger.error(e.message);
      })
      .on('error', notify.onError('CSS Compile Error'))
      .pipe(through(function( file ){
        responseStream.push(file.contents);
      }, function(){
        responseStream.end();
      }));
      // TODO dest file to .tmp: .pipe(vfs.dest( fileInfo.outputFilePath ));
      return responseStream;
    }
  };

  function resolveCompileType( ext ){
    if ( ext ) {
      var findType = null;
      for ( let type in COMPILETYPE_TO_EXT_MAPPING ) {
        if ( COMPILETYPE_TO_EXT_MAPPING[type].indexOf( ext ) > -1 ) {
          findType = type;
        }
      }
      return findType;
    }
    return null;
  }

  function resolveUrlPath( urlFilePath ) {
    if ( urlFilePath.indexOf( options.urlPrefix ) === 0 ) {
      urlFilePath = urlFilePath.slice( options.urlPrefix.length );
    }

    var filePath = path.normalize( options.srcBase +'/'+ urlFilePath );

    if ( mm( filePath, options.src ).length === 0 ) return ;
    filePath = path.resolve(options.srcBase +'/'+ urlFilePath);

    var outputFilePath = options.dest ? path.resolve(options.dest +'/'+ urlFilePath) : undefined;
    FILE_SPLIT_REG.test( filePath );
    var fileInfo = {
      path: filePath,
      dir: RegExp.$1,
      fileName: RegExp.$2,
      pureFileName: RegExp.$3,
      ext: RegExp.$4, // Maybe not this, will be checked below.
      outputFilePath: outputFilePath,
      outputFileName: RegExp.$2,
      outputExt: RegExp.$4,
      compileType: resolveCompileType( RegExp.$4 ),
      compile: null
    };

    if ( !fileInfo.compileType ) { return ; }
    var psbExts = COMPILETYPE_TO_EXT_MAPPING[ fileInfo.compileType ];
    if ( !psbExts ) { return ; }

    fileInfo.compile = function(){
      return compilers[ fileInfo.compileType ]( fileInfo );
    };

    psbExts.forEach(function( ext ){
      if ( fs.existsSync( fileInfo.dir + fileInfo.pureFileName +'.'+ ext ) ) {
        fileInfo.ext = ext;
        fileInfo.fileName = fileInfo.pureFileName +'.'+ fileInfo.ext;
        fileInfo.path = fileInfo.dir + fileInfo.fileName;
      }
    });

    return fileInfo;
  }

  return function*(next) {
    yield next;
    var urlPath = this.url.replace(/\?.+/,'');
    var srcFileInfo = resolveUrlPath( urlPath );
    if ( srcFileInfo ) {
      this.type = srcFileInfo.outputExt;
      // TODO only deal with changed file.
      // if ( isSourceFileChanged( srcFileInfo ) ) {
      this.body = srcFileInfo.compile();
      // }
      // else {
        // this.body = fs.createReadStream( srcFileInfo.buildedFilePath )
      // }
    }
  };
};
