define(['underscore', 'backbone', 'nusmods', 'select2'],
  function(_, Backbone, NUSMods) {
    'use strict';

    var codes = _.keys(timetableData.mods);
    var titles = _.pluck(_.values(timetableData.mods), 'title');
    var modsLength = codes.length;

    return Backbone.View.extend({
      tagName: 'input',
      attributes: {
        type: 'hidden'
      },

      events: {
        change: 'change'
      },

      change: function(evt) {
        if (evt.added) {
          NUSMods.getMod(evt.added.id, _.bind(function (mod) {
            mod.id = evt.added.id;
            this.collection.add(mod);
          }, this));
        } else if (evt.removed) {
          this.collection.remove(this.collection.get(evt.removed.id));
        }
      },

      initialize: function () {
        this.listenTo(this.collection, 'add remove', this.render);
      },

      onShow: function () {
        var PAGE_SIZE = 50;
        this.$el.select2({
          width: '100%',
          placeholder: 'Type code/title to add mods',
          multiple: true,
          initSelection: function (el, callback) {
            callback(_.map(el.val().split(','), function (code) {
              return {
                id: code,
                text: code + ' ' + timetableData.mods[code].title
              };
            }));
          },
          query: function (options) {
            var i,
              results = [],
              pushResult = function (i) {
                return results.push({
                  id: codes[i],
                  text: codes[i] + ' ' + titles[i]
                });
              };
            if (options.term) {
              var re = new RegExp(options.term, 'i');
              for (i = options.context || 0; i < modsLength; i++) {
                if (codes[i].search(re) !== -1 || titles[i].search(re) !== -1) {
                  if (pushResult(i) === PAGE_SIZE) {
                    i++;
                    break;
                  }
                }
              }
            } else {
              for (i = (options.page - 1) * PAGE_SIZE; i < options.page * PAGE_SIZE; i++) {
                pushResult(i);
              }
            }
            options.callback({
              context: i,
              more: i < modsLength,
              results: results
            });
          }
        });
      },

      render: function() {
        this.$el.val(this.collection.pluck('id')).trigger('change');
      }
    });
  });
