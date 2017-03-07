"use strict";

/****** DEPENDENCIES ********/

var gulp            = require('gulp'),
    sass            = require("gulp-sass"),
    sassGlob        = require("gulp-sass-glob"),
    sassLint        = require('gulp-sass-lint'),
    sourceMaps      = require("gulp-sourcemaps"),
    postCss         = require("gulp-postcss"),
    browserSync     = require('browser-sync').create(),
    autoprefixer    = require("autoprefixer"),
    sassDoc         = require('sassdoc'),
    jsHint          = require('gulp-jshint'),
    jsHintStylish   = require('jshint-stylish'),
    color           = require('colors'),
    del             = require('del');

/********** VARIABLES *************/

// Hosts
var hosts = 'bedjango-project';

// Paths

var srcAssets = {
  styles    : 'src/sass/'
};

var distAssets = {
  styles    : 'css/',
  js        : 'js/'
};

// Sass Doc

var sassDocDist = 'sass_doc';

var sassDocOptions = {
  dest: sassDocDist,
  verbose: true,
  display: {
    access: ['public', 'private'],
    alias: true,
    watermark: true,
  },
  groups: {
    'undefined': 'Ungrouped',
    foo: 'Foo group',
    bar: 'Bar group',
  },
  basePath: 'https://github.com/SassDoc/sassdoc',
};

/********** TASKS ***************/

gulp.task('default', function(){
  console.log('')
  console.log('Cleaning tasks'.yellow)
  console.log('gulp ' + 'clean:css'.cyan + '         ' + '# Clean css files from css directory'.grey)
  console.log('')
  console.log('Compiling tasks'.yellow)
  console.log('gulp ' + 'styles:dev'.cyan + '        ' + '# Compile expanded css and create a maps file.'.grey)
  console.log('gulp ' + 'styles:pro'.cyan + '        ' + '# Compile compressed css, apply autoprefixer to result.'.grey)
  console.log('')
  console.log('Utils tasks'.yellow)
  console.log('gulp ' + 'clean:sassdoc'.cyan + '     ' + '# Clean sassdoc directory.'.grey)
  console.log('gulp ' + 'sassdoc'.cyan + '           ' + '# Create a static internal page with a sass styleguide: variables, mixins, extends...'.grey)
  console.log('')
  console.log('Debugging tasks'.yellow)
  console.log('gulp ' + 'sasslint'.cyan + '          ' + '# Check sass files looking for a bad code practises .'.grey)
  console.log('gulp ' + 'jshint'.cyan + '            ' + '# Check js files looking for a wrong syntaxis.'.grey)
  console.log('')
  console.log('Watching tasks'.yellow)
  console.log('gulp ' + 'watch'.cyan + '             ' + '# Run a defined tasks if any specified files are changed.'.grey)
  console.log('gulp ' + 'browsersync'.cyan + '       ' + '# Synchronize browser and device in realtime and reload browser if any specified files are changed.'.grey)
  console.log('')
  console.log('Developing task'.yellow)
  console.log('gulp ' + 'dev:watch'.cyan + '         ' + '# Run styles:dev to compile to development enviroment, run jshint task and run watch to waiting for changes.'.grey)
  console.log('gulp ' + 'dev:browser'.cyan + '       ' + '# Run styles:dev to compile to development enviroment, run jshint and run browserSync to synchronize browser.'.grey)
  console.log('gulp ' + 'pro'.cyan + '               ' + '# Run styles:pro to compile to production enviroment, run jshint and run sassdoc.'.grey)
  console.log('')
});


/************* CLEANING *****************/

// Clean css
gulp.task('clean:css', function () {
  return del([
    distAssets.styles + '**/*'
  ]);
});

/************* COMPILING *****************/

// Css to development
gulp.task('styles:dev', function () {
  return gulp.src([srcAssets.styles + '**/*.s+(a|c)ss'])
    .pipe(sourceMaps.init())
    .pipe(sassGlob())
    .pipe(sass({
      errLogToConsole: true,
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(sourceMaps.write('maps'))
    .pipe(gulp.dest(distAssets.styles))
    .pipe(browserSync.stream());
});

// Css to producction
gulp.task('styles:pro', ['clean:css'], function () {
  return gulp.src([srcAssets.styles + '**/*.s+(a|c)ss'])
    .pipe(sassGlob())
    .pipe(sass({
      errLogToConsole: true,
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(postCss([
      autoprefixer({
        browsers: ['> 1%', 'ie 8', 'last 2 versions'] }
      )
    ]))
    .pipe(gulp.dest(distAssets.styles));
});

/************* UTILS *****************/

// Clean Sassdoc
gulp.task('clean:sassdoc', function () {
  return del([
    sassDocDist
  ]);
});

// Sassdoc
gulp.task('sassdoc', ['clean:sassdoc'], function () {
  return gulp.src(srcAssets.styles + '**/*.s+(a|c)ss')
  .pipe(sassDoc(sassDocOptions));
});

/************* DEBUGGING *****************/

// Sass lint
gulp.task('sasslint', function () {
  return gulp.src(srcAssets.styles + '**/*.s+(a|c)ss')
  .pipe(sassLint({
    options: {
      configFile: 'da_vinci.sass-lint.yml'
    }
  }))
  .pipe(sassLint.format())
  .pipe(sassLint.failOnError());
});

// jsHint
gulp.task('jshint', function(){
  return gulp.src([distAssets.js + '**/*.js'])
    .pipe(jsHint())
    .pipe(jsHint.reporter(jsHintStylish))
    .pipe(browserSync.stream());
});

/************** DEMONS **********************/

// WATCH
gulp.task('watch', function(){

  gulp.watch(srcAssets.styles + '**/*.s+(a|c)ss', ['styles:dev'])
  .on('change', function(event) {
    console.log('');
    console.log('-> File ' + event.path.magenta.bold + ' was ' + event.type.green + ', running tasks...');
  });
  gulp.watch(distAssets.js + '**/*.js', ['jshint'])
  .on('change', function(event) {
    console.log('');
    console.log('-> File ' + event.path.yellow + ' was ' + event.type.green + ', running tasks...');
  });
});

// Browser Sync
gulp.task('browsersync', function() {
  browserSync.init({
    proxy: {
        target: hosts,
        ws: false
    }
  });
  gulp.watch(srcAssets.styles + '**/*.s+(a|c)ss', ['styles:dev'])
  .on('change', function(event) {
    console.log('');
    console.log('-> File ' + event.path.magenta.bold + ' was ' + event.type.green + ', running tasks...');
    browserSync.reload();
  });
  gulp.watch(distAssets.js + '**/*.js', ['jshint'])
  .on('change', function(event) {
    console.log('');
    console.log('-> File ' + event.path.yellow + ' was ' + event.type.green + ', running tasks...');
    browserSync.reload();
  });
});

/************** TIME TO WORK ***********************/

// Development enviroment
gulp.task('dev:watch', ['styles:dev', 'jshint', 'watch']);
gulp.task('dev:browser', ['styles:dev', 'jshint', 'browsersync']);

// Production enviroment
gulp.task('pro', ['styles:pro', 'jshint']);
