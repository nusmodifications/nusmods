# https://gist.github.com/1308368
UUIDv4 = `function(
  a,b                // placeholders
){
  for(               // loop :)
      b=a='';        // b - result , a - numeric variable
      a++<36;        //
      b+=a*51&52  // if "a" is not 9 or 14 or 19 or 24
                  ?  //  return a random number or 4
         (
           a^15      // if "a" is not 15
              ?      // genetate a random number from 0 to 15
           8^Math.random()*
           (a^20?16:4)  // unless "a" is 20, in which case a random number from 8 to 11
              :
           4            //  otherwise 4
           ).toString(16)
                  :
         '-'            //  in other cases (if "a" is 9,14,19,24) insert "-"
      );
  return b
 }`

# https://gist.github.com/1044533
Date.prototype.toISOString ||= `function(a){
  a=this;
  return (
     1e3 // Insert a leading zero as padding for months < 10
     -~a.getUTCMonth() // Months start at 0, so increment it by one
     *10 // Insert a trailing zero as padding for days < 10
     +a.toUTCString() // Can be "1 Jan 1970 00:00:00 GMT" or "Thu, 01 Jan 1970 00:00:00 GMT"
     +1e3+a/1 // Append the millis, add 1000 to handle timestamps <= 999
     // The resulting String for new Date(0) will be:
     // "-1010 Thu, 01 Jan 1970 00:00:00 GMT1000" or
     // "-10101 Jan 1970 00:00:00 GMT1000" (IE)
   ).replace(
      // The two digits after the leading '-1' contain the month
      // The next two digits (at whatever location) contain the day
      // The last three chars are the milliseconds
      /1(..).*?(\d\d)\D+(\d+).(\S+).*(...)/,
     '$3-$1-$2T$4.$5Z')
}`

days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
daysAbbrev = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']

lessonTypes = [
  'Design Lecture',
  'Laboratory',
  'Lecture',
  'Packaged Lecture',
  'Packaged Tutorial',
  'Recitation',
  'Sectional Teaching',
  'Seminar-Style Module Class',
  'Tutorial',
  'Tutorial Type 2',
  'Tutorial Type 3'
]

typeAbbrev = [
  'LEC',
  'LAB',
  'LEC',
  'LEC',
  'TUT',
  'REC',
  'SEC',
  'SEM',
  'TUT',
  'TUT2',
  'TUT3'
]

modIndexes = {}
getModIndex = (code) -> modIndexes[code.split(' ')[0]]
modsLength = modInfoTT.code.length

examStr = []
do ->
  modIndexes[code.split(' ')[0]] = i for code, i in modInfoTT.code
  examStr = for exam in modInfoTT.exam
    if exam
      # +8 hours then use getUTC methods so independent of local time zone
      d = new Date(exam + 288e5)
      h = d.getUTCHours()
      if h < 12
        A = 'AM'
      else
        A = 'PM'
        h -= 12
      h ||= 12
      "0#{d.getUTCDate()}"[-2..] + '-' + "0#{d.getUTCMonth() + 1}"[-2..] +
      "-#{d.getUTCFullYear()} #{h}:" + "0#{d.getUTCMinutes()}"[-2..] + " #{A}"

s2OnUpdate = (val) ->
  localStorage.setItem 'select2', val.join(',')
  localStorage.setItem 'hash', (location.hash = prevHash = queryString())
  if clashCount then $('#clash').show() else $('#clash').hide()
  if count = val.length
    if count == 1
      $('#select2-header').text("Selected 1 Module ")
    else
      $('#select2-header').text("Selected #{count} Modules ")
    $('#clear-all').show()
  else
    $('#select2-header').text("Select Modules for Timetable ")
    $('#clear-all').hide()
  $('#short-url').val('').blur()

$.ajaxSetup
  cache: true

$.fn.qtip.defaults.position.my = 'bottom center'
$.fn.qtip.defaults.position.at = 'top center'
$.fn.qtip.defaults.position.viewport = true
$.fn.qtip.defaults.show.solo = true
$.fn.qtip.defaults.style.classes = 'ui-tooltip-bootstrap'

