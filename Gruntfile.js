'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    defaults: {
      cachePath: 'cache',
      // Maximum cache age in seconds. Can be set to 0 to force refresh every
      // time. If set to -1, cached files never expire and are always used.
      maxCacheAge: 6 * 60 * 60,
      destFolder: 'json',
      // Pretty-print JSON with '\t', uglify JSON with ''.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#space_argument
      jsonSpace: '\t'
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
          baseUrl: 'https://aces01.nus.edu.sg/cors/jsp/report/'
        }
      },
      previousSemester: {
        options: {
          maxCacheAge: -1,
          baseUrl: 'https://sit.aces01.nus.edu.sg/cors/jsp/report/'
        }
      },
      semester3: {
        options: {
          maxCacheAge: -1,
          baseUrl: 'https://sit.aces01.nus.edu.sg/sts/jsp/report/'
        }
      },
      semester4: {
        options: {
          maxCacheAge: -1,
          baseUrl: 'https://aces01.nus.edu.sg/sts/jsp/report/'
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
          academicYear: '2013/2014',
          semester: '1'
        }
      },
      ay2013to2014sem2: {
        options: {
          academicYear: '2013/2014',
          semester: '2'
        }
      }
    },
    ivle: {
      options: {
        cachePath: '<%= defaults.cachePath %>',
        maxCacheAge: '<%= defaults.maxCacheAge %>',
        destFolder: '<%= defaults.destFolder %>',
        jsonSpace: '<%= defaults.jsonSpace %>',
        destFileName: 'ivleRaw.json',
        ivleApi: grunt.file.readJSON('ivleApi.json')
      },
      ay2012to2013sem1: {
        options: {
          academicYear: '2012/2013',
          semester: '1'
        }
      },
      ay2012to2013sem2: {
        options: {
          academicYear: '2012/2013',
          semester: '2'
        }
      },
      ay2012to2013sem3: {
        options: {
          academicYear: '2012/2013',
          semester: '3'
        }
      },
      ay2012to2013sem4: {
        options: {
          academicYear: '2012/2013',
          semester: '4'
        }
      },
      ay2013to2014sem1: {
        options: {
          academicYear: '2013/2014',
          semester: '1'
        }
      },
      ay2013to2014sem2: {
        options: {
          academicYear: '2013/2014',
          semester: '2'
        }
      },
      ay2013to2014sem3: {
        options: {
          academicYear: '2013/2014',
          semester: '3'
        }
      },
      ay2013to2014sem4: {
        options: {
          academicYear: '2013/2014',
          semester: '4'
        }
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
        srcFolder: 'json',
        destFileName: 'consolidatedRaw.json'
      },
      ay2012to2013sem1: {
        options: {
          academicYear: '2012/2013',
          semester: '1'
        }
      },
      ay2012to2013sem2: {
        options: {
          academicYear: '2012/2013',
          semester: '2'
        }
      },
      ay2012to2013sem3: {
        options: {
          academicYear: '2012/2013',
          semester: '3'
        }
      },
      ay2012to2013sem4: {
        options: {
          academicYear: '2012/2013',
          semester: '4'
        }
      },
      ay2013to2014sem1: {
        options: {
          academicYear: '2013/2014',
          semester: '1'
        }
      },
      ay2013to2014sem2: {
        options: {
          academicYear: '2013/2014',
          semester: '2'
        }
      }
    },
    normalize: {
      options: {
        srcFolder: '<%= defaults.destFolder %>',
        jsonSpace: '<%= defaults.jsonSpace %>',
        destFileName: 'modules.json',
        destFacultyDepartments: 'facultyDepartments.json'
      },
      ay2012to2013sem1: {
        options: {
          academicYear: '2012/2013',
          semester: '1'
        }
      },
      ay2012to2013sem2: {
        options: {
          academicYear: '2012/2013',
          semester: '2'
        }
      },
      ay2012to2013sem3: {
        options: {
          academicYear: '2012/2013',
          semester: '3'
        }
      },
      ay2012to2013sem4: {
        options: {
          academicYear: '2012/2013',
          semester: '4'
        }
      },
      ay2013to2014sem1: {
        options: {
          academicYear: '2013/2014',
          semester: '1'
        }
      },
      ay2013to2014sem2: {
        options: {
          academicYear: '2013/2014',
          semester: '2'
        }
      }
    },
    split: {
      options: {
        srcFolder: '<%= defaults.destFolder %>',
        jsonSpace: '<%= defaults.jsonSpace %>',
        destModuleCodes: 'moduleCodes.json',
        destModuleList: 'moduleList.json',
        destSubfolder: 'modules'
      },
      ay2012to2013sem1: {
        options: {
          academicYear: '2012/2013',
          semester: '1'
        }
      },
      ay2012to2013sem2: {
        options: {
          academicYear: '2012/2013',
          semester: '2'
        }
      },
      ay2012to2013sem3: {
        options: {
          academicYear: '2012/2013',
          semester: '3'
        }
      },
      ay2012to2013sem4: {
        options: {
          academicYear: '2012/2013',
          semester: '4'
        }
      },
      ay2013to2014sem1: {
        options: {
          academicYear: '2013/2014',
          semester: '1'
        }
      },
      ay2013to2014sem2: {
        options: {
          academicYear: '2013/2014',
          semester: '2'
        }
      }
    },
    backwardCompatibility: {
      options: {
        srcFolder: '<%= defaults.destFolder %>',
        jsonSpace: '<%= defaults.jsonSpace %>',
        destFileName: 'mod_info.json'
      },
      ay2013to2014sem1: {
        options: {
          academicYear: '2013/2014',
          semester: '1'
        }
      }
    }
  });

  // Ensure that cache folder is created.
  grunt.file.mkdir(grunt.config('defaults').cachePath);

  grunt.loadTasks('tasks');

  // Takes about half an hour.
  grunt.registerTask('all', [
    'bulletinModules',
    'cors',
    'corsBiddingStats',
    'examTimetable',
    'ivle',
    'moduleTimetableDelta',
    'consolidate',
    'normalize',
    'split',
    'backwardCompatibility'
  ]);

  grunt.registerTask('ay2012to2013sem2', [
    'bulletinModules:semester2',
    'cors:previousSemester',
    'corsBiddingStats',
    'examTimetable:ay2012to2013sem2',
    'ivle:ay2012to2013sem2',
    'moduleTimetableDelta',
    'consolidate:ay2012to2013sem2',
    'normalize:ay2012to2013sem2',
    'split:ay2012to2013sem2',
    'backwardCompatibility:ay2012to2013sem2'
  ]);

  grunt.registerTask('ay2013to2014sem1', [
    'bulletinModules:semester1',
    'cors:currentSemester',
    'examTimetable:ay2013to2014sem1',
    'ivle:ay2013to2014sem1',
    'moduleTimetableDelta',
    'consolidate:ay2013to2014sem1',
    'normalize:ay2013to2014sem1',
    'split:ay2013to2014sem1',
    'backwardCompatibility:ay2013to2014sem1'
  ]);

  grunt.registerTask('ay2013to2014sem2', [
    'bulletinModules:semester2',
    'examTimetable:ay2013to2014sem2',
    'ivle:ay2013to2014sem2',
    'moduleTimetableDelta',
    'consolidate:ay2013to2014sem2',
    'normalize:ay2013to2014sem2',
    'split:ay2013to2014sem2'
  ]);

  grunt.registerTask('ay2013to2014', [
    'ay2013to2014sem1',
    'ay2013to2014sem2'
  ]);

  grunt.registerTask('default', 'ay2013to2014sem1');
};
