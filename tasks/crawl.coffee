module.exports = (grunt) ->
  cheerio = require 'cheerio'
  fs = require 'fs'
  http = require 'http'
  https = require 'https'
  path = require 'path'
  url = require 'url'

  # Conservative throttling
  http.globalAgent.maxSockets = https.globalAgent.maxSockets = 1

  cacheThreshold = options = undefined

  cachePath = (urlStr) ->
    urlStr += '.html' unless urlStr[-5..] == '.html'
    path.join options.cachePath, encodeURIComponent(urlStr)

  protocol = 'http:': http, 'https:': https

  get = (urlStr, callback, cache = false) ->
    urlObj = url.parse urlStr
    protocol[urlObj.protocol].get urlObj, (res) ->
      if res.statusCode == 200
        data = ''
        res.on 'data', (chunk) -> data += chunk
        res.on 'end', -> callback data
        res.pipe fs.createWriteStream(cachePath(urlStr)) if cache
      else
        grunt.warn "#{res.statusCode} while getting #{urlStr}."
    .on 'error', (err) -> grunt.warn "#{err} while getting #{urlStr}."

  queue = grunt.utils.async.queue (filename, callback) ->
    fs.readFile filename, 'utf8', (err, data) ->
      grunt.warn "#{err} while reading #{filename}." if err
      callback data
  , 64

  getCached = (urlStr, callback) ->
    return get urlStr, callback, true if options.refresh
    cachedPath = cachePath urlStr
    fs.stat cachedPath, (err, stats) ->
      if !err && stats.mtime > cacheThreshold
        queue.push cachedPath, callback
      else
        get urlStr, callback, true

  get$ = (urlStr, callback) ->
    getCached urlStr, (data) -> callback cheerio.load(data)

  CORS_BASE = 'https://aces01.nus.edu.sg/cors/jsp/report/'

  grunt.registerTask 'crawl', 'Crawl module information.', ->
    done = this.async()

    options = grunt.utils._.defaults grunt.config(this.name),
      cachePath: 'cache'
      dest: 'mod_info.json'
      maxCacheAge: 2 * 86400, # in seconds
      nusBulletin: false
      refresh: undefined,
    options.nusBulletin = true if this.flags.nusBulletin
    options.refresh = true if this.flags.refresh

    cacheThreshold = new Date(Date.now() - options.maxCacheAge * 1000)

    grunt.file.mkdir options.cachePath

    nbMods = {}

    grunt.utils.async.series
      correctAsAt: (callback) ->
        getCached CORS_BASE + 'ModuleInfoListing.jsp?fac_c=10', (data) ->
          re = /Correct as at ([^<]+)</
          if match = re.exec data
            if !options.refresh? && fs.existsSync(options.dest) &&
            match[1] != grunt.file.readJSON(options.dest).correctAsAt
              options.refresh = true
            callback null, match[1]
          else
            grunt.warn "#{re} not found."
      departments: (callback) ->
        depts = {}
        baseURL = CORS_BASE + 'CFMInfoListing.jsp'
        get$ baseURL, ($) ->
          grunt.utils.async.forEach $('select[name=fac_c] > option').siblings().toArray()
          , (el, callback) ->
            fac = depts[$(el).text()] = []
            get$ "#{baseURL}?fac_c=#{$(el).attr('value')}", ($) ->
              $('select[name=dept_c] > option').siblings().each ->
                fac.push $(this).text()
              callback()
          , (err) ->
            depts['NON-FACULTY-BASED DEPARTMENTS'].push 'ANGSANA COLLEGE',
              'TEMBUSU COLLEGE', 'CENTRE FOR QUANTUM TECHNOLOGIES'
            depts['UNIVERSITY ADMINISTRATION'].push 'OFFICE OF STUDENT AFFAIRS'
            callback null, depts
      cors: (callback) ->
        mods = {}
        types = ['Module', 'GEM', 'SSM', 'UEM', 'CFM']
        keys = ['title', 'description', '', 'examCORS', 'mcs', 'prerequisite',
        'preclusion', 'workload']
        reURLDept = /(ModuleD.+)">([^<]+)[\s\S]+?> (.*)<\/div>\s*<\/td>\s*<\/?tr/g
        reNull = /^(--|n[/.]?a\.?|nil|none\.?|null|No Exam Date\.)$/i
        grunt.utils.async.forEachSeries types
        , (type, callback) ->
          getCached CORS_BASE + type + 'InfoListing.jsp', (data) ->
            grunt.utils.async.forEach (match while match = reURLDept.exec data)
            , (match, callback) ->
              label = match[2]
              code = label.split(' ')[0]
              if code of mods
                mods[code].types.push type
                callback()
              else
                nbMods[code] = {}
                mod = mods[code] =
                  label: label
                  types: [type]
                  department: match[3]
                get$ CORS_BASE + match[1], ($) ->
                  $('td[colspan="2"]').each (i) ->
                    if (key = keys[i]) &&
                    !reNull.test(field = $(this).text().trim().replace(/\s+/g, ' '))
                      mod[key] = field
                  for lecTut, i in ['lectures', 'tutorials']
                    $('table.tableframe')
                      .eq(i + 1)
                      .children('tr[bgcolor=#eeeeee], tr[bgcolor=#ffffff]')
                      .each ->
                        tr = ($(el).text() for el in $(this).children().toArray())
                        if tr?.length > 6
                          (mod[lecTut] ||= []).push
                            group: tr[0].trim()
                            type: tr[1]
                            week: tr[2]
                            day: tr[3]
                            start: "000#{tr[4]}"[-4..]
                            end: "000#{tr[5]}"[-4..]
                            room: tr[6].replace(/,$/, '')
                  callback()
            , callback
        , (err) ->
          if mods.QT5101.department == 'NA'
            mods.QT5101.department = 'CENTRE FOR QUANTUM TECHNOLOGIES'
          else
            grunt.log.writeln "QT5101's department is no longer NA."
          callback null, mods
      examTimes: (callback) ->
        examTimes = {}
        getCached 'https://webrb.nus.edu.sg/examtt/Exam2012/Semester 1/' +
        'MASTER Sem 1 by Module.html', (data) ->
          reTD = /<TD><FONT size=-1>([^<]*)/g
          keys = ['fac', 'code', 'title', 'date', 'time']
          while reTD.exec data
            exam = {}
            exam[key] = reTD.exec(data)[1] for key in keys
            [h, mm, A] = exam.time.split /[: ]/
            nbMods[exam.code] = {}
            examTimes[exam.code] = (
              new Date(
                Date.UTC(
                  exam.date[6..9],
                  +exam.date[3..4] - 1,
                  exam.date[..1],
                  (if A == 'AM' then +h else +h + 12),
                  mm
                )
              )
            ).toISOString()[..15] + '+0800'
          callback null, examTimes
      nusBulletin: (callback) ->
        return callback() unless options.nusBulletin
        getCached 'http://www.nus.edu.sg/registrar/nusbulletin/faculty.html',
        (data) ->
          reFac = /showfaculty\('(.+)', '?(\w+)/g
          reMod = /\?modeCode=(\w+)/g
          reSem = /semester=(\d)&modeCode=(\w+)&acadYear=(\d{4}\/\d{4})/g
          grunt.utils.async.forEach (match[2] while match = reFac.exec data)
          , (facParam, callback) ->
            getCached 'http://ivle7.nus.edu.sg/lms/Account/NUSBulletin/' +
            "msearch.aspx?fac=#{facParam}", (data) ->
              while match = reMod.exec data
                nbMods[match[1]] = {}
              while match = reSem.exec data
                (nbMods[match[2]].sems ||= []).push
                  year: match[3]
                  sem: +match[1]
              callback()
          , (err) ->
            grunt.utils.async.forEach Object.keys(nbMods)
            , (modCode, callback) ->
              reFacDept = /<b>([^,]+).+<br>([^<]+)/g
              reTD = /<b>([^<]+)<.+serif>([\s\S]+?)<\/font><\/td>/g
              reNull = /^(--?|n[/.]?a\.?|nil|none)$/i
              trySems = [
                {year: '2012/2013', sem: 1},
                {year: '2011/2012', sem: 1},
                {year: '2012/2013', sem: 2},
                {year: '2012/2013', sem: 4},
                {year: '2011/2012', sem: 4}
              ]
              keys =
                'Module Title': 'title'
                'Description': 'desc'
                'Module Credit': 'mc'
                'Workload': 'workload'
                'Prerequisites': 'prereqs'
                'Co-Requisite': 'coReq'
                'Preclusions': 'preclusions'
                'Cross-listing': 'crossListing'
              mod = nbMods[modCode]
              trySems.unshift sems[sems.length - 1] if sems = mod.sems
              grunt.utils.async.forEachSeries trySems
              , (sem, callback) ->
                getCached 'http://ivle7.nus.edu.sg/lms/Account/NUSBulletin/' +
                "msearch_view.aspx?semester=#{sem.sem}&modeCode=#{modCode}" +
                "&acadYear=#{sem.year}", (data) ->
                  if data.length >= 2450
                    match = reFacDept.exec data
                    mod.fac = match[1]
                    mod.dept = match[2]
                    while match = reTD.exec data
                      if match[1] != 'Module Code' &&
                      !reNull.test(field = match[2].trim().replace /\s+/g, ' ')
                        mod[keys[match[1]]] = field
                    mod.mc = +mod.mc
                    callback true
                  else
                    callback()
              , (valid) ->
                grunt.log.error "#{modCode} not in NUS Bulletin." unless valid
                callback()
            , (err) ->
              callback null, nbMods
    , (err, results) ->
      cors = results.cors
      cors[code]?.examTime = examTime for code, examTime of results.examTimes
      grunt.file.write options.dest, JSON.stringify(results, null, '\t')
      grunt.log.writeln "File #{options.dest} created."
      done()