prevHash = s2 = undefined
$ ->
  e3Loaded = false
  $('a[href="#module-finder"]').on 'show', ->
    unless e3Loaded
      $('#overlay').show()
      $('#loading').show()
      $.getScript(modInfoMFPath[13..-12]).done ->
        $.getScript(e3Path[13..-12]).done ->
          e3Loaded = true
    $('#selected-mods').prependTo('#module-finder .span3')

  $('a[href="#timetable-builder"]').on 'show', ->
    $('#selected-mods').appendTo('#show-hide-selected-mods-container')

  $('#correct-as-at').text(modInfoTT.correctAsAt)

  $('.container-fluid').show()
  colX = for el, i in $('#mon > tr:last-child > td') when !(i % 2)
           $(el).offset().left
  Lesson.TR = $('#mon > tr:last-child').clone()

  PAGE_SIZE = 50
  (s2 = $('#select2')).select2
    width: '100%'
    placeholder: 'Type code/title to add mods'
    multiple: true
    initSelection: (el, callback) ->
      title = modInfoTT.title
      callback(id: val, text: "#{val} #{title[i]}" \
        for val in el.val().split(',') when (i = getModIndex val)?)
      s2OnUpdate el.select2('val')
    query: (options) ->
      {code, title} = modInfoTT
      if options.term.length == 0
        start = options.context ? 0
        end = start + PAGE_SIZE
        result =
          context: end
          more: (true if end < modsLength)
          results: for i in [start...end]
                     id: code[i], text: "#{code[i]} #{title[i]}"
        options.callback result
      else
        result = results: [], more: true
        results = result.results
        re = new RegExp options.term, 'i'
        i = options.context ? 0
        while i < modsLength
          if code[i].search(re) != -1 && results.push(id: code[i],
          text: "#{code[i]} #{title[i]}") == PAGE_SIZE
            result.context = ++i
            options.callback result
            return
          i++
        i -= modsLength
        while i < modsLength
          if title[i].search(re) != -1 && results.push(id: code[i],
          text: "#{code[i]} #{title[i]}") == PAGE_SIZE
            result.context = ++i + modsLength
            options.callback result
            return
          i++
        result.more = false
        options.callback result
        return
  .on 'change', (evt) ->
    if evt.added
      addMod evt.added.id
    else if evt.removed
      removeMod evt.removed.id
    s2OnUpdate s2.select2('val')

  $('#clear-all').click ->
    if confirm 'Are you sure you want to clear all selected modules?'
      removeMod code for code of timetable
      s2.select2 "val", ''
      s2OnUpdate []
    return false

  hash = location.href.split('#')[1] || localStorage.getItem 'hash'
  if hash && hash.indexOf('=') != -1
    loadHash hash
  else if s2val = localStorage.getItem 'select2'
    addMod ID for ID in (IDs = s2val.split(','))
    s2.select2 'val', IDs

  $('#overlay').fadeOut()
  $('#loading').fadeOut()

  $(window).on 'hashchange', ->
    return unless prevHash
    hash = location.href.split('#')[1]
    if hash.indexOf('=') == -1
      location.hash = prevHash
    else if hash != prevHash
      loadHash(prevHash = hash)

  prevCol = undefined
  $('#timetable').mousemove (evt) ->
      break for x, i in colX when evt.pageX < x
      currCol = $("colgroup:nth-child(#{i + 1})")
      return if currCol.is prevCol
      prevCol?.removeAttr('class')
      currCol.addClass('hover')
      prevCol = currCol
  $('#timetable').mouseleave ->
    if prevCol
      prevCol.removeAttr 'class'
      prevCol = undefined

  (copyToClipboard = $('#copy-to-clipboard')).qtip
    content: 'Copy to Clipboard'
    events:
      hidden: ->
        copyToClipboard.qtip('option', 'content.text', 'Copy to Clipboard')
  clip = new ZeroClipboard.Client()
  clip.glue('copy-to-clipboard', 'share-container')
  clip.addEventListener 'onMouseOver', ->
    getShortURL (shortURL) -> clip.setText shortURL
    copyToClipboard.qtip('show')
  clip.addEventListener 'onMouseOut', ->
    copyToClipboard.qtip('hide')
  clip.addEventListener 'onComplete', ->
    copyToClipboard.qtip('option', 'content.text', 'Copied!')

  shortURLInput = $('#short-url')
  getShortURL = (callback) ->
    if shortURL = shortURLInput.val()
      callback? shortURL
    else
      $.getJSON 'short_url.php', url: location.href, (data) ->
        if shortURL = data.shorturl
          shortURLInput.val shortURL
          callback? shortURL
  shortURLInput.focus -> getShortURL()

  $('#share-email').qtip content: 'Share via Email'
  $('#share-facebook').qtip content: 'Share via Facebook'
  $('#share-twitter').qtip content: 'Share via Twitter'

  $('#share-email').click ->
    getShortURL (shortURL) ->
      window.location.href = 'mailto:?subject=My%20NUSMods.com%20Timetable&' +
        "body=#{encodeURIComponent shortURL}"

  $('#share-facebook').click ->
    getShortURL (shortURL) ->
      window.open 'http://www.facebook.com/sharer.php?u=' +
        encodeURIComponent shortURL,
        'scrollbars=yes,resizable=yes,toolbar=no,location=yes,width=640,height=350'

  $('#share-twitter').click ->
    getShortURL (shortURL) ->
      window.open 'http://twitter.com/intent/tweet?url=' +
        encodeURIComponent shortURL, '',
        'scrollbars=yes,resizable=yes,toolbar=no,location=yes,width=550,height=420'

  $('#show-hide button:last-child').qtip
    content: 'Only shown if Odd / Even / Irregular'
    position:
      my: 'bottom right'

  $('#show-hide').on 'click', '.btn', ->
    $('#timetable-wrapper').toggleClass('hide-' + $(this).text().toLowerCase())

  showModal = ->
    if !exams.length
      alert 'No modules to export!'
      return false
    $('#export-modal').modal 'show'

  dlAttrSupported = 'download' of document.createElement('a')
  fileURI = location.protocol == 'file:'
  flash10 = swfobject.hasFlashPlayerVersion '10'

  $('#export-modal').on 'show', ->
    htmlTimetable = encodeURIComponent HTMLTimetable()
    $('#jpg-html').val htmlTimetable
    $('#pdf-html').val htmlTimetable
    if dlAttrSupported || fileURI || !flash10
      $('#dl-html').attr 'href', 'data:text/html,' + htmlTimetable
      $('#dl-ical').attr 'href', 'data:text/calendar,' +
        encodeURIComponent iCalendar()
      $('#dl-xls').attr 'href', 'data:application/vnd.ms-excel,' +
        encodeURIComponent SpreadsheetML()

  $('#export-timetable-action').click showModal
  $('#jpg-file').click ->
    if !exams.length
      alert 'No modules to export!'
      return false
    $('#jpg-html').val encodeURIComponent HTMLTimetable()
    document.forms['jpg-form'].submit()
  $('#pdf-file').click ->
    if !exams.length
      alert 'No modules to export!'
      return false
    $('#pdf-html').val encodeURIComponent HTMLTimetable()
    document.forms['pdf-form'].submit()
  if dlAttrSupported
    $('#html-file').click ->
      if !exams.length
        alert 'No modules to export!'
        return false
      $(this).attr 'href', 'data:text/html,' + encodeURIComponent HTMLTimetable()
    $('#ical-file').click ->
      if !exams.length
        alert 'No modules to export!'
        return false
      $(this).attr 'href', 'data:text/calendar,' + encodeURIComponent iCalendar()
    $('#xls-file').click ->
      if !exams.length
        alert 'No modules to export!'
        return false
      $(this).attr 'href', 'data:application/vnd.ms-excel,' + encodeURIComponent SpreadsheetML()
  else
    $('#html-file').click showModal
    $('#ical-file').click showModal
    $('#xls-file').click showModal

  if dlAttrSupported || fileURI || !flash10
    if !dlAttrSupported
      if !fileURI then $('#afp-or').show()
      $('#save-link-as-instructions').show()
  else
    downloadifyOptions =
      downloadImage: 'images/988945bc.download.png'
      height: 30
      width: 111
    $('#dl-html-container').downloadify($.extend {}, downloadifyOptions,
      data: HTMLTimetable
      filename: 'My NUSMods.com Timetable.html'
    )
    $('#dl-ical-container').downloadify($.extend {}, downloadifyOptions,
      data: iCalendar
      filename: 'My NUSMods.com Timetable.ics'
    )
    $('#dl-xls-container').downloadify($.extend {}, downloadifyOptions,
      data: SpreadsheetML
      filename: 'My NUSMods.com Timetable.xls'
    )

