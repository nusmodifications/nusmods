// Generated on 2013-06-19 using generator-webapp 0.2.4
'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist'
    };

    grunt.initConfig({
        yeoman: yeomanConfig,
        watch: {
            options: {
                nospawn: true
            },
            coffee: {
                files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
                tasks: ['coffee:dist']
            },
            coffeeTest: {
                files: ['test/spec/{,*/}*.coffee'],
                tasks: ['coffee:test']
            },
            compass: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
                tasks: ['compass:server', 'autoprefixer' ]
            },
            styles: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
                tasks: ['copy:styles', 'autoprefixer']
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    '<%= yeoman.app %>/*.html',
                    '.tmp/styles/{,*/}*.css',
                    '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        connect: {
            options: {
                port: 9000,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, yeomanConfig.app)
                        ];
                    }
                }
            },
            test: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'test')
                        ];
                    }
                }
            },
            dist: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, yeomanConfig.dist)
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>'
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/scripts/{,*/}*.js',
                '!<%= yeoman.app %>/scripts/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://localhost:<%= connect.options.port %>/index.html']
                }
            }
        },
        coffee: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/scripts',
                    src: '{,*/}*.coffee',
                    dest: '.tmp/scripts',
                    ext: '.js'
                }]
            },
            test: {
                files: [{
                    expand: true,
                    cwd: 'test/spec',
                    src: '{,*/}*.coffee',
                    dest: '.tmp/spec',
                    ext: '.js'
                }]
            }
        },
        compass: {
            options: {
                sassDir: '<%= yeoman.app %>/styles',
                cssDir: '.tmp/styles',
                generatedImagesDir: '.tmp/images/generated',
                imagesDir: '<%= yeoman.app %>/images',
                javascriptsDir: '<%= yeoman.app %>/scripts',
                fontsDir: '<%= yeoman.app %>/styles/fonts',
                importPath: '<%= yeoman.app %>/bower_components',
                httpImagesPath: '/images',
                httpGeneratedImagesPath: '/images/generated',
                httpFontsPath: '/styles/fonts',
                relativeAssets: false
            },
            dist: {},
            server: {
                options: {
                    debugInfo: true
                }
            }
        },
        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '{,*/}*.css',
                    dest: '.tmp/styles/'
                }]
            }
        },
        // not used since Uglify task does concat,
        // but still available if needed
        concat: {
            dist: {
                files: {
                    'app/bower_components/qTip2/dist/jquery.qtip.js': [
                        'app/bower_components/qTip2/src/core/intro.js',
                        'app/bower_components/qTip2/src/core/constants.js',
                        'app/bower_components/qTip2/src/core/class.js',

                        'app/bower_components/qTip2/src/core/options.js',
                        'app/bower_components/qTip2/src/core/content.js',
                        'app/bower_components/qTip2/src/core/position.js',
                        'app/bower_components/qTip2/src/core/toggle.js',
                        'app/bower_components/qTip2/src/core/focus.js',
                        'app/bower_components/qTip2/src/core/disable.js',
                        'app/bower_components/qTip2/src/core/button.js',
                        'app/bower_components/qTip2/src/core/style.js',
                        'app/bower_components/qTip2/src/core/events.js',

                        'app/bower_components/qTip2/src/core/jquery_methods.js',
                        'app/bower_components/qTip2/src/core/jquery_overrides.js',

                        'app/bower_components/qTip2/src/core/defaults.js',

                        'app/bower_components/qTip2/src/tips/tips.js',
                        'app/bower_components/qTip2/src/viewport/viewport.js',

                        'app/bower_components/qTip2/src/core/outro.js',

                        'app/bower_components/imagesloaded/jquery.imagesloaded.js'
                    ],
                    'app/bower_components/qTip2/src/_core.scss': 'app/bower_components/qTip2/src/core.css',
                    'app/bower_components/qTip2/src/_css3.scss': 'app/bower_components/qTip2/src/css3.css',
                    'app/bower_components/qTip2/src/tips/_tips.scss': 'app/bower_components/qTip2/src/tips/tips.css',
                    'app/bower_components/select2/_select2.scss': 'app/bower_components/select2/select2.css'
                }
            }
        },
        requirejs: {
            dist: {
                // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
                options: {
                    // `name` and `out` is set by grunt-usemin
                    baseUrl: yeomanConfig.app + '/scripts',
                    optimize: 'none',
                    // TODO: Figure out how to make sourcemaps work with grunt-usemin
                    // https://github.com/yeoman/grunt-usemin/issues/30
                    //generateSourceMaps: true,
                    // required to support SourceMaps
                    // http://requirejs.org/docs/errors.html#sourcemapcomments
                    paths: {
                        timetableData: 'empty:'
                    },
                    preserveLicenseComments: false,
                    useStrict: true,
                    wrap: true
                    //uglify2: {} // https://github.com/mishoo/UglifyJS2
                }
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        //'<%= yeoman.dist %>/scripts/{,*/}*.js',
                        '<%= yeoman.dist %>/styles/{,*/}*.css',
                        '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                        '<%= yeoman.dist %>/styles/fonts/*'
                    ]
                }
            }
        },
        useminPrepare: {
            options: {
                dest: '<%= yeoman.dist %>'
            },
            html: '<%= yeoman.app %>/index.html'
        },
        usemin: {
            options: {
                dirs: ['<%= yeoman.dist %>']
            },
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css']
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/styles/exports.css': '.tmp/styles/exports.css',
                    '<%= yeoman.dist %>/styles/main.css': '.tmp/styles/main.css'
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    //collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    src: '*.html',
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        // Put files not handled in other tasks here
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{config,ico,php,png,swf,txt}',
                        '.htaccess',
                        'images/{,*/}*.{webp,gif}',
                        'media/*',
                        'json/*',
                        'scripts/nus_timetable_data.js',
                        'snappy/**',
                        'styles/*.{gif,png}',
                        'styles/fonts/*'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/images',
                    dest: '<%= yeoman.dist %>/images',
                    src: [
                        'generated/*'
                    ]
                }]
            },
            styles: {
                expand: true,
                dot: true,
                cwd: '<%= yeoman.app %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            }
        },
        concurrent: {
            server: [
                'compass',
                'coffee:dist',
                'copy:styles',
                'autoprefixer'
            ],
            test: [
                'coffee',
                'copy:styles',
                'autoprefixer'
            ],
            dist: [
                'coffee',
                'compass',
                'copy:styles',
                'imagemin',
                'svgmin',
                'htmlmin'
            ]
        },
        bower: {
            options: {
                exclude: ['modernizr']
            },
            all: {
                rjsConfig: '<%= yeoman.app %>/scripts/main.js'
            }
        },
        crawlNTU: {
            academicYear: 2012,
            baseUrl: 'https://wish.wis.ntu.edu.sg/webexe/owa/',
            cachePath: 'cache',
            dest: 'app/json/ntu_module_info.json',
            maxCacheAge: 24 * 60 * 60, // in seconds
            maxConcurrentFiles: 64,
            maxConcurrentSockets: 8,
            refresh: false,
            semester: 2
        },
        crawlNUS: {
            academicYear: 2012,
            baseUrl: 'https://sit.aces01.nus.edu.sg/cors/jsp/report/',
            cachePath: 'cache',
            dest: 'app/json/nus_module_info.json',
            maxCacheAge: 24 * 60 * 60, // in seconds
            maxConcurrentFiles: 64,
            maxConcurrentSockets: 8,
            refresh: false,
            semester: 2
        },
        download: {
            ntu: {
                options: {
                    dest: 'app/json/ntu_module_info.json',
                    src: 'http://nusmods.com/json/ntu_module_info.json'
                }
            },
            nus: {
                options: {
                    dest: 'app/json/nus_module_info.json',
                    src: 'http://nusmods.com/json/nus_module_info.json'
                }
            }
        },
        jsifyNTU: {
            destModuleFinder: 'app/scripts/ntu_module_data.js',
            destTimetable: 'app/scripts/ntu_timetable_data.js',
            src: 'app/json/ntu_module_info.json'
        },
        jsifyNUS: {
            destModuleFinder: 'app/scripts/nus_module_data.js',
            destTimetable: 'app/scripts/nus_timetable_data.js',
            src: 'app/json/nus_module_info.json'
        }
    });

    grunt.loadTasks('tasks');

    grunt.registerTask('server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'concat',
            'concurrent:server',
            'autoprefixer',
            'connect:livereload',
            'open',
            'watch'
        ]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'connect:test',
        'mocha'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'useminPrepare',
        'concat',
        'concurrent:dist',
        'autoprefixer',
        'requirejs',
        'cssmin',
        'concat',
        'uglify',
        'copy:dist',
        'rev',
        'usemin'
    ]);

    grunt.registerTask('default', [
        //'jshint',
        //'test',
        'build'
    ]);
};
