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
// Phase 5: Usemin to insert final file name into hitml

var gulp = require('gulp');
var runSequence = require('run-sequence');
var del = require('del');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
var svgmin = require('gulp-svgmin');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var assign = require('lodash.assign');
var rev = require('gulp-rev');
var connect = require('gulp-connect');
var modRewrite = require('connect-modrewrite');
var merge = require('merge-stream');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-htmlmin');
var minifyCss = require('gulp-cssnano');
var rsync = require('gulp-rsync');
var mocha = require('gulp-mocha');

// Mocha testing framework configuration options
gulp.task('mocha', function() {
});

gulp.task('rsync', function() {
  gulp.src('dist/*')
    .pipe(rsync({
      destination: '~/nusmods.com',
      recursive: true,
      update: true
    }));
});

// https://github.com/zont/gulp-usemin/issues/74
// gulp-usemin doesn't support versioned images
// Reads HTML for usemin blocks to enable smart builds that automatically
// concat, minify and revision files. Creates configurations in memory so
// additional tasks can operate on them
gulp.task('usemin', ['copy', 'browserify', 'imagemin'], function() {
  return gulp.src('.tmp/index.html')
    .pipe(usemin({
      css: [ 'concat', minifyCss, rev ],
      html: [ function() { return minifyHtml({ collapseWhitespace: true });} ],
      js: [ 'concat', uglify, rev ],
      // don't uglify because jsmin is produced by browserify, which uglifies it
      jsmain: [ 'concat', rev ],
      inelinejs: [ uglify ],
      inlinecss: [ minifyCss, 'concat' ]
    }))
    .on('error', console.error.bind(console))
    .pipe(gulp.dest('dist/'));
});

// The following *-min tasks produce minified files in the dist folder

gulp.task('svgmin', function() {
  return gulp.src('app/images/{,*/}*.svg')
    .pipe(svgmin())
    .pipe(gulp.dest('dist/images/'))
});

var imageminOptions = {
  interlaced: true,
  optimizationLevel: 3,
  progressive: true
}

gulp.task('imagemin', function() {
  // we cannot revision the logos until gulp-usemin is able to handle rev images
  var images = gulp.src('app/images/{,*/}*.{gif,jpeg,jpg,png}')
    .pipe(imagemin(imageminOptions))
    // .pipe(rev())
    .pipe(gulp.dest('dist/images'));
  var components = gulp.src('app/bower_components/select2/*.{gif,png}')
    .pipe(imagemin(imageminOptions))
    .pipe(gulp.dest('dist/styles/'));
  return merge(images, components);
});

// Browserify task

gulp.task('browserify', function() {
  var b = browserify({
    entries: ['app/scripts/main.js'],
  });
  return b.bundle()
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('.tmp/scripts/'));
});

var _b = browserify({
  entries: ['app/scripts/main.js'],
  cache: {},
  packageCache: {},
  plugin: [watchify]
});

gulp.task('browserify:watch', function() {
  return _b.bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('./tmp/scripts/'));
});

// Copy files to temp or dist directories so other tasks can use
gulp.task('copy', ['copy:tmp', 'copy:styles', 'copy:dist'])

gulp.task('copy:dist', function(cb) {
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
  return gulp.src('app/styles/{,*/}*.css', { base: 'app/styles'})
    .pipe(gulp.dest('.tmp/styles/'));
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
    .pipe(sourcemaps.init())
    .pipe(sass({includePaths: ['app/bower_components']}))
    .pipe(postcss(processors))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
});

// Empties folders to start fresh

gulp.task('clean:dist', function() {
  del.sync(['.tmp/**', 'dist/*', '!dist/.git*']);
});

gulp.task('clean:server', function() {
  del.sync(['.tmp/**']);
});

// Make sure code styles are up to par and there are no obvious mistakes
gulp.task('jshint', function(cb) {
  return gulp.src([
      'Gruntfile.js',
      'app/scripts/**/*.js',
      '!app/scripts/vendor/*',
      'test/spec/{,*/}*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('livereload', function() {
  gulp.src([
      'app/{,*/}*.html',
      '.tmp/scripts/main.js',
      '.tmp/styles/{,*/}*.css',
      'app/images/{,*/}*./{gif,jpeg,jpg,png,svg,webp}'])
   .pipe(connect.reload());
});

// Watches files for changes and runs tasks based on the changed files
gulp.task('watch', function() {
  gulp.watch('test/spec/{,*/}*.js', ['test:watch']);
  gulp.watch('app/styles/{,*/}*.{scss,sass}', function() {
    runSequence('sass', 'livereload');
  });
  gulp.watch('app/styles/{,*/}*.css', function() {
    runSequence('copy:styles', 'livereload');
  });
  gulp.watch('app/{,*/}*.html', ['livereload']);
  gulp.watch('.tmp/scripts/main.js', ['livereload']);
  gulp.watch('app/images/{,*/}*./{gif,jpeg,jpg,png,svg,webp}', ['livereload']);
  gulp.watch('package.json', ['browserify']);
  gulp.watch('app/scripts/**/*.js', function() {
    runSequence('browserify:watch', 'livereload');
  });
});

var connectMiddleware = function() {
  // Rewrite everything that does not contain a '.' to
  // support pushState
  return [modRewrite(['^[^\\.]*$ /index.html [L]'])];
};

gulp.task('connect:dist', function() {
  connect.server({
      "port": 9000,
      "livereload": false,
      "hostname": "0.0.0.0",
      "middleware": connectMiddleware,
      "root": ["dist", "api/app"]
  });
});

gulp.task('connect:livereload', function() {
  connect.server({
      "port": 9000,
      "livereload": true,
      "hostname": "0.0.0.0",
      "middleware": connectMiddleware,
      "root": [".tmp", "app", ".", "api/app"]
  });
});

gulp.task('connect:test', function() {
  connect.server({
      "port": 9001,
      "livereload": true,
      "hostname": "0.0.0.0",
      "middleware": connectMiddleware,
      "root": [".tmp", "test", "app", "api/app"]
  });
});

gulp.task('serve:dist', ['build', 'connect:dist']);
gulp.task('serve', function() {
  runSequence(
    'clean:server', ['sass', 'copy:styles'],
    'browserify', 'connect:livereload', 'watch')
});

gulp.task('test', ['clean:server', 'copy:styles']);
gulp.task('test:watch', ['connect:test', 'mocha']);

gulp.task('build', function() {
  runSequence(
    'clean:dist', ['copy', 'sass', 'imagemin', 'svgmin'],
    'browserify', 'usemin'
  );
});

gulp.task('default', ["jshint", /* "test" */ "build"]);