HTMLTimetable = ->
  '<!DOCTYPE html><title>My NUSMods.com Timetable</title><style>#timetable-wrapper{font-size:11px;font-weight:700;line-height:13px;width:1245px}#timetable{margin:0 0 15px -20px;max-width:none;table-layout:fixed;width:1235px}#timetable th{background-color:#fff}#times div{margin-right:-13px;text-align:right}.day{border-bottom:1px solid #ddd;border-top:1px solid #ddd}.day th{border-bottom:1px solid #fff;border-top:1px solid #fff}.day th div{line-height:15px;margin-right:-20px}.day td{height:34px;padding:1px 0 0}.m00{border-left:1px solid #ddd}.m30{border-right:1px solid #ddd}.lesson{border:2px solid;overflow:hidden;padding:1px 3px 3px}.color0{background-color:#f7977a;border-color:#9c2b09;color:#6c1e06}.color1{background-color:#f9ad81;border-color:#a64208;color:#752f06}.color2{background-color:#fdc68a;border-color:#b86103;color:#864702}.color3{background-color:#fff79a;border-color:#cdbd00;color:#9a8e00}.color4{background-color:#c4df9b;border-color:#60842a;color:#445d1e}.color5{background-color:#a2d39c;border-color:#397132;color:#274e22}.color6{background-color:#82ca9d;border-color:#265a3a;color:#173623}.color7{background-color:#7bcdc8;border-color:#225a57;color:#143533}.color8{background-color:#6ecff6;border-color:#09698f;color:#06465f}.color9{background-color:#7ea7d8;border-color:#20426a;color:#142943}.color10{background-color:#8493ca;border-color:#27325b;color:#181f37}.color11{background-color:#8882be;border-color:#2b284c;color:#18162b}.color12{background-color:#a187be;border-color:#3c2b4e;color:#22192d}.color13{background-color:#bc8dbf;border-color:#502e52;color:#301c31}.color14{background-color:#f49ac2;border-color:#af1358;color:#810e41}.color15{background-color:#f6989d;border-color:#b21018;color:#840b12}.hide-code .code,.hide-group .group,.hide-room .room,.hide-title .title,.hide-week .week{display:none}table{border-collapse:collapse;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif}</style><div class="' +
  $('#timetable-wrapper').attr('class') + '" id="timetable-wrapper">' +
  $('#timetable-wrapper').html() + '</div>'

