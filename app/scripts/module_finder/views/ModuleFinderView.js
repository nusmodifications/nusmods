define([
  'underscore',
  'backbone.marionette',
  'nusmods',
  'common/collections/ModuleCollection',
  './ModulesView',
  '../collections/FacetCollection',
  './FacetsView',
  'hbs!../templates/module_finder'
],

function(_, Marionette, NUSMods, ModuleCollection, ModulesView, FacetCollection,
         FacetsView, template) {
  'use strict';

  var ModuleFinderView = Marionette.LayoutView.extend({
    template: template,

    regions: {
      modulesRegion: '.modules'
    },

    onShow: function() {
      $('.exhibit-collectionView-header').on('click', '.add', function(evt) {
        var qtipContent;
        var itemID = $(this).data('code');
        if (this.collection.get(itemID)) {
          qtipContent = 'Already added!';
        } else {
          qtipContent = 'Added!';
          this.collection.add({
            id: itemID
          })
        }
        $(this).qtip({
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
        $('#content').toggleClass('col-md-12 col-md-9');
        $('#content').toggleClass('no-sidebar');
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
        var checked = $(this).prop('checked'),
            parent = $(this).parent();
        parent.find('input[type="checkbox"]').prop({
          checked: checked,
          indeterminate: false
        });
        updateAncestors(parent, checked);
      });

      NUSMods.getMods(_.bind(function (mods) {
        var filteredModules = new ModuleCollection();

        var filteredCodes = _.keys(mods);

        var begin = 0;

        _.each(mods, function(mod, code) {
          mod.code = code;
        });

        _.each(filteredCodes.slice(begin, begin + 10), function(code) {
          filteredModules.add(mods[code]);
        });

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
        facets.add(_.map(['department', 'mc'], function(key) {
          return {
            filteredCollection: mods,
            key: key
          };
        }));

        var facetsView = (new FacetsView({collection: facets})).render();

        this.modulesRegion.show(new ModulesView({collection: filteredModules}));
      }, this));
    }
  });

  return ModuleFinderView;
});
