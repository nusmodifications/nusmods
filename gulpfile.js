'use strict';

require('es6-promise').polyfill();  // needed for gulp-postcss, it uses Promise

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
// Phase 3: Run minification (imagemin, svgmin), compile sass
// Phase 4: Browserify to bundle app main.js
// Phase 5: Usemin to insert final file name into html

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var del = require('del');
var stylish = require('jshint-stylish');
var autoprefixer = require('autoprefixer');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var modRewrite = require('connect-modrewrite');
var merge = require('merge-stream');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

// Mocha testing framework configuration options
gulp.task('test', function() {
  return gulp.src(['test/*.js'], {read: false})
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

// https://github.com/zont/gulp-usemin/issues/74
// gulp-usemin doesn't support versioned images
// Reads HTML for usemin blocks to enable smart builds that automatically
// concat, minify and revision files. Creates configurations in memory so
// additional tasks can operate on them
gulp.task('usemin', function() {
  // cssnano stupidly changes the z-index'es
  // See https://github.com/ben-eb/gulp-cssnano/issues/8
  function cssnano() {
      return plugins.cssnano({ zindex: false });
  }
  return gulp.src('.tmp/index.html')
    .pipe(plugins.usemin({
      css: [ 'concat', cssnano, plugins.rev ],
      html: [ function() { return plugins.htmlmin({ collapseWhitespace: true });} ],
      js: [ 'concat', plugins.uglify, plugins.rev ],
      // don't uglify because jsmin is produced by browserify, which uglifies it
      jsmain: [ 'concat', plugins.rev ],
      inelinejs: [ plugins.uglify ],
      inlinecss: [ cssnano, 'concat' ]
    }))
    .on('error', console.error.bind(console))
    .pipe(gulp.dest('dist/'));
});

// The following *-min tasks produce minified files in the dist folder

gulp.task('svgmin', function() {
  return gulp.src('app/images/{,*/}*.svg')
    .pipe(plugins.svgmin())
    .pipe(gulp.dest('dist/images/'));
});

var imageminOptions = {
  interlaced: true,
  optimizationLevel: 3,
  progressive: true
};

gulp.task('imagemin', function() {
  // we cannot revision the logos until gulp-usemin is able to handle rev images
  var images = gulp.src('app/images/{,*/}*.{gif,jpeg,jpg,png}')
    .pipe(plugins.imagemin(imageminOptions))
    // .pipe(rev())
    .pipe(gulp.dest('dist/images'));
  var components = gulp.src('app/bower_components/select2/*.{gif,png}')
    .pipe(plugins.imagemin(imageminOptions))
    .pipe(gulp.dest('dist/styles/'));
  return merge(images, components);
});

// Browserify task

var bundler;

function bundle() {
  return bundler
    .on('error', function(msg) {
      browserSync.notify(msg);
      console.error(msg);
    })
    .bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('.tmp/scripts/'))
    .pipe(browserSync.stream({
      once: true,
      match: '**/*.js'
    }));
}

gulp.task('bundle', bundle);

gulp.task('browserify', function() {
  bundler = browserify({
    entries: ['app/scripts/main.js'],
  });
  return bundle();
});

gulp.task('browserify:watch', function() {
  bundler = browserify({
    entries: ['app/scripts/main.js'],
    debug: true,
    cache: {},
    packageCache: {},
    plugin: [watchify]
  });
  bundler = watchify(bundler, {});
  // this hack works around chokidar (the fs watcher watchify uses)
  // not working on our unix guest on windows host setup
  bundler._watcher = function(file) {
    var watcher = gulp.watch(file);
    watcher.close = watcher.end;
    return watcher;
  };
  bundler.on('update', bundle);
  return bundle();
});

// Copy files to temp or dist directories so other tasks can use
gulp.task('copy', ['copy:tmp', 'copy:styles', 'copy:dist']);

gulp.task('copy:dist', function() {
  var apps = gulp.src([
    'app/*.{config,php}',
    'app/*.{ico,png,txt}',
    'app/.htaccess',
    'app/images/{,*/}*.webp',
    'app/{,*/}*.html',
    'app/config/*.json',
    'app/styles/slate.min.css',
    'app/styles/*.{gif,png}',
    'app/styles/fonts/{,*/}*.*',
    'app/vendor/knplabs/knp-snappy/src/**/*.php',
    'app/vendor/facebook/php-sdk-v4/autoload.php',
    'app/vendor/facebook/php-sdk-v4/src/Facebook/**/*',
    'app/bower_components/font-awesome/fonts/*.*',
  ], { base: 'app' })
    .pipe(gulp.dest('dist/'));

  var zeroclipboard = gulp.src('node_modules/zeroclipboard/dist/ZeroClipboard.swf')
    .pipe(gulp.dest('dist/'));

  return merge(apps, zeroclipboard);
});

gulp.task('copy:styles', function() {
  return gulp.src('app/styles/{,*/}*.css', { base: 'app/styles' })
    .pipe(gulp.dest('.tmp/styles/'))
    .pipe(browserSync.stream({match: '**/*.css'}));
});

gulp.task('copy:tmp', function() {
  return gulp.src([
      'app/bower_components/qtip2/jquery.qtip.css',
      'app/bower_components/select2/select2.css',
      'app/bower_components/animate.css/animate.min.css',
      'app/index.html',
      'app/scripts/disqus-count.js'
    ], { base: 'app' })
    .pipe(gulp.dest('.tmp/'));
});

// Compiles Sass to CSS and generates necessary files if requested
gulp.task('sass', function() {
  var processors = [autoprefixer()];
  return gulp.src('app/styles/*.scss', { base: 'app/styles'})
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass({includePaths: ['app/bower_components']}))
    .pipe(plugins.postcss(processors))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(browserSync.stream({match: '**/*.css'}));
});

