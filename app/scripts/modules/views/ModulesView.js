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
var LoadingView = require('../../common/views/LoadingView');

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

  events: {
    'click .js-nm-clear-filters': function () {
      this.facetsView.clearFilters();
    }
  },

  onShow: function () {
    $('.arrow-down, .arrow-right').click(function () {
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
      GEM: 'GEM (Cohort ≤ 2014)',
      GEM2015: 'GEM (Cohort ≥ 2015)',
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

        var workloads = [];

        if (mod.Workload) {
         workloads =  _.map(mod.Workload.split('-'), function(workload) {
            var workloadInt = parseInt(workload);
            return _.isNumber(workloadInt) && !_.isNaN(workloadInt) ? workloadInt : 'Others';
          });
        }

        if (workloads.length === 5) {
          mod.lectureHours = workloads[0];
          mod.tutorialHours = workloads[1];
          mod.labHours = workloads[2];
          mod.projectHours = workloads[3];
          mod.preparationHours = workloads[4];
        }
        else {
          mod.lectureHours = mod.tutorialHours = mod.labHours
              = mod.projectHours = mod.preparationHours = 'Others';
        }
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
    facets.add({
      filteredCollection: mods,
      key: 'lectureHours',
      label: 'Weekly Lecture Hours',
      slug: 'lecture-hours',
      sortBy: function(filter) {
        return +filter;
      }
    });
    facets.add({
      filteredCollection: mods,
      key: 'tutorialHours',
      label: 'Weekly Tutorial Hours',
      slug: 'tutorial-hours',
      sortBy: function(filter) {
        return +filter;
      }
    });
    facets.add({
      filteredCollection: mods,
      key: 'labHours',
      label: 'Weekly Lab Hours',
      slug: 'lab-hours',
      sortBy: function(filter) {
        return +filter;
      }
    });
    facets.add({
      filteredCollection: mods,
      key: 'projectHours',
      label: 'Weekly Project Hours',
      slug: 'project-hours',
      sortBy: function(filter) {
        return +filter;
      }
    });
    facets.add({
      filteredCollection: mods,
      key: 'preparationHours',
      label: 'Weekly Preparation Hours',
      slug: 'preparation-hours',
      sortBy: function(filter) {
        return +filter;
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

    this.modulesRegion.show(new LoadingView());

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

      that.facetsView = new FacetsView({
        collection: facets,
        threshold: 600
      });
      that.sidebarRegion.show(that.facetsView);

      that.modulesFilterMetaView = new ModulesFilterMetaView({
        model: new Backbone.Model({
          //Needed to allow the view to deselect filters
          collection: facets,
          selectedFilters: selectedFilters,
          resultsLength: that.facetsView.collection.rawFilteredCollection.length
        })
      });

      that.listenTo(that.facetsView, 'selectedFiltersChanged', function (selectedFilters) {
        that.modulesFilterMetaView.updateView(selectedFilters, that.facetsView.collection.rawFilteredCollection.length);
      });

      that.modulesFilterMetaRegion.show(that.modulesFilterMetaView);
      that.modulesRegion.show(new ModulesListingView({collection: filteredModules}));
    });
  }
});
