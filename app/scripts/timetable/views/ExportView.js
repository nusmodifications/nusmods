'use strict';

var $ = require('jquery');
var Marionette = require('backbone.marionette');
var _ = require('underscore');
var academicCalendar = require('../../academicCalendar.json');
var analytics = require('../../analytics');
var padTwo = require('../../common/utils/padTwo');
var template = require('../templates/export.hbs');
require('bootstrap/dropdown');
require('jquery.fileDownload');

var isTutorial = {
  'Design Lecture': true,
  Laboratory: true,
  Recitation: true,
  Tutorial: true,
  'Tutorial Type 2': true,
  'Tutorial Type 3': true
};

module.exports = Marionette.ItemView.extend({
  template: template,

  events: {
    'click a': 'onClick'
  },

  onClick: function (event) {
    if (!this.collection.length) {
      window.alert('No modules to export!');
      return false;
    }
    switch (event.currentTarget.dataset.exportType) {
      case 'jpg-file':
        analytics.track('Timetable', 'Export', 'JPEG', +this.dlAttrSupported);
        $.fileDownload('/jpg.php', {
          httpMethod: 'POST',
          data: {
            size: event.currentTarget.dataset.imageSize,
            html: encodeURIComponent(this.htmlTimetable())
          }
        });
        return false;
      case 'pdf-file':
        analytics.track('Timetable', 'Export', 'PDF', +this.dlAttrSupported);
        $.fileDownload('/pdf.php', {
          httpMethod: 'POST',
          data: {
            html: encodeURIComponent(this.htmlTimetable())
          }
        });
        return false;
      case 'html-file':
        analytics.track('Timetable', 'Export', 'HTML', +this.dlAttrSupported);
        if (this.dlAttrSupported) {
          $(event.currentTarget).attr('href', 'data:text/html,' +
            encodeURIComponent(this.htmlTimetable()));
        } else {
          $.fileDownload('/html.php', {
            httpMethod: 'POST',
            data: {
              html: encodeURIComponent(this.htmlTimetable())
            }
          });
          return false;
        }
        break;
      case 'ical-file':
        analytics.track('Timetable', 'Export', 'iCalendar', +this.dlAttrSupported);
        if (this.isSpecialTerm) {
          // Disable as special term export is not yet supported fully.
          return false;
        }
        if (this.dlAttrSupported) {
          $(event.currentTarget).attr('href', 'data:text/calendar,' +
            encodeURIComponent(this.iCalendar()));
        } else {
          $.fileDownload('/ical.php', {
            httpMethod: 'POST',
            data: {
              html: encodeURIComponent(this.iCalendar())
            }
          });
          return false;
        }
        break;
      case 'xls-file':
        analytics.track('Timetable', 'Export', 'Excel', +this.dlAttrSupported);
        if (this.dlAttrSupported) {
          $(event.currentTarget).attr('href', 'data:application/vnd.ms-excel,' +
            encodeURIComponent(this.spreadsheetML()));
        } else {
          $.fileDownload('/xls.php', {
            httpMethod: 'POST',
            data: {
              html: encodeURIComponent(this.spreadsheetML())
            }
          });
          return false;
        }
        break;
    }
  },

  initialize: function(options) {
    this.options = options;
    this.isSpecialTerm = options.semester === 3 || options.semester === 4;

    this.dlAttrSupported = 'download' in document.createElement('a');
  },

  serializeData: function () {
    return {
      isSpecialTerm: this.isSpecialTerm
    };
  },

  // Custom minimal HTML5/CSS3. CSS that applies to export timetable separated
  // out into _timetable.scss so that it can be compressed and copied here
  // when updated. DOM is extracted directly from currently displaying
  // timetable and embedded into template.
  htmlTimetable: function() {
    var $examTimetable = $('#exam-timetable').clone();
    $examTimetable.find('th:last-child, td:last-child[colspan!=2]').remove();
    var backgroundColor = $('body').css('background-color');
    var html = '<!DOCTYPE html><title>My NUSMods.com Timetable</title><style>' +
      'html, body {min-width:1245px;}' +
      'body.mode-slate{background-color: ' + backgroundColor + '}' +
      '#timetable-wrapper{font-size:11px;line-height:13px;width:1245px}' +
      '#timetable{margin:0 0 15px -15px;max-width:none;table-layout:fixed;width:1235px}' +
      '#timetable th{background-color:#fff}' +
      '.mode-slate #timetable th{color:#fff}' +
      '#times div{margin-right:-13px;text-align:right}' +
      '#exam-timetable > table{font-weight: bold;border:1px solid #555;}' +
      '#exam-timetable > table th{border:1px solid #555;background-color: #eee;}' +
      '#exam-timetable > table td{border:1px solid #555; padding: 5px;}' +
      '#exam-timetable > table td.total-module-credits{text-align: center;}' +
      '#exam-timetable > table tr.clash{background-color: #eee; color:red !important}' +
      '.day{border-bottom:1px solid #ddd;border-top:1px solid #ddd}' +
      '.mode-slate .day th{border-bottom:1px solid ' + backgroundColor + ';' +
                          'border-top:1px solid ' + backgroundColor + '}' +
      '.day th div{line-height:15px;margin-right:-20px}' +
      '.day td{height:34px;padding:1px 0 0}' +
      '.m00{border-left:1px solid #ddd}' +
      '.m30{border-right:1px solid #ddd}' +
      '.lesson{border-bottom:3px solid;overflow:hidden;padding:5px}' +
      '.lesson .code, .lesson .title{font-size:13px;font-weight:bold;}';
    var cssProperties = ['background-color', 'border-color', 'color'];

    for (var i = 0; i < 8; i++) {
      var currentColor = '.color' + i;
      var currentColorProperties = [];
      for (var j = 0; j < cssProperties.length; j++) {
        var prop = cssProperties[j];
        var $el = $(currentColor);
        if ($el.length) {
          currentColorProperties.push(prop + ':' + $el.css(prop));
          html += currentColor + '{' + currentColorProperties.join(';') + '}';
        }
      }
    }

    html += '.hide-code .code,.hide-group .group,.hide-room .room,.hide-title .title,.hide-week .week{display:none}' +
      'table{border-collapse:collapse;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif}' +
      '</style><body class="' + $('body').attr('class') + '">' +
      '<div class="' + $('#timetable-wrapper').attr('class') +
      '" id="timetable-wrapper">' + $('#timetable-wrapper').html() + '</div></body></html>' +
      $examTimetable[0].outerHTML;
    return html;
  },

  delta: function(week) {
    if (week < 7) {
      week -= 1;
    }
    return week;
  },

  // iCalendar date with UTC time format.
  // [Specification](http://www.kanzaki.com/docs/ical/dateTime.html).
  iCalDateTime: function(date) {
    return date.getUTCFullYear() +
        padTwo(date.getUTCMonth() + 1) +
        padTwo(date.getUTCDate()) + 'T' +
        padTwo(date.getUTCHours()) +
        padTwo(date.getUTCMinutes()) +
        padTwo(date.getUTCSeconds()) + 'Z';
  },

  // Generate [base32hex](http://en.wikipedia.org/wiki/Base32#base32hex) UID,
  // like Google Calendar does.
  iCalUID: function() {
    var uid = '';
    for (var i = 0; i < 26; i++) {
      uid += Math.floor(Math.random() * 32).toString(32);
    }
    return uid;
  },

  // Generate minimal iCalendar file that has been tested to work with Apple's
  // iCal, Google Calendar and Microsoft Outlook.
  // [Specification](http://www.kanzaki.com/docs/ical/).
  iCalendar: function() {
    var academicYear = this.options.academicYear;
    var semester = this.options.semester;
    var v = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:NUSMods.com'];
    this.options.exams.each(function(exam) {
      if (exam.get('ExamDate')) {
        v = v.concat([
          'BEGIN:VEVENT',
          'UID:' + this.iCalUID() + '@nusmods.com',
          'DTSTAMP:' + this.iCalDateTime(new Date()),
          'SUMMARY:' + exam.id.split(' ')[0] + ' Exam',
          'DESCRIPTION:' + exam.get('ModuleTitle'),
          'DTSTART:' + this.iCalDateTime(new Date(exam.get('ExamDate'))),
          'DURATION:PT2H',
          'URL:http://www.nus.edu.sg/registrar/event/examschedule-sem' +
            semester + '.html',
          'END:VEVENT'
        ]);
      }
    }, this);
    _.each($('td > .lesson'), function(el) {
      var lesson = $(el).data('lessonView').model;
      v = v.concat([
        'BEGIN:VEVENT',
        'UID:' + this.iCalUID() + '@nusmods.com',
        'DTSTAMP:' + (this.iCalDateTime(new Date())),
        'SUMMARY:' + lesson.get('ModuleCode') + ' ' + lesson.get('LessonType'),
        'DESCRIPTION:' + lesson.get('ModuleTitle') + '\\n' +
          lesson.get('LessonType') + ' Group ' + lesson.get('ClassNo'),
        'LOCATION:' + lesson.get('Venue'),
        'URL:https://myaces.nus.edu.sg/cors/jsp/report/ModuleDetailedInfo.jsp' +
          '?acad_y=' + academicYear + '&sem_c=' + semester + '&mod_c=' +
          lesson.get('ModuleCode')
      ]);
      var semStart = academicCalendar[academicYear][semester].start;
      var start = new Date(Date.UTC(semStart[0], semStart[1], semStart[2],
        +lesson.get('StartTime').slice(0, 2) - 8,
        +lesson.get('StartTime').slice(2)));
      start.setUTCDate(start.getUTCDate() + lesson.get('dayIndex'));
      var recess = new Date(start.getTime());
      recess.setUTCDate(recess.getUTCDate() + 42);
      var week = lesson.get('WeekText');
      var exDate;
      if (week.indexOf('Week') !== -1) {
        v.push('RRULE:FREQ=WEEKLY;COUNT=14');
        var isTut = isTutorial[lesson.get('LessonType')];
        if (isTut || week === 'Even Week') {
          v.push('EXDATE:' + (this.iCalDateTime(start)));
        }
        if (isTut && week !== 'Odd Week') {
          exDate = new Date(start.getTime());
          exDate.setUTCDate(exDate.getUTCDate() + 7);
          v.push('EXDATE:' + (this.iCalDateTime(exDate)));
        }
        if (week !== 'Every Week') {
          for (var i = (week === 'Odd Week' ? 2 : 3); i <= 13; i += 2) {
            exDate = new Date(start.getTime());
            exDate.setUTCDate(exDate.getUTCDate() + this.delta(i) * 7);
            v.push('EXDATE:' + (this.iCalDateTime(exDate)));
          }
        }
      } else {
        var weeks = week.split(/[-,]/);
        var startWeek = +weeks[0];
        start.setUTCDate(start.getUTCDate() + this.delta(startWeek) * 7);
        switch (weeks.length) {
          case 1:
            v.push('RRULE:FREQ=WEEKLY;COUNT=1');
            break;
          case 2:
            if (week.indexOf(',') !== -1) {
              v.push('RRULE:FREQ=WEEKLY;COUNT=2;INTERVAL=' +
                (this.delta(weeks[1]) - this.delta(weeks[0])));
            } else {
              v.push('RRULE:FREQ=WEEKLY;COUNT=' + (weeks[1] - weeks[0] + 1));
            }
            break;
          default:
            v.push('RRULE:FREQ=WEEKLY;COUNT=' + (weeks[weeks.length - 1] - weeks[0] + 1));

            // Given a week string like '1,3,5-6,9-11', the weeks to exclude,
            // using EXDATE, correspond to the positions of the commas.
            // Hence, we first split to ['1,3,5', '6,9', '11'], and again to
            // [1,3,5] and [6,9], then exclude the missing intervening weeks
            // in each range.
            _.each(week.split('-'), function(weeksWithComma) {
              weeks = _.map(weeksWithComma.split(','), function(str) {
                return +str;
              });
              if (weeks.length > 1) {
                for (i = weeks[0] + 1; i < weeks[weeks.length - 1]; i++) {
                  if (!_.contains(weeks, i)) {
                    exDate = new Date(start.getTime());
                    exDate.setUTCDate(exDate.getUTCDate() + (this.delta(i) - this.delta(startWeek)) * 7);
                    v.push('EXDATE:' + this.iCalDateTime(exDate));
                  }
                }
              }
            }, this);
        }
      }
      var end = new Date(start.getTime());
      end.setUTCHours(end.getUTCHours() + lesson.get('duration') / 2);
      v = v.concat([
        'DTSTART:' + this.iCalDateTime(start),
        'DTEND:' + this.iCalDateTime(end),
        'EXDATE:' + this.iCalDateTime(recess),
        'END:VEVENT'
      ]);
    }, this);
    v.push('END:VCALENDAR');
    for (var i = 0; i < v.length; i++) {
      var line = v[i];
      if (line.length > 75) {
        v[i] = line.slice(0, 76);
        v.splice(i + 1, 0, ' ' + line.slice(76));
      }
    }
    return v.join('\r\n');
  },

  // Minimal SpreadsheetML format. No definitive reference, some parts
  // reverse-engineered from Excel-generated files. Works at least in
  // Microsoft Office Excel 2003 and up. Does not appear to work in
  // Apache OpenOffice or Apple iWork Pages.
  spreadsheetML: function() {
    var xml =
        '<?xml version="1.0"?>' +
        '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ' +
        'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">' +
        '<Styles>' +
        '<Style ss:ID="Default">' +
        '<Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>' +
        '</Style>' +
        '<Style ss:ID="b">' +
        '<Font ss:FontName="Calibri" ss:Size="12" ss:Bold="1"/>' +
        '<NumberFormat ss:Format="0000"/>' +
        '</Style>' +
        '</Styles>' +
        '<Worksheet ss:Name="My NUSMods.com Timetable">' +
        '<Table ss:DefaultColumnWidth="35">' +
        '<Column ss:Width="65"/>' +
        '<Row>' +
        '<Cell ss:Index="2" ss:MergeAcross="1" ss:StyleID="b">' +
        '<Data ss:Type="Number">800</Data>' +
        '</Cell>' +
        '<Cell ss:MergeAcross="1" ss:StyleID="b">' +
        '<Data ss:Type="Number">900</Data>' +
        '</Cell>' +
        '<Cell ss:MergeAcross="1" ss:StyleID="b">' +
        '<Data ss:Type="Number">1000</Data>' +
        '</Cell>' +
        '<Cell ss:MergeAcross="1" ss:StyleID="b">' +
        '<Data ss:Type="Number">1100</Data>' +
        '</Cell>' +
        '<Cell ss:MergeAcross="1" ss:StyleID="b">' +
        '<Data ss:Type="Number">1200</Data>' +
        '</Cell>' +
        '<Cell ss:MergeAcross="1" ss:StyleID="b">' +
        '<Data ss:Type="Number">1300</Data>' +
        '</Cell>' +
        '<Cell ss:MergeAcross="1" ss:StyleID="b">' +
        '<Data ss:Type="Number">1400</Data>' +
        '</Cell>' +
        '<Cell ss:MergeAcross="1" ss:StyleID="b">' +
        '<Data ss:Type="Number">1500</Data>' +
        '</Cell>' +
        '<Cell ss:MergeAcross="1" ss:StyleID="b">' +
        '<Data ss:Type="Number">1600</Data>' +
        '</Cell>' +
        '<Cell ss:MergeAcross="1" ss:StyleID="b">' +
        '<Data ss:Type="Number">1700</Data>' +
        '</Cell>' +
        '<Cell ss:MergeAcross="1" ss:StyleID="b">' +
        '<Data ss:Type="Number">1800</Data>' +
        '</Cell>' +
        '<Cell ss:MergeAcross="1" ss:StyleID="b">' +
        '<Data ss:Type="Number">1900</Data>' +
        '</Cell>' +
        '<Cell ss:MergeAcross="1" ss:StyleID="b">' +
        '<Data ss:Type="Number">2000</Data>' +
        '</Cell>' +
        '<Cell ss:MergeAcross="1" ss:StyleID="b">' +
        '<Data ss:Type="Number">2100</Data>' +
        '</Cell>' +
        '<Cell ss:MergeAcross="1" ss:StyleID="b">' +
        '<Data ss:Type="Number">2200</Data>' +
        '</Cell>' +
        '<Cell ss:MergeAcross="1" ss:StyleID="b">' +
        '<Data ss:Type="Number">2300</Data>' +
        '</Cell>' +
        '</Row>';

    var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var daysAbbrev = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    var newLine = window.navigator.platform.indexOf('Win') !== -1 ? '&#13;&#10;' : '&#13;';

    _.each(daysAbbrev, function(dayAbbrev, i) {
      var rows = $('#' + dayAbbrev + ' > tr');
      for (var j = rows.length - 1; j >= 1; j -= 1) {
        var row = rows[j];
        if (!$(row).find('.lesson').length) {
          rows.splice(j, 1);
        }
      }
      _.each(rows, function(row, rowIndex) {
        xml += '<Row ss:Height="60">';
        if (rowIndex === 0) {
          xml += '<Cell ';
          if (rows.length > 1) {
            xml += 'ss:MergeDown="' + (rows.length - 1) + '" ';
          }
          xml += 'ss:StyleID="b"><Data ss:Type="String">' + days[i] + '</Data></Cell>';
        }
        $(row).find('.lesson').each(function() {
          var lesson = $(this).data('lessonView').model;
          xml += '<Cell ss:Index="' + (Math.round(lesson.get('StartTime') / 50) - 14);
          if (lesson.get('duration') > 1) {
            xml += '" ss:MergeAcross="' + (lesson.get('duration') - 1);
          }
          xml += '"><Data ss:Type="String">' + lesson.get('ModuleCode') + newLine +
              lesson.get('typeAbbrev') + ' ' + lesson.get('ClassNo') + newLine +
              lesson.get('Venue');
          if (lesson.get('WeekText') !== 'Every Week') {
            xml += newLine + lesson.get('weekStr');
          }
          xml += '</Data></Cell>';
        });
        xml += '</Row>';
      });
    });
    return xml + '</Table></Worksheet></Workbook>';
  }
});
