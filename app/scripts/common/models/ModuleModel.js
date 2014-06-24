define(['backbone', 'underscore', 'common/utils/padTwo', 'common/utils/modulify'], function(Backbone, _, padTwo, modulify) {
  'use strict';

  // Convert exam in Unix time to 12-hour date/time format. We add 8 hours to
  // the UTC time, then use the getUTC* methods so that they will correspond to
  // Singapore time regardless of the local time zone.
  var examStr = function (exam) {
    if (exam) {
      var date = new Date(exam + 288e5);
      var hours = date.getUTCHours();
      return padTwo(date.getUTCDate()) +
        '-' + padTwo(date.getUTCMonth() + 1) +
        '-' + date.getUTCFullYear() +
        ' ' + (hours % 12 || 12) +
        ':' + padTwo(date.getUTCMinutes()) +
        ' ' + (hours < 12 ? 'AM' : 'PM');
    }
    return null;
  };

  var DESCRIPTION_LIMIT = 40;

  var shortenDescription = function (desc) {
    return desc.split(' ').splice(0, DESCRIPTION_LIMIT).join(' ');
  }

  var prettifyDepartment = function (dept) {
    var words = [];
    _.each(dept.split(' '), function (word) {
      words.push(word.charAt(0) + word.slice(1).toLowerCase());
    })
    return words.join(' ');
  }

  var workloadify = function (workload) {
    var workloadArray = workload.split('-');
    var workloadComponents = {
      lectureHours: workloadArray[0],
      tutorialHours: workloadArray[1],
      labHours: workloadArray[2],
      projectHours: workloadArray[3],
      preparationHours: workloadArray[4]
    };
    _.each(workloadComponents, function (value, key) {
      workloadComponents[key] = parseInt(value);
    });
    return workloadComponents;
  }

  return Backbone.Model.extend({
    idAttribute: 'code',
    initialize: function() {
      console.log(this);
      // TODO: Display exam date when 2014-2015/1 exam timetable released.
      // this.set('examStr', examStr(this.get('exam')));
      
      var description = this.get('ModuleDescription');
      if (description && description.split(' ').length > DESCRIPTION_LIMIT + 10) {
        this.set('ShortModuleDescription', shortenDescription(this.get('ModuleDescription')));
      }

      var workload = this.get('Workload');
      if (workload) {
        this.set('WorkloadComponents', workloadify(workload));
      }

      var department = this.get('Department');
      if (department) {
        this.set('Department', prettifyDepartment(department));
      }

      var prerequisite = this.get('Prerequisite');
      if (prerequisite) {
        this.set('ParsedPrerequisite', modulify.linkifyModules(prerequisite));
      }

      var preclusion = this.get('Preclusion');
      if (preclusion) {
        this.set('ParsedPreclusion', modulify.linkifyModules(preclusion));
      }
      var that = this;
      (function() {
        $('#disqus-script').remove(); // Force reload of disqus
        window.disqus_shortname = 'corspedia';
        window.disqus_identifier = that.get('ModuleCode');
        window.disqus_url = window.location.href;
        var dsq = document.createElement('script'); 
        dsq.type = 'text/javascript'; 
        dsq.async = true;
        dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
        dsq.id = 'disqus-script';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
        console.log('init dsq')
      })();
    }
  });
});