delta = (week) -> if week < 7 then week - 1 else week
iCalDateTime = (date) ->
  dateClone = new Date(date.getTime())
  dateClone.setUTCHours(dateClone.getUTCHours())
  dateClone.toISOString()[..18].replace(/\W/g, '') + 'Z'
iCalendar = ->
  v = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:NUSMods.com']
  for exam in exams when exam.unixTime
    v = v.concat [
      'BEGIN:VEVENT',
      "UID:#{UUIDv4()}@nusmods.com",
      "DTSTAMP:#{iCalDateTime(new Date())}",
      "SUMMARY:#{exam.code.split(' ')[0]} Exam",
      "DESCRIPTION:#{exam.title}",
      "DTSTART:#{iCalDateTime(new Date(exam.unixTime))}",
      'DURATION:PT2H',
      'URL:http://www.nus.edu.sg/registrar/event/examschedule-sem1.html',
      'END:VEVENT'
    ]
  for el in $('td > .lesson')
    lesson = $(el).data('lesson')
    v = v.concat [
      'BEGIN:VEVENT',
      "UID:#{UUIDv4()}@nusmods.com",
      "DTSTAMP:#{iCalDateTime(new Date())}",
      "SUMMARY:#{lesson.shortCode} #{lesson.typeName}",
      "DESCRIPTION:#{lesson.title}\\n#{lesson.typeName} Group #{lesson.group}",
      "LOCATION:#{lesson.room}",
      'URL:https://aces01.nus.edu.sg/cors/jsp/report/ModuleDetailedInfo.jsp' +
        "?acad_y=2012/2013&sem_c=1&mod_c=#{lesson.shortCode}"
    ]
    start = new Date(Date.UTC(2012, 7, 13,
                     +lesson.start[..1] - 8, lesson.start[2..]))
    start.setUTCDate(start.getUTCDate() + lesson.day)
    recess = new Date(start.getTime())
    recess.setUTCDate(recess.getUTCDate() + 42)
    if typeof(week = lesson.week) == 'number'
      v.push 'RRULE:FREQ=WEEKLY;COUNT=14'
      if lesson.isTut || week == 2
        v.push "EXDATE:#{iCalDateTime(start)}"
      if lesson.isTut && week != 1
        exDate = new Date(start.getTime())
        exDate.setUTCDate(exDate.getUTCDate() + 7)
        v.push "EXDATE:#{iCalDateTime(exDate)}"
      if week
        for i in [week + 1..13] by 2
          exDate = new Date(start.getTime())
          exDate.setUTCDate(exDate.getUTCDate() + delta(i) * 7)
          v.push "EXDATE:#{iCalDateTime(exDate)}"
    else
      weeks = week.split(/[-,]/)
      start.setUTCDate(start.getUTCDate() + delta(weeks[0]) * 7)
      if week.indexOf(',') != -1
        v.push "RRULE:FREQ=WEEKLY;COUNT=2;INTERVAL=#{delta(weeks[1]) - delta(weeks[0])}"
      else
        v.push "RRULE:FREQ=WEEKLY;COUNT=#{weeks[1] - weeks[0] + 1}"
    end = new Date(start.getTime())
    end.setUTCHours(end.getUTCHours() + lesson.duration / 2)
    v = v.concat [
      "DTSTART:#{iCalDateTime(start)}",
      "DTEND:#{iCalDateTime(end)}",
      "EXDATE:#{iCalDateTime(recess)}"
      'END:VEVENT'
    ]
  v.push 'END:VCALENDAR'
  i = 0
  while i < v.length
    line = v[i]
    if line.length > 75
      v[i] = line[..75]
      v.splice i + 1, 0, ' ' + line[76..]
    i++
  v.join('\r\n')

