'use strict';

var $ = require('jquery');
var App = require('../../app');
var Backbone = require('backbone');
var BiddingStatsView = require('./BiddingStatsView');
var GoToTopBehavior = require('../../common/behaviors/GoToTopBehavior');
var ModuleHoverBehavior = require('../../common/behaviors/ModuleHoverBehavior');
var Marionette = require('backbone.marionette');
var PrerequisitesTreeView = require('./PrerequisitesTreeView');
var _ = require('underscore');
var analytics = require('../../analytics');
var localforage = require('localforage');
var template = require('../templates/module.hbs');
var config = require('../../common/config');
require('bootstrap/scrollspy');
require('bootstrap/affix');
require('bootstrap/tab');

var preferencesNamespace = config.namespaces.preferences + ':';

module.exports = Marionette.LayoutView.extend({
  template: template,
  ui: {
    backToTopButton: '#back-to-top'
  },
  behaviors: {
    GoToTopBehavior: {
      behaviorClass: GoToTopBehavior
    },
    ModuleHoverBehavior: {
      behaviorClass: ModuleHoverBehavior
    }
  },
  regions: {
    biddingStatsRegion: '#bidding-stats',
    prerequisitesTreeRegion: '.nm-prerequisites-tree'
  },
  initialize: function () {
    if (!window.location.hash) {
      $('html,body').stop(true, true).animate({scrollTop: 0}, 400);
    }

    this.formElements = {
      'faculty': '#faculty',
      'account': '#account',
      'student': 'input:radio[name="student-radios"]'
    };
    this.searchPreferences = {};
  },
  events: {
    'change #faculty, input:radio[name="student-radios"], #account': 'updatePreferences',
    'click .js-nm-module-nav a': 'scrollToSection',
    'click .add-timetable': function (event) {
      var qtipContent;
      var currentTarget = $(event.currentTarget);
      var semester = currentTarget.data('semester');
      var moduleCode = this.model.get('module').ModuleCode;
      analytics.track('Timetable', 'Add module', 'From module page', semester);
      if (App.request('isModuleSelected', semester, moduleCode)) {
        qtipContent = 'Already added!';
      } else {
        qtipContent = 'Added!';
        App.request('addModule', semester, this.model.get('module').ModuleCode);
      }
      currentTarget.qtip({
        content: qtipContent,
        show: {
          event: false,
          ready: true
        },
        hide: {
          event: false,
          inactive: 1000
        }
      });
      return false;
    },
    'click .add-bookmark': function (event) {
      analytics.track('Bookmarks', 'Add bookmark', 'From module page');
      App.request('addBookmark', this.model.get('module').ModuleCode);
      $(event.currentTarget).qtip({
        content: 'Bookmarked!',
        show: {
          event: false,
          ready: true
        }
      });
    }
  },
  onShow: function () {
    /* jshint camelcase: false */
    var module = this.model.get('module');

    if (module.ModmavenTree) {
      var lockedModules = {'name': module.ModmavenTree.name, 'children': []};
      for (var i = 0; i < module.LockedModules.length; i++) {
        lockedModules.children.push({'name': module.LockedModules[i], 'children': []});
      }
      this.prerequisitesTreeRegion.show(
        new PrerequisitesTreeView({
          model: new Backbone.Model({
            prereqs: module.ModmavenTree,
            lockedModules: lockedModules,
            modCode: module.ModuleCode
          })
      }));
    }

    this.$('.nm-help').qtip({
      position: {
        my: 'left bottom',
        at: 'right center'
      }
    });

    var code = module.ModuleCode;
    var disqusShortname = config.disqusShortname;

    // Only reset Disqus when showing reviews section
    var url = 'https://nusmods.com/modules/' + code + '/reviews';
    var title = code + ' ' + module.ModuleTitle;

    window.disqus_identifier = code;
    window.disqus_title = title;
    window.disqus_url = url;

    if (!window.DISQUS) {
      window.disqus_shortname = disqusShortname;

      (function() {
        var dsq = document.createElement('script');
        dsq.type = 'text/javascript';
        dsq.async = true;
        dsq.src = '//' + disqusShortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
      })();
    } else {
      DISQUS.reset({
        reload: true,
        config: function () {
          this.page.identifier = code;
          this.page.title = title;
          this.page.url = url;
        }
      });
    }

    (function () {
      if (typeof disqus_domain !== 'undefined') {
        DISQUSWIDGETS.domain = 'disqus.com';
      }
      DISQUSWIDGETS.forum = disqusShortname;
      DISQUSWIDGETS.getCount();
    })();
    var hash = window.location.hash;
    window.location.hash = '';

    setTimeout(function () {
      window.location.hash = hash;
    }, 0);

    var that = this;
    var loadedItems = 0;
    _.each(that.formElements, function (selector, item) {
      localforage.getItem(preferencesNamespace + item, function (value) {
        if (!value) {
          value = config.defaultPreferences[item];
          localforage.setItem(preferencesNamespace + item, value);
        }
        $(selector).val([value]);
        that.searchPreferences[item] = value;
        loadedItems++;
        if (loadedItems === _.keys(that.formElements).length) {
          that.showBiddingStatsRegion(true);
        }
      });
    });

    $('.js-nm-module-nav').affix({
      offset: {
        top: 160
      }
    });

    $('body').scrollspy({
      target: '.js-nm-module-nav-container'
    });

    // Index 0 is "All", therefore index no. = sem no.
    $('.js-nm-ls-schedule-tabs a[data-target="#nm-ls-schedule-sem' + config.semester + '"]').tab('show');
  },
  updatePreferences: function ($ev) {
    var $target = $($ev.target);
    $target.blur();
    var property = $target.attr('data-pref-type');
    var value = $target.val();
    analytics.track('Module cors', 'Change ' + property, value);
    if (this.savePreference(property, value)) {
      this.searchPreferences[property] = value;
      this.showBiddingStatsRegion(true);
    }
  },
  showBiddingStatsRegion: function () {
    var biddingStatsDeepCopy = $.extend(true, {},
      this.model.attributes.module.FormattedCorsBiddingStats);
    var biddingStatsModel = new Backbone.Model({stats: biddingStatsDeepCopy});
    var biddingStatsView = new BiddingStatsView({model: biddingStatsModel});

    var faculty = this.searchPreferences.faculty;
    var accountType = this.searchPreferences.account;
    var newStudent = this.searchPreferences.student === 'true';

    if (faculty && faculty !== 'default' && accountType) {
      biddingStatsView.filterStats(faculty, accountType, newStudent);
      this.biddingStatsRegion.show(biddingStatsView);
    }
  },
  savePreference: function (property, value) {
    if (property === 'faculty' && value === 'default') {
      window.alert('You have to select a faculty.');
      localforage.getItem(preferencesNamespace + property, function (value) {
        $('#faculty').val(value);
      });
      return false;
    }
    localforage.setItem(preferencesNamespace + property, value);
    return true;
  },
  scrollToSection: function (event) {
    event.preventDefault();
    var target = $(event.currentTarget).attr('href');
    $('html, body').animate({
      scrollTop: $(target).offset().top - (target === '#details' ? 65 : 0)
    }, 300, function () {
      window.location.hash = target;
    });
  }
});
