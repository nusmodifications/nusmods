define([
  'backbone',
  'backbone.marionette',
  'hbs!../templates/module',
  'underscore',
  'localforage',
  './BiddingStatsView',
  'bootstrap'],
  function (Backbone, Marionette, template, _, localforage, BiddingStatsView) {
    'use strict';

    var searchPreferences = {};

    return Marionette.LayoutView.extend({
      template: template,
      regions: {
        biddingStatsRegion: '#bidding-stats'
      },
      initialize: function (data) {
        var formElements = {
          'faculty': '#faculty',
          'account': '#account',
          'student': 'input:radio[name="student-radios"]'
        }

        var that = this;
        _.each(formElements, function (selector, item) {
          localforage.getItem(item, function (value) {
            if (value) {
              $(selector).val([value]);
              searchPreferences[item] = value;
            }
          })
        });
      },
      events: {
        'change #faculty, input:radio[name="student-radios"], #account': 'updateCorspedia',
        'click .show-full-desc': 'showFullDescription',
      },
      onShow: function () {
        var module = this.model.get('module');
        var code = module.ModuleCode;

        var disqusShortname = 'nusmods';

        (function() {
          if (typeof disqus_domain != 'undefined') {
            DISQUSWIDGETS.domain = 'disqus.com';
          }
          DISQUSWIDGETS.forum = disqusShortname;
          DISQUSWIDGETS.getCount();
        })();

        if (this.model.get('section') === 'reviews') {
          // Only reset Disqus when showing reviews section
          DISQUS.reset({
            reload: true,
            config: function () {
              this.page.identifier = code;
              this.page.title = code + ' ' + module.ModuleTitle + ' · Reviews';
              this.page.url = 'http://nusmods.com/modules/' + code + '/reviews';
            }
          });
        }
        $('.nm-help').tooltip();

        // So that users can use keyboard shortcuts immediately after the page loads
        $('input').blur();

        this.showBiddingStatsRegion();
      },
      showFullDescription: function ($ev) {
        $('.module-desc').addClass('module-desc-more');
        return false;
      },
      updateCorspedia: function ($ev) {
        var $target = $($ev.target);
        $target.blur();
        var property = $target.attr('data-pref-type');
        var value = $target.val();
        if (this.savePreference(property, value)) {
          searchPreferences[property] = value;
          this.showBiddingStatsRegion(searchPreferences['faculty'], 
            searchPreferences['account'], searchPreferences['student']);
        }
      },
      showBiddingStatsRegion: function (faculty, accountType, newStudent) {
        
        var biddingStatsDeepCopy = $.extend(true, {}, this.model.attributes.module.FormattedCorsBiddingStats);
        var biddingStatsModel = new Backbone.Model({stats: biddingStatsDeepCopy});
        var biddingStatsView = new BiddingStatsView({model: biddingStatsModel});
        if (faculty && accountType && newStudent) {
          biddingStatsView.filterStats(faculty, accountType, newStudent);
        }
        this.biddingStatsRegion.show(biddingStatsView);
      },
      savePreference: function (property, value) {
        if (property === 'faculty' && value === 'default') {
          alert('You have to select a faculty.');
          localforage.getItem(property, function (value) {
            $('#faculty').val(value);
          });
          return false;
        }
        localforage.setItem(property, value);
        return true;
      }
    });
  });