SpreadsheetML = ->
  xml = '<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="Default"><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/></Style><Style ss:ID="b"><Font ss:FontName="Calibri" ss:Size="12" ss:Bold="1"/><NumberFormat ss:Format="0000"/></Style></Styles><Worksheet ss:Name="My NUSMods.com Timetable"><Table ss:DefaultColumnWidth="35"><Column ss:Width="65"/><Row><Cell ss:Index="2" ss:MergeAcross="1" ss:StyleID="b"><Data ss:Type="Number">800</Data></Cell><Cell ss:MergeAcross="1" ss:StyleID="b"><Data ss:Type="Number">900</Data></Cell><Cell ss:MergeAcross="1" ss:StyleID="b"><Data ss:Type="Number">1000</Data></Cell><Cell ss:MergeAcross="1" ss:StyleID="b"><Data ss:Type="Number">1100</Data></Cell><Cell ss:MergeAcross="1" ss:StyleID="b"><Data ss:Type="Number">1200</Data></Cell><Cell ss:MergeAcross="1" ss:StyleID="b"><Data ss:Type="Number">1300</Data></Cell><Cell ss:MergeAcross="1" ss:StyleID="b"><Data ss:Type="Number">1400</Data></Cell><Cell ss:MergeAcross="1" ss:StyleID="b"><Data ss:Type="Number">1500</Data></Cell><Cell ss:MergeAcross="1" ss:StyleID="b"><Data ss:Type="Number">1600</Data></Cell><Cell ss:MergeAcross="1" ss:StyleID="b"><Data ss:Type="Number">1700</Data></Cell><Cell ss:MergeAcross="1" ss:StyleID="b"><Data ss:Type="Number">1800</Data></Cell><Cell ss:MergeAcross="1" ss:StyleID="b"><Data ss:Type="Number">1900</Data></Cell><Cell ss:MergeAcross="1" ss:StyleID="b"><Data ss:Type="Number">2000</Data></Cell><Cell ss:MergeAcross="1" ss:StyleID="b"><Data ss:Type="Number">2100</Data></Cell><Cell ss:MergeAcross="1" ss:StyleID="b"><Data ss:Type="Number">2200</Data></Cell><Cell ss:MergeAcross="1" ss:StyleID="b"><Data ss:Type="Number">2300</Data></Cell></Row>'
  for dayAbbrev, i in daysAbbrev
    rows = $("##{dayAbbrev} > tr")
    for j in [rows.length - 1..1] by -1
      row = rows[j]
      rows.splice j, 1 if !$(row).find('.lesson').length
    for row, j in rows
      xml += '<Row ss:Height="60">'
      if !j
        xml += '<Cell '
        xml += 'ss:MergeDown="' + (rows.length - 1) + '" ' if rows.length > 1
        xml += 'ss:StyleID="b"><Data ss:Type="String">' + days[i] +
               '</Data></Cell>'
      for el in $(row).find('.lesson')
        lesson = $(el).data('lesson')
        xml += '<Cell ss:Index="' + (Math.round(lesson.start / 50) - 14)
        if lesson.duration > 1
          xml += '" ss:MergeAcross="' + (lesson.duration - 1)
        xml += '"><Data ss:Type="String">' + lesson.shortCode + '&#13;' +
               typeAbbrev[lesson.type] + ' ' + lesson.group + '&#13;' +
               lesson.room
        xml += '&#13;' +  lesson.weekStr if lesson.week
        xml +=  '</Data></Cell>'
      xml += '</Row>'
  xml + '</Table></Worksheet></Workbook>'

