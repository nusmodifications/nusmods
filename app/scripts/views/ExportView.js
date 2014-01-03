define(['underscore', 'backbone', 'downloadify', 'swfobject'],
  function(_, Backbone) {
  'use strict';

  // Pad number to two digits.
  var padTwo = function(number) {
    return (number < 10 ? '0' : '') + number;
  };

  var ExportView = Backbone.View.extend({
    el: $('#export-modal'),

    events: {
      'show': 'show'
    },

    initialize: function(options) {
      this.options = options;

      _.bindAll(this, 'showModal', 'jpgClick', 'pdfClick', 'htmlClick',
          'icalClick', 'xlsClick');

      // Currently only supported in Chrome.
      this.dlAttrSupported = 'download' in document.createElement('a');
      this.fileURI = location.protocol === 'file:';
      this.flash10 = swfobject.hasFlashPlayerVersion('10');

      $('#export-timetable-action').click(this.showModal);
      $('#jpg-file').click(this.jpgClick);
      $('#pdf-file').click(this.pdfClick);
      if (this.dlAttrSupported) {
        // If download attribute supported, enable downloading directly from
        // menu items.
        $('#html-file').click(this.htmlClick);
        $('#ical-file').click(this.icalClick);
        $('#xls-file').click(this.xlsClick);
      } else {
        $('#html-file').click(this.showModal);
        $('#ical-file').click(this.showModal);
        $('#xls-file').click(this.showModal);
      }
      if (this.dlAttrSupported || this.fileURI || !this.flash10) {
        if (!this.dlAttrSupported) {
          if (!this.fileURI) {
            $('#afp-or').show();
          }
          $('#save-link-as-instructions').show();
        }
      } else {
        var downloadifyOptions = {
          swf: 'bower_components/Downloadify/media/downloadify.swf',
          downloadImage: 'images/988945bc.download.png',
          height: 30,
          width: 111
        };
        $('#dl-html-container').downloadify($.extend({}, downloadifyOptions, {
          data: this.htmlTimetable,
          filename: 'My NUSMods.com Timetable.html'
        }));
        $('#dl-ical-container').downloadify($.extend({}, downloadifyOptions, {
          data: this.iCalendar,
          filename: 'My NUSMods.com Timetable.ics'
        }));
        $('#dl-xls-container').downloadify($.extend({}, downloadifyOptions, {
          data: this.spreadsheetML,
          filename: 'My NUSMods.com Timetable.xls'
        }));
      }
    },

    show: function() {
      var htmlTimetable = encodeURIComponent(this.htmlTimetable());
      $('#jpg-html').val(htmlTimetable);
      $('#pdf-html').val(htmlTimetable);
      if (this.dlAttrSupported || this.fileURI || !this.flash10) {
        $('#dl-html').attr('href', 'data:text/html,' + htmlTimetable);
        $('#dl-ical').attr('href', 'data:text/calendar,' +
            encodeURIComponent(this.iCalendar()));
        $('#dl-xls').attr('href', 'data:application/vnd.ms-excel,' +
            encodeURIComponent(this.spreadsheetML()));
      }
    },

    jpgClick: function() {
      if (!this.collection.length) {
        alert('No modules to export!');
        return false;
      }
      $('#jpg-html').val(encodeURIComponent(this.htmlTimetable()));
      document.forms['jpg-form'].submit();
    },

    pdfClick: function() {
      if (!this.collection.length) {
        alert('No modules to export!');
        return false;
      }
      $('#pdf-html').val(encodeURIComponent(this.htmlTimetable()));
      document.forms['pdf-form'].submit();
    },

    htmlClick: function() {
      if (!this.collection.length) {
        alert('No modules to export!');
        return false;
      }
      $(this).attr('href', 'data:text/html,' +
          encodeURIComponent(this.htmlTimetable()));
    },

    icalClick: function() {
      if (!this.collection.length) {
        alert('No modules to export!');
        return false;
      }
      $(this).attr('href', 'data:text/calendar,' +
          encodeURIComponent(this.iCalendar()));
    },

    xlsClick: function() {
      if (!this.collection.length) {
        alert('No modules to export!');
        return false;
      }
      $(this).attr('href', 'data:application/vnd.ms-excel,' +
          encodeURIComponent(this.spreadsheetML()));
    },

    showModal: function() {
      if (!this.collection.length) {
        alert('No modules to export!');
        return false;
      }
      $('#export-modal').modal('show');
    },

    // Custom minimal HTML5/CSS3. CSS that applies to export timetable separated
    // out into _timetable.scss so that it can be compressed and copied here
    // when updated. DOM is extracted directly from currently displaying
    // timetable and embedded into template.
    htmlTimetable: function() {
      return '<!DOCTYPE html><title>My NUSMods.com Timetable</title><style>' +
          '#timetable-wrapper{font-size:11px;font-weight:700;line-height:13px;width:1245px}' +
          '#timetable{margin:0 0 15px -20px;max-width:none;table-layout:fixed;width:1235px}' +
          '#timetable th{background-color:#fff}' +
          '#times div{margin-right:-13px;text-align:right}' +
          '.day{border-bottom:1px solid #ddd;border-top:1px solid #ddd}' +
          '.day th{border-bottom:1px solid #fff;border-top:1px solid #fff}' +
          '.day th div{line-height:15px;margin-right:-20px}' +
          '.day td{height:34px;padding:1px 0 0}' +
          '.m00{border-left:1px solid #ddd}' +
          '.m30{border-right:1px solid #ddd}' +
          '.lesson{border:2px solid;overflow:hidden;padding:1px 3px 3px}' +
          '.color0{background-color:#f7977a;border-color:#9c2b09;color:#6c1e06}' +
          '.color1{background-color:#f9ad81;border-color:#a64208;color:#752f06}' +
          '.color2{background-color:#fdc68a;border-color:#b86103;color:#864702}' +
          '.color3{background-color:#fff79a;border-color:#cdbd00;color:#9a8e00}' +
          '.color4{background-color:#c4df9b;border-color:#60842a;color:#445d1e}' +
          '.color5{background-color:#a2d39c;border-color:#397132;color:#274e22}' +
          '.color6{background-color:#82ca9d;border-color:#265a3a;color:#173623}' +
          '.color7{background-color:#7bcdc8;border-color:#225a57;color:#143533}' +
          '.color8{background-color:#6ecff6;border-color:#09698f;color:#06465f}' +
          '.color9{background-color:#7ea7d8;border-color:#20426a;color:#142943}' +
          '.color10{background-color:#8493ca;border-color:#27325b;color:#181f37}' +
          '.color11{background-color:#8882be;border-color:#2b284c;color:#18162b}' +
          '.color12{background-color:#a187be;border-color:#3c2b4e;color:#22192d}' +
          '.color13{background-color:#bc8dbf;border-color:#502e52;color:#301c31}' +
          '.color14{background-color:#f49ac2;border-color:#af1358;color:#810e41}' +
          '.color15{background-color:#f6989d;border-color:#b21018;color:#840b12}' +
          '.hide-code .code,.hide-group .group,.hide-room .room,.hide-title .title,.hide-week .week{display:none}' +
          'table{border-collapse:collapse;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif}' +
          '</style><div class="' + $('#timetable-wrapper').attr('class') +
          '" id="timetable-wrapper">' + $('#timetable-wrapper').html() + '</div>';
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
      var v = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:NUSMods.com'];
      this.options.exams.each(function(exam) {
        if (exam.get('unixTime')) {
          v = v.concat([
            'BEGIN:VEVENT',
            'UID:' + this.iCalUID() + '@nusmods.com',
            'DTSTAMP:' + this.iCalDateTime(new Date()),
            'SUMMARY:' + exam.get('id').split(' ')[0] + ' Exam',
            'DESCRIPTION:' + exam.get('title'),
            'DTSTART:' + this.iCalDateTime(new Date(exam.get('unixTime'))),
            'DURATION:PT2H',
            'URL:http://www.nus.edu.sg/registrar/event/examschedule-sem2.html',
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
          'SUMMARY:' + lesson.get('shortCode') + ' ' + lesson.get('typeName'),
          'DESCRIPTION:' + lesson.get('title') + '\\n' +
              lesson.get('typeName') + ' Group ' + lesson.get('group'),
          'LOCATION:' + lesson.get('room'),
          'URL:https://aces01.nus.edu.sg/cors/jsp/report/ModuleDetailedInfo.jsp' +
              ('?acad_y=2012/2013&sem_c=2&mod_c=' + lesson.get('shortCode'))]);
        var start = new Date(Date.UTC(2013, 0, 14,
            +lesson.get('start').slice(0, 2) - 8, +lesson.get('start').slice(2)));
        start.setUTCDate(start.getUTCDate() + lesson.get('day'));
        var recess = new Date(start.getTime());
        recess.setUTCDate(recess.getUTCDate() + 42);
        var week = lesson.get('week');
        var exDate;
        if (typeof (week) === 'number') {
          v.push('RRULE:FREQ=WEEKLY;COUNT=14');
          if (lesson.isTut || week === 2) {
            v.push('EXDATE:' + (this.iCalDateTime(start)));
          }
          if (lesson.isTut && week !== 1) {
            exDate = new Date(start.getTime());
            exDate.setUTCDate(exDate.getUTCDate() + 7);
            v.push('EXDATE:' + (this.iCalDateTime(exDate)));
          }
          if (week) {
            for (var i = week + 1; i <= 13; i += 2) {
              exDate = new Date(start.getTime());
              exDate.setUTCDate(exDate.getUTCDate() + this.delta(i) * 7);
              v.push('EXDATE:' + (this.iCalDateTime(exDate)));
            }
          }
        } else {
          var weeks = week.split(/[-,]/);
          var startWeek = +weeks[0]
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
        end.setUTCHours(end.getUTCHours() + lesson.duration / 2);
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
          '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">' +
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
      var typeAbbrev = ['LEC', 'LAB', 'LEC', 'LEC', 'TUT', 'REC', 'SEC', 'SEM', 'TUT', 'TUT2', 'TUT3'];

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
            xml += '<Cell ss:Index="' + (Math.round(lesson.get('start') / 50) - 14);
            if (lesson.get('duration') > 1) {
              xml += '" ss:MergeAcross="' + (lesson.get('duration') - 1);
            }
            xml += '"><Data ss:Type="String">' + lesson.get('shortCode') + '&#13;' +
                typeAbbrev[lesson.get('type')] + ' ' + lesson.get('group') + '&#13;' +
                lesson.get('room');
            if (lesson.get('week')) {
              xml += '&#13;' + lesson.get('weekStr');
            }
            xml += '</Data></Cell>';
          });
          xml += '</Row>';
        });
      });
      return xml + '</Table></Worksheet></Workbook>';
    }
  });

  return ExportView;
});
