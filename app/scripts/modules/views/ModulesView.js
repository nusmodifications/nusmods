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

    onShow: function() {
      $('.exhibit-collectionView-header').on('click', '.add', function(evt) {
        var qtipContent;
        var $this = $(this);
        var itemID = $this.data('code');
        if (this.collection.get(itemID)) {
          qtipContent = 'Already added!';
        } else {
          qtipContent = 'Added!';
          this.collection.add({
            id: itemID
          })
        }
        $this.qtip({
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
      });

      var sidebarShown = true;
      $('#sidebar-toggle').qtip({
        content: 'Hide Sidebar',
        position: {
          my: 'left center',
          at: 'top right'
        }
      }).click(function() {
        var qtipContent;
        $('#sidebar-toggle i').toggleClass('fa-chevron-left fa-chevron-right');
        $('#sidebar').animate({
          width: 'toggle'
        }, 100);
        var $content = $('#content');
        $content.toggleClass('col-md-12 col-md-9');
        $content.toggleClass('no-sidebar');
        sidebarShown = !sidebarShown;
        qtipContent = sidebarShown ? 'Hide Sidebar' : 'Show Sidebar';
        $(this).qtip('option', 'content.text', qtipContent);
        return false;
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
          if (mod.Types) {
            mod.Types = _.map(mod.Types, function (type) {
              return typeFriendlyName[type];
            });
          } else {
            mod.Types = ['Not in CORS'];
          }
        });

        var filteredModules = new ModuleCollection();

        var filteredCodes = _.pluck(mods, 'ModuleCode');

        var begin = 0;

        filteredModules.add(mods.slice(begin, begin + 10));

//      $(window).scroll(function() {
//        if ($(window).scrollTop() + $(window).height() + 100 >= $(document).height()) {
//          begin += 10;
//          _.each(filteredCodes.slice(begin, begin + 10), function(code) {
//            filteredModules.add(_.extend(mods[code], { code: code }));
//          });
//        }
//      });

        var facets = new FacetCollection([], {
          filteredCollection: filteredModules
        });
        facets.add(_.map(['Department', 'ModuleCredit'], function(key) {
          return {
            filteredCollection: mods,
            key: key
          };
        }));
        facets.add(new ArrayFacetModel({
          filteredCollection: mods,
          key: 'Types'
        }));

        var facetsView = (new FacetsView({collection: facets})).render();

        this.modulesRegion.show(new ModulesListingView({collection: filteredModules}));
      }, this));
    }
  });
});
