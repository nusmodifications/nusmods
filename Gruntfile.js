'use strict';

module.exports = function (grunt) {
  var config = {
    defaults: {
      cachePath: 'cache',
      concurrencyLimit: 128,
      // Maximum cache age in seconds. Can be set to 0 to force refresh every
      // time. If set to -1, cached files never expire and are always used.
      // By default, force refresh for dist build, cache for one day otherwise.
      maxCacheAge: grunt.option('target') === 'dist' ? 0 : 86400,
      destFolder: 'app/api',
      // Pretty-print JSON with '\t', uglify JSON with ''.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#space_argument
      jsonSpace: grunt.option('target') === 'dist' ? '' : '\t'
    },
    bulletinModules: {
      options: {
        cachePath: '<%= defaults.cachePath %>',
        maxCacheAge: '<%= defaults.maxCacheAge %>',
        destFolder: '<%= defaults.destFolder %>',
        jsonSpace: '<%= defaults.jsonSpace %>',
        destFileName: 'bulletinModulesRaw.json',
        ivleApi: grunt.file.readJSON('ivleApi.json'),
        venuesApi: grunt.file.readJSON('venuesApi.json'),
      },
      semester0: {
        options: {
          semester: '0'
        }
      },
      semester1: {
        options: {
          semester: '1'
        }
      },
      semester2: {
        options: {
          semester: '2'
        }
      },
      semester3: {
        options: {
          semester: '3'
        }
      },
      semester4: {
        options: {
          semester: '4'
        }
      }
    },
    cors: {
      options: {
        cachePath: '<%= defaults.cachePath %>',
        maxCacheAge: '<%= defaults.maxCacheAge %>',
        destFolder: '<%= defaults.destFolder %>',
        jsonSpace: '<%= defaults.jsonSpace %>',
        destFileName: 'corsRaw.json',
        destLessonTypes: 'lessonTypes.json',
        types: ['Module', 'GEM', 'SSM', 'UEM', 'CFM']
      },
      regularSemester: {
        options: {
          baseUrl: 'https://myaces.nus.edu.sg/cors/jsp/report/'
        }
      },
      specialTerm: {
        options: {
          baseUrl: 'https://myaces.nus.edu.sg/sts/jsp/report/'
        }
      }
    },
    corsBiddingStats: {
      options: {
        cachePath: '<%= defaults.cachePath %>',
        destFolder: '<%= defaults.destFolder %>',
        jsonSpace: '<%= defaults.jsonSpace %>',
        destFileName: 'corsBiddingStatsRaw.json'
      }
    },
    examTimetable: {
      options: {
        cachePath: '<%= defaults.cachePath %>',
        maxCacheAge: '<%= defaults.maxCacheAge %>',
        destFolder: '<%= defaults.destFolder %>',
        jsonSpace: '<%= defaults.jsonSpace %>',
        jquery: 'jquery.min.js',
        destFileName: 'examTimetableRaw.json'
      },
      ay2014to2015sem1: {
        options: {
          academicYear: '2014/2015',
          semester: '1'
        }
      },
      ay2014to2015sem2: {
        options: {
          academicYear: '2014/2015',
          semester: '2'
        }
      },
      ay2015to2016sem1: {
        options: {
          academicYear: '2015/2016',
          semester: '1'
        }
      }
    },
    ivle: {
      options: {
        cachePath: '<%= defaults.cachePath %>',
        concurrencyLimit: '<%= defaults.concurrencyLimit %>',
        maxCacheAge: '<%= defaults.maxCacheAge %>',
        srcFolder: '<%= defaults.destFolder %>',
        destFolder: '<%= defaults.destFolder %>',
        jsonSpace: '<%= defaults.jsonSpace %>',
        destFileName: 'ivleRaw.json',
        ivleApi: grunt.file.readJSON('ivleApi.json')
      }
    },
    moduleTimetableDelta: {
      options: {
        cachePath: '<%= defaults.cachePath %>',
        maxCacheAge: '<%= defaults.maxCacheAge %>',
        destFolder: '<%= defaults.destFolder %>',
        jsonSpace: '<%= defaults.jsonSpace %>',
        destFileName: 'moduleTimetableDeltaRaw.json',
        ivleApi: grunt.file.readJSON('ivleApi.json')
      }
    },
    consolidate: {
      options: {
        jsonSpace: '<%= defaults.jsonSpace %>',
        srcFolder: '<%= defaults.destFolder %>',
        destFileName: 'consolidatedRaw.json'
      }
    },
    normalize: {
      options: {
        srcFolder: '<%= defaults.destFolder %>',
        jsonSpace: '<%= defaults.jsonSpace %>',
        destFileName: 'modules.json',
        destFacultyDepartments: 'facultyDepartments.json',
        destVenues: 'venues.json',
      }
    },
    split: {
      options: {
        srcFolder: '<%= defaults.destFolder %>',
        jsonSpace: '<%= defaults.jsonSpace %>',
        destModuleCodes: 'moduleCodes.json',
        destModuleList: 'moduleList.json',
        destModuleInformation: 'moduleInformation.json',
        destTimetableInformation: 'timetable.json',
        destVenueInformation: 'venueInformation.json',
        destSubfolder: 'modules'
      }
    },
    joinSems: {
      options: {
        srcFolder: '<%= defaults.destFolder %>',
        jsonSpace: '<%= defaults.jsonSpace %>'
      },
      ay2014to2015sem2: {
        options: {
          academicYear: '2014/2015',
          semester: '2'
        }
      },
      ay2015to2016sem1: {
        options: {
          academicYear: '2015/2016',
          semester: '1'
        }
      }
    },
    splitSems: {
      options: {
        srcFolder: '<%= defaults.destFolder %>',
        jsonSpace: '<%= defaults.jsonSpace %>'
      },
      ay2014to2015: {
        options: {
          academicYear: '2014/2015'
        }
      },
      ay2015to2016: {
        options: {
          academicYear: '2015/2016'
        }
      }
    },
    venues: {
      options: {
        cachePath: '<%= defaults.cachePath %>',
        maxCacheAge: '<%= defaults.maxCacheAge %>',
        destFolder: '<%= defaults.destFolder %>',
        jsonSpace: '<%= defaults.jsonSpace %>',
        destFileName: 'venuesRaw.json',
        venuesApi: grunt.file.readJSON('venuesApi.json')
      }
    },
    rsync: {
      options: {
        args: ['-cruv']
      },
      'api.nusmods.com': {
        options: {
          src: '<%= defaults.destFolder %>/*',
          dest: '~/api.nusmods.com'
        }
      }
    },
    shell: {
      runPrereqParser: {
        command: function (academicYearAndSem) {
          var path = require('path'),
              config = grunt.config('normalize').options,
              matches = academicYearAndSem.match(/ay(20\d\d)to(20\d\d)(?:sem(\d))?/);
          var dataPath = path.join(
            '..',
            config.srcFolder,           //default source folder
            matches[1]+'-'+matches[2],  //academic year
            matches[3] || '',           //semester if present
            config.destFileName         //normalized file name
          );
          return 'python init_parsing.py ' + dataPath;
        },
        options: {
          execOptions: {
            cwd: 'tasks'
          }
        }
      }
    }
  };

  var AY_START = 2014;
  var AY_END = 2016;

  // Generate task targets.
  ['ivle', 'consolidate', 'normalize', 'split'].forEach(function (task) {
    for (var ay = AY_START; ay < AY_END; ay++) {
      for (var sem = 1; sem < 5; sem++) {
        config[task]['ay' + ay + 'to' + (ay + 1) + 'sem' + sem] = {
          options: {
            academicYear: ay + '/' + (ay + 1),
            semester: sem.toString()
          }
        };
      }
    }
  });

  grunt.initConfig(config);

  // Ensure that cache folder is created.
  grunt.file.mkdir(grunt.config('defaults').cachePath);

  grunt.loadNpmTasks('grunt-rsync');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadTasks('tasks');

  grunt.registerTask('remote', [
    'bulletinModules',
    'cors',
    'corsBiddingStats',
    'examTimetable',
    'moduleTimetableDelta',
    'ivle',
    'venues'
  ]);

  grunt.registerTask('local', [
    'consolidate',
    'normalize',
    'split',
    'joinSems',
    'shell:runPrereqParser:ay2014to2015',
    'shell:runPrereqParser:ay2015to2016',
    'splitSems'
  ]);

  grunt.registerTask('default', [
    'remote',
    'local'
  ]);
};
