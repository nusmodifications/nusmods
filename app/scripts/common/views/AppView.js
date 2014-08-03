'use strict';

var App = require('../../app');
var Backbone = require('backbone');
var Mousetrap = require('Mousetrap');
var NUSMods = require('../../nusmods');
var SelectView = require('./SelectView');
var BookmarksView = require('./BookmarksView');
var _ = require('underscore');
var attachFastClick = require('fastclick');
var corsify = require('../../cors/corsify');
var themePicker = require('../themes/themePicker');
require('bootstrap/alert');
require('qTip2');

module.exports = Backbone.View.extend({
  el: 'body',

  events: {
    'click a[href]:not([data-bypass])': 'hijackLinks'
  },

  // Ref: https://github.com/backbone-boilerplate/backbone-boilerplate/blob/85723839dbab6787d69eedcbbea05e1d59960eff/app/app.js#L52
  hijackLinks: function (event) {
    // Do not hijack if modifier key was pressed when the event fired.
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    // Get the absolute anchor href.
    var $link = $(event.currentTarget);
    var href = { prop: $link.prop('href'), attr: $link.attr('href') };
    // Get the absolute root.
    var root = location.protocol + '//' + location.host + '/';

    // Ensure the root is part of the anchor href, meaning it's relative.
    if (href.prop.slice(0, root.length) === root) {
      // Stop the default event to ensure the link will not cause a page
      // refresh.
      event.preventDefault();

      // `Backbone.history.navigate` is sufficient for all Routers and will
      // trigger the correct events. The Router's internal `navigate` method
      // calls this anyways.  The fragment is sliced from the root.
      this.navigateWithScrollTop(href.attr, true);
    }
  },

  initialize: function () {
    $.ajaxSetup({
      cache: true
    });

    // [Override](http://craigsworks.com/projects/qtip2/tutorials/advanced/#override)
    // default tooltip settings.
    $.fn.qtip.defaults.position.my = 'bottom center';
    $.fn.qtip.defaults.position.at = 'top center';
    $.fn.qtip.defaults.position.viewport = true;
    $.fn.qtip.defaults.show.solo = true;
    $.fn.qtip.defaults.style.classes = 'qtip-bootstrap';

    NUSMods.getLastModified().then(function (lastModified) {
      $('#correct-as-at').text((new Date(lastModified)).toString().slice(0, 21));
    });

    $('.cors-round-text').html(corsify.determineRound(Date.now()));
    $('.cors-round-container').addClass('animated bounceInUp shown').alert();

    App.selectRegion.show(new SelectView());

    $('.container').removeClass('hidden');

    Mousetrap.bind('/', function(ev) {
      ga('send', 'event', 'Search', 'Keyboard', 'Main Search');
      $('#s2id_autogen2').focus();
      ev.preventDefault();
      return false;
    });

    var keyboardNavigationMappings = {
      t: '/timetable',
      m: '/modules',
      p: '/preferences',
      '?': '/help'
    };

    var that = this;
    
    _.each(keyboardNavigationMappings, function (value, key) {
      Mousetrap.bind(key, function () {
        ga('send', 'event', 'Navigation', 'Keyboard', value.slice(1));
        that.navigateWithScrollTop(value, true);
      });
    });

    var modulePageRegex = /^\/modules\/[^\/]{6,10}/;

    var keyboardAnchorMappings = {
      c: '#cors',
      s: '#schedule',
      e: '#prerequisites',
      r: '#reviews'
    };

    _.each(keyboardAnchorMappings, function (value, key) {
      Mousetrap.bind(key, function () {
        var section = value.slice(1);
        ga('send', 'event', 'Module ' + section, 'Visit - Keyboard', section);
        if (modulePageRegex.test(window.location.pathname)) {
          location.hash = value;
        }
      });
    });
    
    Mousetrap.bind(['x'], function () {
      var newMode = themePicker.toggleMode();
      ga('send', 'event', 'event', 'Mode', 'Change mode using keyboard', newMode);
      if (modulePageRegex.test(window.location.pathname) && window.DISQUS) {
        window.DISQUS.reset({
          reload: true,
          config: function () {
            this.page.identifier = window.disqus_identifier;
            this.page.title = window.disqus_title;
            this.page.url = window.disqus_url;
          }
        });
      }
    });

    Mousetrap.bind(['left', 'right'], function (e) {
      var newTheme = themePicker.selectNextTheme(e.keyCode === 37 ? 'Left' : 'Right');
      ga('send', 'event', 'Theme', 'Change theme using keyboard', newTheme, e.keyCode === 37 ? 1 : 0);
      return false;
    });

    $('.nm-bookmark-button').qtip({
      content: '<div class="nm-bookmarks"></div>',
      hide: {
        fixed: true,
        delay: 300
      },
      events: {
        show: function() {
          ga('send', 'event', 'Bookmarks', 'Display bookmark');
          App.request('getBookmarks', function (modules) {
            var modulesList = [];
            _.each(modules, function (module) {
              modulesList.push({'module': module});
            });
            var bookmarksCollection = new Backbone.Collection(modulesList);
            var bookmarksView = new BookmarksView({collection: bookmarksCollection});
            App.bookmarksRegion.show(bookmarksView);
          });
        }
      }
    });

    attachFastClick(document.body);
  },

  navigateWithScrollTop: function (location, trigger) {
    Backbone.history.navigate(location, {trigger: trigger});
    // Hack: Scroll to top of page after navigation
    setTimeout(function () {
      window.scrollTo(0, 0);
    }, 0);
  }
});