examKey = (examTime) ->
  return if !examTime || examTime == 'No Exam'
  hour = +examTime[11]
  hour = if hour > 8 then 0 else (if hour < 5 then 1 else 2)
  examTime[3..4] + examTime[0..1] + hour

colors = []
timetable = {}
exams = []
clashCount = 0
addMod = (code, attach = true) ->
  return if code of timetable || !(modIndex = getModIndex code)?
  mod = timetable[code] = {}
  colors = [0..15] unless colors.length
  color = colors.splice(Math.floor(Math.random() * colors.length), 1)[0]
  title = modInfoTT.title[modIndex]

  time = examStr[modIndex] || 'No Exam'
  unixTime = modInfoTT.exam[modIndex]
  tbody = $('#exam-timetable > tbody')
  key = examKey(time) || code
  for exam, i in exams
    if key <= exam.key
      if key == exam.key
        clash = i
        continue if code > exam.code
      break
  tr = $("<tr class='color#{color}'><td>#{code}<td>#{title}<td>#{time}</tr>")
  if clash
    tr.addClass('clash')
    tbody.children().eq(clash).addClass('clash')
    clashCount++
  if i == exams.length
    tbody.append(tr)
  else
    tbody.children().eq(i).before(tr)
  exams.splice i, 0, {code, title, time, key, tr, unixTime}

  for lecTut in ['lectures', 'tutorials']
    continue unless lessons = modInfoTT[lecTut][modIndex]
    isTut = lecTut == 'tutorials'
    for type of lessons
      sameType = mod[type] = {}
      groupIndex = 0
      isDraggable = false
      i = 0
      for group of lessons[type]
        if i++
          isDraggable = true
          break
      for group of lessons[type]
        sameGroup = sameType[group] = []
        for lessonData in lessons[type][group]
          lesson = new Lesson lessonData, {code, color, group, isDraggable,
                   isTut, modIndex, sameGroup, sameType, title, type}
          sameGroup.push lesson
          lesson.attach() if attach && !groupIndex
        groupIndex++
  return mod

removeMod = (code) ->
  return unless mod = timetable[code]
  key = examKey examStr[getModIndex code]
  clashes = (exam for exam in exams when exam.key == key)
  if clashes.length > 1
    clash.tr.removeClass('clash') for clash in clashes if clashes.length == 2
    clashCount--
  for exam, i in exams
    if code == exam.code
      exam.tr.remove()
      exams.splice i, 1
      break
  for type, groups of mod
    for group, lessons of groups
      lesson.detach(true) for lesson in lessons
  delete timetable[code]