// Empties folders to start fresh

gulp.task('clean:dist', function() {
  del.sync(['.tmp/**', 'dist/*', '!dist/.git*']);
});

gulp.task('clean:server', function() {
  del.sync(['.tmp/**']);
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

gulp.task('serve', ['sass', 'copy:styles', 'browserify:watch'], function() {
  browserSync.init({
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app', 'api/app', 'node_modules/zeroclipboard/dist'],
      // Rewrite everything that does not contain a '.' to support pushState
      middleware: modRewrite(['^[^\\.]*$ /index.html [L]'])
    },
  });
  gulp.watch('app/styles/{,*/}*.{scss,sass}', ['sass']);
  gulp.watch('app/styles/{,*/}*.css', ['copy:styles']);
  gulp.watch([
    'app/{,*/}*.html',
    'app/images/{,*/}*./{gif,jpeg,jpg,png,svg,webp}'
    ], reload);
  gulp.watch('test/spec/{,*/}*.js', ['test:watch']);
  gulp.watch('package.json', ['browserify']);
});

gulp.task('serve:dist', ['build'], function() {
  browserSync.init({
    port: 9000,
    server: {
      baseDir: ['dist', 'api/app'],
      middleware: modRewrite(['^[^\\.]*$ /index.html [l]'])
    }
  });
});

gulp.task('serve:test', function() {
  browserSync.init({
    port: 9001,
    host: '0.0.0.0',
    server: {
      baseDir: ['.tmp', 'test', 'app', 'api/app'],
      middleware: modRewrite(['^[^\\.]*$ /index.html [l]'])
    }
  });
});

gulp.task('test:watch', ['serve:test', 'test']);

gulp.task('build', ['clean:dist'], function() {
  runSequence(
    ['copy', 'sass', 'imagemin', 'svgmin'],
    'browserify', 'usemin'
  );
});

gulp.task('default', function() {
  return runSequence(
    ['jshint', 'test'],
    'build'
  );
});
