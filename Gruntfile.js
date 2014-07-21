'use strict';

module.exports = function (grunt) {
  var config = {
    defaults: {
      cachePath: 'cache',
      concurrencyLimit: 128,
      // Maximum cache age in seconds. Can be set to 0 to force refresh every
      // time. If set to -1, cached files never expire and are always used.
      maxCacheAge: 6 * 60 * 60,
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
        ivleApi: grunt.file.readJSON('ivleApi.json')
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
      currentSemester: {
        options: {
          baseUrl: 'https://myaces.nus.edu.sg/cors/jsp/report/'
        }
      }
    },
    corsBiddingStats: {
      options: {
        cachePath: '<%= defaults.cachePath %>',
        maxCacheAge: -1,
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
      ay2012to2013sem1: {
        options: {
          maxCacheAge: -1,
          academicYear: '2012/2013',
          semester: '1'
        }
      },
      ay2012to2013sem2: {
        options: {
          maxCacheAge: -1,
          academicYear: '2012/2013',
          semester: '2'
        }
      },
      ay2013to2014sem1: {
        options: {
          maxCacheAge: -1,
          academicYear: '2013/2014',
          semester: '1'
        }
      },
      ay2013to2014sem2: {
        options: {
          maxCacheAge: -1,
          academicYear: '2013/2014',
          semester: '2'
        }
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
        destFacultyDepartments: 'facultyDepartments.json'
      }
    },
    split: {
      options: {
        srcFolder: '<%= defaults.destFolder %>',
        jsonSpace: '<%= defaults.jsonSpace %>',
        destModuleCodes: 'moduleCodes.json',
        destModuleList: 'moduleList.json',
        destModuleInformation: 'moduleInformation.json',
        destSubfolder: 'modules'
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
              config = grunt.config("normalize")["options"],
              matches = academicYearAndSem.match(/ay(20\d\d)to(20\d\d)sem(\d)/);
          var dataPath = path.join(
            '..',
            config["srcFolder"],        //default source folder
            matches[1]+'-'+matches[2],  //academic year
            matches[3],                 //semester
            config["destFileName"]      //normalized file name
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

  var AY_START = 2012;
  var AY_END = 2015;

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

  // Takes about half an hour.
  grunt.registerTask('all', [
    'bulletinModules',
    'cors',
    'corsBiddingStats',
    'examTimetable',
    'moduleTimetableDelta',
    'ivle',
    'consolidate',
    'normalize',
    'split'
  ]);

  grunt.registerTask('ay2014to2015sem1', [
    'bulletinModules:semester1',
    'cors:currentSemester',
    'corsBiddingStats',
    'examTimetable:ay2014to2015sem1',
    'moduleTimetableDelta',
    'ivle:ay2014to2015sem1',
    'consolidate:ay2014to2015sem1',
    'normalize:ay2014to2015sem1',
    'shell:runPrereqParser:ay2014to2015sem1',
    'split:ay2014to2015sem1'
  ]);

  grunt.registerTask('ay2014to2015sem2', [
    'bulletinModules:semester2',
    'corsBiddingStats',
    'examTimetable:ay2014to2015sem2',
    'moduleTimetableDelta',
    'ivle:ay2014to2015sem2',
    'consolidate:ay2014to2015sem2',
    'normalize:ay2014to2015sem2',
    'shell:runPrereqParser:ay2014to2015sem2',
    'split:ay2014to2015sem2'
  ]);

  grunt.registerTask('default', 'ay2014to2015sem1');
};