class Lesson
  weeks = ['Every Week', 'Odd Weeks', 'Even Weeks']
  constructor: ([@week, @day, @start, @end, @room], obj) ->
    $.extend this, obj
    @duration = Math.round(((if @end == '0000' then '2400' else @end) -
    @start) / 50)
    @room = modInfoTT.rooms[@room]
    @typeName = lessonTypes[@type]
    @weekStr = if typeof @week == 'number' then weeks[@week] else "Weeks #{@week}"
    @shortCode = @code.split(' ')[0]
    @queryString = "#{@shortCode}=#{if @type == '10' then 'A' else @type}#{@group}"
    @dayAbbrev = daysAbbrev[@day]
    @el = $('<div>',
      class: "lesson color#{@color}"
      html: "<div><span class='code'>#{@shortCode}</span> " +
            "<span class='title'>#{@title}</span></div>" +
            "#{typeAbbrev[@type]} <span class='group'>[#{@group}]</span>" +
            "<div class='room'>#{@room}</div>" +
            "<div class='week'>#{if @week then @weekStr else ''}</div>")
    .data('lesson', this)
    .qtip
      content: "<strong>#{@code}</strong><br>" +
               "#{@title}<br>" +
               "#{@typeName} Group #{@group}<br>" +
               "#{days[@day]} #{@start} - #{@end}<br>" +
               "#{@weekStr} @ #{@room}"
      position:
        my: 'left center'
        at: 'right center'
      show:
        effect: -> $(this).fadeTo(200, 0.85)
    if @isDraggable
      @el.draggable
        appendTo: '#timetable-wrapper'
        cursor: 'move'
        helper: => @el.clone(false).width(@el.width()).height(@el.height())
        opacity: 0.4
        revert: (droppable) =>
          keep = @group unless droppable
          for group, lessons of @sameType
            for lesson in lessons
              lesson.detach() if group != keep
              lesson.el.droppable('disable')
          $('body').css('cursor', 'auto')
          if droppable
            lesson.cascade() for lesson in @sameGroup
            for lesson in @sameType[droppable.data('lesson').group]
              lesson.detach().attach()
            localStorage.setItem 'hash',
              (location.hash = prevHash = queryString())
            $('#short-url').val('').blur()
            return false
          else
            return true
        start: =>
          for group, lessons of @sameType
            for lesson in lessons when group != @group
              lesson.el.droppable('enable')
              lesson.attach()
          return
        zIndex: 3
      @el.droppable
        hoverClass: 'hover'
        activeClass: 'active'
        addClasses: false
        disabled: true
        over: =>
          @el.qtip('show')
          lesson.el.addClass 'hover' for lesson in @sameGroup
          return
        out: =>
          @el.qtip('hide')
          lesson.el.removeClass 'hover' for lesson in @sameGroup
          return
        drop: =>
          @el.qtip('hide')
          lesson.el.removeClass 'hover' for lesson in @sameGroup
          return
  attach: ->
    $("#sat").show() if @day == 5
    rows = $("##{@dayAbbrev} > tr")
    for i in [0..rows.length]
      if i == rows.length
        tr = Lesson.TR.clone().appendTo("##{@dayAbbrev}")
        $(rows[0]).children().first().attr('rowspan', i + 1)
      else
        tr = rows[i]
      continue unless td = $(tr).children(".h#{@start[..1]}.m#{@start[2..]}:empty")
      @detached = td.nextUntil(".h#{@end[..1]}.m#{@end[2..]}", 'td:empty')
      if @detached.length == @duration - 1
        @trPos = i + 1
        break
    td.attr('colspan', @duration).html(@el)
    @detached.detach()
    this
  detach: (remove) ->
    tr = @el.parent().removeAttr('colspan').after(@detached).parent()
    if remove then @el.remove() else @el.detach()
    if !tr.find('.lesson').length && tr.index() > 1
        tr.remove()
    this
  cascade: ->
    for el in $("##{@dayAbbrev} > tr:nth-child(#{@trPos}) ~ tr .lesson")
      $(el).data('lesson').detach().attach()
    return

queryString = ->
  (code.split(' ')[0] for code, val of timetable when $.isEmptyObject(val))
  .concat($(el).data('lesson').queryString for el in $('td > .lesson'))
  .join('&')

loadHash = (hash) ->
  $(el).data('lesson').detach() for el in $('.lesson')
  loaded = {}
  for pair, i in hash.split('&')
    [shortCode, val] = pair.split('=')
    code = modInfoTT.code[getModIndex shortCode]
    unless code
      alert "#{shortCode} no longer exists."
      continue
    loaded[code] ||= {}
    unless val
      addMod code
      continue
    addMod code, false unless timetable[code]
    type = if val[0] == 'A' then '10' else val[0]
    unless timetable[code][type]
      alert "#{code} #{lessonTypes[type]} no longer exists."
      continue
    loaded[code][type] || = {}
    group = val[1..]
    loaded[code][type][group] ?= 0
    timetable[code][type][group]?[loaded[code][type][group]++]?.attach()
  for code, types of timetable
    unless loaded[code]
      removeMod code
      continue
    for type, groups of types
      unless loadedGroups = loaded[code][type]
        for firstGroup of groups
          lesson.attach() for lesson in groups[firstGroup]
          break
        continue
      for loadedGroup, loadedLessonsLength of loadedGroups
        unless groups[loadedGroup]
          for firstGroup of groups
            alert "#{code} #{lessonTypes[type]} Group #{loadedGroup} no " +
                  "longer exists. Adding Group #{firstGroup} instead."
            lesson.attach() for lesson in groups[firstGroup]
            break
          break
        while loadedLessonsLength < groups[loadedGroup].length
          groups[loadedGroup][loadedLessonsLength++].attach()
  s2.select2 'val', (code for code of loaded)

