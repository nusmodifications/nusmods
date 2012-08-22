module.exports = function(grunt) {
  grunt.initConfig({
    staging: 'dist',
    output: 'dist',
    crawl: {
      cachePath: 'cache',
      dest: 'json/mod_info.json',
      maxCacheAge: 2 * 86400 // in seconds
    },
    download: {
      'json/mod_info.json': 'http://nusmods.com/json/mod_info.json'
    },
    jsify: {
      destModuleFinder: 'js/mod_info_mf.js',
      destTimetable: 'js/mod_info_tt.js',
      src: 'json/mod_info.json'
    },
    coffee: {
      compile: {
        files: {
          'js/main.js': 'src/coffee/main.coffee'
        }
      },
      tasks: {
        options: {
          bare: true
        },
        files: {
          'tasks/crawl.js': 'tasks/crawl.coffee',
          'tasks/jsify.js': 'tasks/jsify.coffee'
        }
      }
    },
    less: {
      compile: {
        options: {
          paths: ['src/less', 'src/less/bootstrap']
        },
        files: {
          'css/main.css': ['src/css/**/*.css', 'src/less/main.less'],
          'css/exports.css': 'src/less/exports.less'
        }
      }
    },
    concat: {
      'js/libs.js': [
        'src/js/bootstrap/*.js',
        'src/js/jquery-ui/jquery.ui.core.js',
        'src/js/jquery-ui/jquery.ui.widget.js',
        'src/js/jquery-ui/jquery.ui.mouse.js',
        'src/js/jquery-ui/jquery.ui.draggable.js',
        'src/js/jquery-ui/jquery.ui.droppable.js',
        'src/js/qTip2/intro.js',
        'src/js/qTip2/core.js',
        'src/js/qTip2/tips.js',
        'src/js/qTip2/viewport.js',
        'src/js/qTip2/outro.js',
        'src/js/*.js'
      ],
      'js/e3.js': [
        'src/js/exhibit3/LAB.src.js',
        'src/js/exhibit3/exhibit-api.js',
        'src/js/exhibit3/base64.js',
        'src/js/exhibit3/sprintf.js',
        'src/js/exhibit3/history.adapter.jquery.js',
        'src/js/exhibit3/history.js',
        'src/js/exhibit3/jquery.history.shim.js',
        'src/js/exhibit3/jquery.simile.dom.js',
        'src/js/exhibit3/jquery.simile.bubble.js',
        'src/js/exhibit3/scripts/exhibit.js',
        'src/js/exhibit3/scripts/registry.js',
        'src/js/exhibit3/scripts/util/util.js',
        'src/js/exhibit3/scripts/util/debug.js',
        'src/js/exhibit3/scripts/util/html.js',
        'src/js/exhibit3/scripts/util/set.js',
        'src/js/exhibit3/scripts/util/date-time.js',
        'src/js/exhibit3/scripts/util/units.js',
        'src/js/exhibit3/scripts/util/persistence.js',
        'src/js/exhibit3/scripts/util/history.js',
        'src/js/exhibit3/scripts/util/bookmark.js',
        'src/js/exhibit3/scripts/util/localization.js',
        'src/js/exhibit3/scripts/util/settings.js',
        'src/js/exhibit3/scripts/util/coders.js',
        'src/js/exhibit3/scripts/util/facets.js',
        'src/js/exhibit3/scripts/util/views.js',
        'src/js/exhibit3/scripts/data/database.js',
        'src/js/exhibit3/scripts/data/database/local.js',
        'src/js/exhibit3/scripts/data/database/type.js',
        'src/js/exhibit3/scripts/data/database/property.js',
        'src/js/exhibit3/scripts/data/database/range-index.js',
        'src/js/exhibit3/scripts/data/collection.js',
        'src/js/exhibit3/scripts/data/expression.js',
        'src/js/exhibit3/scripts/data/expression/collection.js',
        'src/js/exhibit3/scripts/data/expression/path.js',
        'src/js/exhibit3/scripts/data/expression/constant.js',
        'src/js/exhibit3/scripts/data/expression/operator.js',
        'src/js/exhibit3/scripts/data/expression/function-call.js',
        'src/js/exhibit3/scripts/data/expression/control-call.js',
        'src/js/exhibit3/scripts/data/expression/functions.js',
        'src/js/exhibit3/scripts/data/expression/controls.js',
        'src/js/exhibit3/scripts/data/expression-parser.js',
        'src/js/exhibit3/scripts/ui/ui.js',
        'src/js/exhibit3/scripts/ui/ui-context.js',
        'src/js/exhibit3/scripts/ui/lens-registry.js',
        'src/js/exhibit3/scripts/ui/lens.js',
        'src/js/exhibit3/scripts/ui/coordinator.js',
        'src/js/exhibit3/scripts/ui/formatter.js',
        'src/js/exhibit3/scripts/ui/format-parser.js',
        'src/js/exhibit3/scripts/ui/facets/facet.js',
        'src/js/exhibit3/scripts/ui/facets/list-facet.js',
        'src/js/exhibit3/scripts/ui/facets/text-search-facet.js',
        'src/js/exhibit3/scripts/ui/facets/hierarchical-facet.js',
        'src/js/exhibit3/scripts/ui/views/view.js',
        'src/js/exhibit3/scripts/ui/views/view-panel.js',
        'src/js/exhibit3/scripts/ui/views/ordered-view-frame.js',
        'src/js/exhibit3/scripts/ui/views/tile-view.js',
        'src/js/exhibit3/scripts/ui/views/tabular-view.js',
        'src/js/exhibit3/scripts/ui/views/thumbnail-view.js',
        'src/js/exhibit3/scripts/ui/control-panel.js',
        'src/js/exhibit3/scripts/ui/widgets/collection-summary-widget.js',
        'src/js/exhibit3/scripts/ui/widgets/option-widget.js',
        'src/js/exhibit3/scripts/ui/widgets/resizable-div-widget.js',
        'src/js/exhibit3/locales/manifest.js',
        'src/js/exhibit3/scripts/final.js'
      ]
    },
    mkdirs: {
      staging: './'
    },
    css: {
      'css/main.css': 'css/main.css',
      'css/exports.css': 'css/exports.css'
    },
    min: {
      'js/e3.js': 'js/e3.js',
      'js/libs.js': 'js/libs.js',
      'js/main.js': 'js/main.js',
      'js/mod_info_mf.js': 'js/mod_info_mf.js',
      'js/mod_info_tt.js': 'js/mod_info_tt.js'
    },
    img: {
      dist: ['css/*.png', 'e3/images/**/*.png', 'images/*.png']
    },
    denull: {
      'js/mod_info_mf.js': 'js/mod_info_mf.js',
      'js/mod_info_tt.js': 'js/mod_info_tt.js'
    },
    rev: {
      css: 'css/*',
      fonts: 'fonts/*',
      js: 'js/*.js'
    },
    usemin: {
      css: 'css/*.main.css',
      html: 'index.html'
    },
    html: {
      files: ['index.html']
    },
    compress: {
      zip: {
        options: {
          mode: 'zip',
          level: 9
        },
        files: {
          'NUSMods-Offline.zip': [
            'css/*.main.css',
            'css/*.gif',
            'css/*.png',
            'e3/**',
            'fonts/*',
            'index.html',
            'js/**'
          ]
        }
      }
    },
    watch: {
      coffee: {
        files: 'src/coffee/**/*.coffee',
        tasks: 'coffee:compile'
      },
      less: {
        files: ['src/css/**/*.css', 'src/less/**/*.less'],
        tasks: 'less'
      },
      concat: {
        files: 'src/js/**/*.js',
        tasks: 'concat'
      },
      tasks: {
        files: 'tasks/*.coffee',
        tasks: 'coffee:tasks'
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib');

  grunt.renameTask('server', 'grunt-server');
  grunt.loadNpmTasks('node-build-script');
  grunt.renameTask('grunt-server', 'server');

  // Override default behavior of ignoring files
  // in .gitignore as some are needed for build.
  grunt.renameHelper('copy', 'node-build-script-copy');
  grunt.registerHelper('copy', function(src, dest, ignores, cb) {
    grunt.helper('node-build-script-copy', src, dest, ['.buildignore'], cb);
  });

  // Override to handle ? and # in CSS url() references
  grunt.registerHelper('usemin:post:css', function(content) {
    grunt.log.writeln('Update the CSS with new img filenames');
    content = grunt.helper('replace', content, /url\(\s*['"]([^"'?#]+)[^"']*["']\s*\)/gm);
    return content;
  });

  grunt.loadTasks('tasks');
  grunt.registerTask('dev', 'coffee less concat');
  grunt.registerTask('default', 'download jsify dev clean mkdirs css min ' +
                                'denull rev usemin html compress time');
};