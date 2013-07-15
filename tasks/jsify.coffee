module.exports = (grunt) ->
  fs = require 'fs'

  grunt.registerTask 'jsify', 'Generate module information JS files.', ->
    options = grunt.utils._.defaults grunt.config(this.name),
      destModuleFinder: 'mod_info_mf.js',
      destTimetable: 'mod_info_tt.js',
      src: 'mod_info.json'

    mod_info = grunt.file.readJSON(options.src)

    modTypes = {}
    rooms = {}

    mods = {}
    raw = [
      'description',
      'prerequisite',
      'preclusion',
      'title',
      'workload'
    ]
    processed = [
      'code',
      'department',
      'exam',
      'mcs',
      'lectures',
      'tutorials',
      'types'
    ]
    mods[key] = [] for key in raw.concat processed

    weeks =
      'EVERY&nbsp;WEEK': 0
      'ODD&nbsp;WEEK': 1
      'EVEN&nbsp;WEEK': 2
    days =
      MONDAY: 0
      TUESDAY: 1
      WEDNESDAY: 2
      THURSDAY: 3
      FRIDAY: 4
      SATURDAY: 5
    lessonTypes =
      'DESIGN LECTURE': 0
      'LABORATORY': 1
      'LECTURE': 2
      'PACKAGED LECTURE': 3
      'PACKAGED TUTORIAL': 4
      'RECITATION': 5
      'SECTIONAL TEACHING': 6
      'SEMINAR-STYLE MODULE CLASS': 7
      'TUTORIAL': 8
      'TUTORIAL TYPE 2': 9
      'TUTORIAL TYPE 3': 10

    keys = ['modType', 'room']
    sets = {}
    index = {}
    for key in keys.concat 'dept'
      sets[key] = {}
      index[key] = {}

    for code, mod of mod_info.cors
      sets.dept[mod.department] = true
      sets.modType[mod.types.join()] = true
      for lecTut in ['lectures', 'tutorials']
        if mod[lecTut]
          for lesson in mod[lecTut]
            if !lessonTypes[lesson.type]?
              grunt.warn "Unrecognized lesson type #{lesson.type}."
            sets.room[lesson.room] = true

    for fac, depts of mod_info.departments
      if !depts.length
        delete mod_info.departments[fac]
        continue
      i = 0
      while i < depts.length
        if sets.dept[depts[i]]
          index.dept[depts[i++]] = Object.keys(index.dept).length
        else
          depts.splice i, 1
      delete mod_info.departments[fac] if !depts.length

    for key in keys
      for val, i in sets[key] = Object.keys(sets[key]).sort()
        index[key][val] = i

    for code in Object.keys(mod_info.cors).sort()
      mod = mod_info.cors[code]
      mods.code.push mod.label
      mods[key].push mod[key] for key in raw
      if mod.examTime
        mods.exam.push Date.parse(mod.examTime)
      else
        if mod.examCORS
          grunt.log.error "#{code} exam on #{mod.examCORS} is in CORS but " +
                          'not in exam timetable yet.'
        mods.exam.push null
      mods.mcs.push +mod.mcs
      mods.department.push index.dept[mod.department]
      mods.types.push(index.modType[mod.types.join()])
      for lecTut in ['lectures', 'tutorials']
        lessons = undefined
        if mod[lecTut]
          lessons = {}
          for lesson in mod[lecTut]
            unless (week = weeks[lesson.week])?
              weekNos = (+weekNo for weekNo in lesson.week.split(','))
              week = weekNos[0].toString()
              for i in [1...weekNos.length]
                week += (if weekNos[i-1] == weekNos[i] - 1 then '-' else ',') +
                        weekNos[i]
              week = week.replace /-[^,]+-/g, '-'
            ((lessons[lessonTypes[lesson.type]] ||= {})[lesson.group] ||= [])
            .push [
              week,
              days[lesson.day],
              lesson.start,
              lesson.end,
              index.room[lesson.room]
            ]
        mods[lecTut].push lessons

    titleize = (str) ->
      arr = str.toLowerCase().split(' ')
      for word, i in arr
        if word not in ['and', 'for', 'of']
          word = word.replace /(^\W*|[-/])[a-z]/g, (w) ->
            w.toUpperCase()
        arr[i] = word
      arr.join ' '

    departments = {}
    for fac, depts of mod_info.departments
      departments[titleize(fac)] = (titleize(dept) for dept in depts)

    longType =
      Module: 'Faculty'
      GEM: 'General Education'
      SSM: 'Singapore Studies'
      UEM: 'Breadth / Unrestricted Elective'
    modTypes = ((longType[t] for t in type.split(',')) for type in sets.modType)

    grunt.file.write options.destTimetable, 'var modInfoTT=' +
    JSON.stringify
      correctAsAt: mod_info.correctAsAt
      rooms: sets.room
      title: mods.title
      code: mods.code
      exam: mods.exam
      lectures: mods.lectures
      tutorials: mods.tutorials
    , null
    , '\t'

    grunt.log.writeln "File #{options.destTimetable} created."

    grunt.file.write options.destModuleFinder, 'var modInfoMF=' +
    JSON.stringify
      departments: departments
      modTypes: modTypes
      description: mods.description
      prerequisite: mods.prerequisite
      preclusion: mods.preclusion
      workload: mods.workload
      mcs: mods.mcs
      department: mods.department
      types: mods.types
    , null
    , '\t'

    grunt.log.writeln "File #{options.destModuleFinder} created."