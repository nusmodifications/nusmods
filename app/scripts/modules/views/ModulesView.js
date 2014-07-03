define([
  'underscore',
  'backbone.marionette',
  'nusmods',
  'common/collections/ModuleCollection',
  './ModulesListingView',
  '../collections/FacetCollection',
  '../models/ArrayFacetModel',
  './FacetsView',
  'hbs!../templates/modules'
],

function(_, Marionette, NUSMods, ModuleCollection, ModulesListingView,
         FacetCollection, ArrayFacetModel, FacetsView, template) {
  'use strict';

  return Marionette.LayoutView.extend({
    template: template,

    regions: {
      modulesRegion: '.modules'
    },

    ui: {
      content: '#content',
      sidebar: '#sidebar',
      sidebarToggle: '#sidebar-toggle',
      sidebarToggleIcon: '#sidebar-toggle i'
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

    onShow: function() {
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

      NUSMods.getMods().then(_.bind(function (mods) {
        var typeFriendlyName = {
          CFM: 'Cross-Faculty',
          GEM: 'GEM',
          Module: 'Faculty',
          SSM: 'Singapore Studies',
          UEM: 'Breadth / UE'
        };
        _.each(mods, function (mod) {
          mod.level = mod.ModuleCode[mod.ModuleCode.search(/\d/)] * 1000;
          if (mod.Types) {
            mod.Types = _.map(mod.Types, function (type) {
              return typeFriendlyName[type] || type;
            });
          } else {
            mod.Types = ['Not in CORS'];
          }
        });

        var filteredModules = new ModuleCollection();

        var facets = new FacetCollection([], {
          filteredCollection: filteredModules,
          pageSize: 10,
          rawCollection: mods
        });
        facets.add(_.map(['Department', 'ModuleCredit', 'level'], function(key) {
          return {
            filteredCollection: mods,
            key: key
          };
        }));
        facets.add(new ArrayFacetModel({
          filteredCollection: mods,
          key: 'Types'
        }));

        (new FacetsView({
          collection: facets,
          threshold: 100
        })).render();

        this.modulesRegion.show(new ModulesListingView({collection: filteredModules}));
      }, this));
    }
  });
});