$(document).one 'scriptsLoaded.exhibit', ->
  exhibitJSON =
    types:
      Module:
        pluralLabel: 'Modules'
    properties:
      mc:
        valueType: 'number'
    items: []

  departments = []
  for fac, depts of modInfoMF.departments
    for dept in depts
      departments.push dept
      unless dept == fac
        exhibitJSON.items.push label: dept, faculty: fac

  times = []
  for day in days
    times.push day
    for time in ['Morning', 'Afternoon', 'Evening']
      label = "#{day} #{time}"
      exhibitJSON.items.push {label, day}
      times.push label
    for el in $('.lessons > div')
      $(el).attr 'data-ex-fixed-order', times.join ';'

  for i in [0...modsLength]
    lessonTimes = 'lectures': {}, 'tutorials': {}
    for lecTut in ['lectures', 'tutorials']
      continue unless lessons = modInfoTT[lecTut][i]
      for type of lessons
        for group of lessons[type]
          for lesson in lessons[type][group]
            if lesson[2] < '1200' then start = 'Morning'
            else if lesson[2] < '1800' then start = 'Afternoon'
            else start = 'Evening'
            lessonTimes[lecTut][days[lesson[1]] + ' ' + start] = true
    code = modInfoTT.code[i]
    exhibitJSON.items.push
      type: 'Module'
      label: code
      code: code.split(' ')[0]
      level: +code.match(/\d/)[0] * 1000
      title: modInfoTT.title[i]
      description: modInfoMF.description[i]
      exam: examStr[i]
      mc: modInfoMF.mcs[i]
      prereq: modInfoMF.prerequisite[i]
      preclusion: modInfoMF.preclusion[i]
      workload: modInfoMF.workload[i]
      department: departments[modInfoMF.department[i]]
      lectures: key for key of lessonTimes.lectures
      tutorials: key for key of lessonTimes.tutorials
      types: modInfoMF.modTypes[modInfoMF.types[i]]

  window.tableStyler = (table, database) ->
    table.className = 'modules table table-striped table-bordered'

  window.database = Exhibit.Database.create()
  window.database.loadData exhibitJSON
  window.exhibit = Exhibit.create()
  window.exhibit.configureFromDOM()

  $('#overlay').fadeOut()
  $('#loading').fadeOut()

  $('.exhibit-collectionView-header').on 'click', '.add', (evt) ->
    selectedIDs = s2.select2 'val'
    itemID = $(this).data('code')
    if itemID in selectedIDs
      qtipContent = 'Already added!'
    else
      qtipContent = 'Added!'
      selectedIDs.push itemID
      s2.select2 'val', selectedIDs
      addMod itemID
    $(this).qtip
      content: qtipContent
      show:
        event: false
        ready: true
      hide:
        event: false
        inactive: 1000

  # $(document).on 'onItemShow.exhibit', (evt, itemID, el) ->
  #   details = $(el).find '.details'
  #   details.html details.html().replace /[A-Z]{1,6}\d{1,4}[A-Z]{0,3}/g, (match) ->
  #     if (i = modIndexes[match])?
  #       match = '<a href="#">' + match + '</a>'
  #     match

  sidebarShown = true
  $('#sidebar-toggle')
  .qtip
    content: 'Hide Sidebar'
    position:
      my: 'left center'
      at: 'top right'
  .click ->
    $('#sidebar-toggle i').toggleClass 'icon-chevron-left icon-chevron-right'
    $('#sidebar').animate width: 'toggle', 100
    $('#content').toggleClass('span12 span9')
    $('#content').toggleClass('no-sidebar')
    sidebarShown = !sidebarShown
    qtipContent = if sidebarShown then 'Hide Sidebar' else 'Show Sidebar'
    $(this).qtip('option', 'content.text', qtipContent)
    return false