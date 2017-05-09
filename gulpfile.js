/* eslint-disable prefer-arrow-callback, func-names, strict */
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

// Relevant folders:
// .tmp/ (holding area)
// dist/ (final distributed app)

// Phase 1: Clean up (clean)
// Phase 2: Copy files from app, vendor to .tmp or to dist/ (copy)
// Phase 3: Run minification (imagemin, svgmin)
// Phase 4: webpack to bundle app main.js

const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const del = require('del');
const stylish = require('jshint-stylish');
// const webpack = require('webpack-stream');

// Mocha testing framework configuration options
gulp.task('test', function() {
  return gulp.src(['test/*.js'], { read: false })
    .pipe(plugins.mocha());
});

gulp.task('rsync', function() {
  gulp.src('dist')
    .pipe(plugins.rsync({
      root: 'dist',
      destination: '../nusmods.com',
      recursive: true,
      update: true
    }));
});

// Empties folders to start fresh

gulp.task('clean', function() {
  del.sync(['dist/*', '!dist/.git*']);
});

// Make sure code styles are up to par and there are no obvious mistakes
gulp.task('jshint', function() {
  return gulp.src([
    'gulpfile.js',
    'app/scripts/**/*.js',
    '!app/scripts/vendor/*',
    'test/spec/{,*/}*.js'])
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter(stylish));
});

gulp.task('eslint', function() {
  return gulp.src([
    'gulpfile.js',
    'webpack.config.js',
    'app/scripts/**/*.js',
    'test/spec/{,*/}*.js',
    '!app/scripts/vendor/*',
    '!node_modules/**/*.js',
  ])
  .pipe(plugins.eslint())
  .pipe(plugins.eslint.format());
});

gulp.task('default', ['jshint', 'test']);
