'use strict';

var ArrayFacetModel = require('../models/ArrayFacetModel');
var FacetCollection = require('../collections/FacetCollection');
var FacetsView = require('./FacetsView');
var GoToTopBehavior = require('../../common/behaviors/GoToTopBehavior');
var Marionette = require('backbone.marionette');
var ModuleCollection = require('../../common/collections/ModuleCollection');
var ModulesListingView = require('./ModulesListingView');
var _ = require('underscore');
var template = require('../templates/modules.hbs');

module.exports = Marionette.LayoutView.extend({
  template: template,

  regions: {
    modulesRegion: '#content',
    sidebarRegion: '#sidebar'
  },

  ui: {
    content: '#content',
    sidebar: '#sidebar',
    sidebarToggle: '#sidebar-toggle',
    sidebarToggleIcon: '#sidebar-toggle i',
    backToTopButton: '#back-to-top'
  },

  behaviors: {
    GoToTopBehavior: {
      behaviorClass: GoToTopBehavior
    }
  },

  events: {
    'click @ui.sidebarToggle': function(event) {
      event.preventDefault();
      this.ui.sidebarToggleIcon.toggleClass('fa-chevron-left fa-chevron-right');
      this.ui.sidebar.animate({width: 'toggle'}, 100);
      this.ui.content
        .toggleClass('col-md-12 col-md-9')
        .toggleClass('no-sidebar');
      this.sidebarShown = !this.sidebarShown;
      var qtipContent = this.sidebarShown ? 'Hide Sidebar' : 'Show Sidebar';
      this.ui.sidebarToggle.qtip('option', 'content.text', qtipContent);
    }
  },
  
  initialize: function (options) {
    this.mods = options.mods;
  },

  onShow: function () {
    this.sidebarShown = true;
    this.ui.sidebarToggle.qtip({
      content: 'Hide Sidebar',
      position: {
        my: 'left center',
        at: 'top right'
      }
    });

    $('.arrow-down, .arrow-right').click(function() {
      $(this)
          .toggleClass('arrow-down arrow-right')
          .siblings('ul').toggle();
    });

    function updateAncestors(el, checked) {
      var all = true;
      el.siblings().each(function() {
        all = $(this).children('input[type="checkbox"]')
            .prop('checked') === checked;
        return all;
      });
      if (all) {
        var grandparent = el.parent('ul').parent('li');
        if (grandparent.length) {
          grandparent.children('input[type="checkbox"]').prop({
            checked: checked,
            indeterminate: false
          });
          updateAncestors(grandparent, checked);
        }
      } else {
        el.parents('li').children('input[type="checkbox"]').prop({
          checked: false,
          indeterminate: true
        });
      }
    }

    $('#sidebar input[type="checkbox"]').click(function() {
      var $this = $(this);
      var checked = $this.prop('checked'),
          parent = $this.parent();
      parent.find('input[type="checkbox"]').prop({
        checked: checked,
        indeterminate: false
      });
      updateAncestors(parent, checked);
    });

    var typeFriendlyName = {
      CFM: 'Cross-Faculty',
      GEM: 'GEM',
      Module: 'Faculty',
      SSM: 'Singapore Studies',
      UEM: 'Breadth / UE'
    };

    var mods = this.mods;
    _.each(mods, function (mod) {
      mod.level = mod.ModuleCode[mod.ModuleCode.search(/\d/)] * 1000;
      if (mod.Types) {
        mod.Types = _.map(mod.Types, function (type) {
          return typeFriendlyName[type] || type;
        });
      } else {
        mod.Types = ['Not in CORS'];
      }
      mod.LecturePeriods = mod.LecturePeriods || ['No Lectures'];
      mod.TutorialPeriods = mod.TutorialPeriods || ['No Tutorials'];
    });

    var filteredModules = new ModuleCollection();

    var facets = new FacetCollection([], {
      filteredCollection: filteredModules,
      pageSize: 10,
      rawCollection: mods
    });
    facets.add(new ArrayFacetModel({
      filteredCollection: mods,
      key: 'Types',
      label: 'Types'
    }));
    facets.add(_.map({
      Department: 'Faculty/Department',
      level: 'Level'
    }, function(label, key) {
      return {
        filteredCollection: mods,
        key: key,
        label: label
      };
    }));
    facets.add({
      filteredCollection: mods,
      key: 'ModuleCredit',
      label: 'Modular Credits (MCs)',
      sortBy: function (filter) {
        return +filter.label;
      }
    });
    facets.add(_.map(['Lecture Periods', 'Tutorial Periods'], function(label) {
      return new ArrayFacetModel({
        filteredCollection: mods,
        key: label.replace(' ', ''),
        label: label
      });
    }));

    this.sidebarRegion.show(new FacetsView({
      collection: facets,
      threshold: 600
    }));

    this.modulesRegion.show(new ModulesListingView({collection: filteredModules}));
  }
});
