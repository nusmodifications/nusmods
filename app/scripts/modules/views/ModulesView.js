'use strict';

var $ = require('jquery');
var Backbone = require('backbone');
var ArrayFacetModel = require('../models/ArrayFacetModel');
var FacetCollection = require('../collections/FacetCollection');
var FacetsView = require('./FacetsView');
var GoToTopBehavior = require('../../common/behaviors/GoToTopBehavior');
var Marionette = require('backbone.marionette');
var ModuleCollection = require('../../common/collections/ModuleCollection');
var ModulesListingView = require('./ModulesListingView');
var ModulesFilterMetaView = require('./ModulesFilterMetaView');
var _ = require('underscore');
var config = require('../../common/config');
var localforage = require('localforage');
var template = require('../templates/modules.hbs');
var slugify = require('../../common/utils/slugify');

module.exports = Marionette.LayoutView.extend({
  template: template,

  regions: {
    modulesFilterMetaRegion: '.nm-module-filter-meta',
    modulesRegion: '#content',
    sidebarRegion: '#sidebar'
  },

  ui: {
    content: '#content',
    sidebar: '#sidebar',
    backToTopButton: '#back-to-top'
  },

  behaviors: {
    GoToTopBehavior: {
      behaviorClass: GoToTopBehavior
    }
  },

  initialize: function (options) {
    this.mods = options.mods;
  },

  onShow: function () {
    $('.arrow-down, .arrow-right').click(function() {
      $(this)
          .toggleClass('arrow-down arrow-right')
          .siblings('ul').toggle();
    });

    function updateAncestors (el, checked) {
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

    var semesterNames = config.semesterNames;
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
      mod.semesterNames = [];
      for (var i = 0; i < mod.History.length; i++) {
        var history = mod.History[i];
        var sem = history.Semester;
        mod.semesterNames.push(semesterNames[sem - 1]);
        mod['LecturePeriods' + sem] = history.LecturePeriods || ['No Lectures'];
        mod['TutorialPeriods' + sem] = history.TutorialPeriods || ['No Tutorials'];
      }
    });

    var filteredModules = new ModuleCollection();

    var facets = new FacetCollection([], {
      filteredCollection: filteredModules,
      pageSize: 25,
      rawCollection: mods
    });
    facets.add(new ArrayFacetModel({
      filteredCollection: mods,
      key: 'semesterNames',
      label: 'Semesters',
      slug: 'semesters'
    }));
    facets.add(new ArrayFacetModel({
      filteredCollection: mods,
      key: 'Types',
      label: 'Types',
      slug: 'types'
    }));
    facets.add(_.map({
      Department: 'Faculty / Department',
      level: 'Level'
    }, function(label, key) {
      return {
        filteredCollection: mods,
        key: key,
        label: label,
        slug: slugify(label)
      };
    }));
    facets.add({
      filteredCollection: mods,
      key: 'ModuleCredit',
      label: 'Modular Credits (MCs)',
      slug: 'mcs',
      sortBy: function (filter) {
        return +filter.label;
      }
    });
    _.each([1, 2], function (semester) {
      facets.add(_.map(['Lecture Periods', 'Tutorial Periods'], function(label) {
        var currentLabel = 'Sem ' + semester + ' ' + label;
        return new ArrayFacetModel({
          filteredCollection: mods,
          key: label.replace(' ', '') + semester,
          label: currentLabel,
          slug: slugify(currentLabel)
        });
      }));
    });

    var that = this;

    var moduleFinderNamespace = config.namespaces.moduleFinder + ':';
    localforage.getItem(moduleFinderNamespace + 'filters', function (selectedFilters) {
      if (selectedFilters) {
        _.each(facets.models, function (facet) {
          var filters = selectedFilters[facet.get('label')];
          if (filters && filters.length) {
            _.each(facet.get('filters').models, function (filter) {
              if (filters.indexOf(filter.get('label')) > -1) {
                filter.select();
              }
            });
          }
        });
      }

      var facetsView = new FacetsView({
        collection: facets,
        threshold: 600
      });
      that.sidebarRegion.show(facetsView);

      var modulesFilterMetaView = new ModulesFilterMetaView({
        model: new Backbone.Model({
          selectedFilters: selectedFilters,
          resultsLength: facetsView.collection.rawFilteredCollection.length
        })
      });

      that.listenTo(facetsView, 'selectedFiltersChanged', function (selectedFilters) {
        modulesFilterMetaView.model.set('selectedFilters', selectedFilters);
        modulesFilterMetaView.model.set('resultsLength', facetsView.collection.rawFilteredCollection.length);
        modulesFilterMetaView.updateView();
      });

      that.modulesFilterMetaRegion.show(modulesFilterMetaView);
      that.modulesRegion.show(new ModulesListingView({collection: filteredModules}));
    });
  }
});
