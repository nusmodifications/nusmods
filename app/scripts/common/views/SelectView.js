define(['underscore', 'backbone', 'backbone.marionette', 'nusmods',
    'hbs!../templates/select', 'hbs!../templates/select_result','select2'],
  function(_, Backbone, Marionette, NUSMods, template, selectResultTemplate) {
    'use strict';

    var codes, titles, modsLength;
    var codesAndTitlesPromise = NUSMods.getCodesAndTitles().then(function (data) {
      codes = _.keys(data);
      titles = _.values(data);
      modsLength = codes.length;
    });

    return Marionette.ItemView.extend({
      className: 'form-group',
      template: template,

      events: {
        'select2-selecting': 'onSelect2Selecting'
      },
      
      ui: {
        'input': 'input'
      },

      onAdd: function (event) {
        var id = $(event.currentTarget).data('code');
        NUSMods.getMod(id, _.bind(function (mod) {
          mod.code = id;
          this.collection.add(mod);
        }, this));
        this.ui.input.select2('focus');
      },

      onRemove: function (event) {
        var id = $(event.currentTarget).data('code');
        this.collection.remove(this.collection.get(id));
        this.ui.input.select2('focus');
      },

      onSelect2Open: function () {
        $('#select2-drop')
          .on('mouseup', '.add', this.onAdd)
          .on('mouseup', '.remove', this.onRemove);
      },

      onSelect2Selecting: function(event) {
        event.preventDefault();
        Backbone.history.navigate('modules/' + event.val, {trigger: true});
        this.ui.input.select2('focus');
      },

      onShow: function () {
        _.bindAll(this, 'onAdd', 'onRemove', 'onSelect2Open');

        var PAGE_SIZE = 50;
        var selectedModules = this.collection;
        this.ui.input.select2({
          multiple: true,
          formatResult: function (object) {
            return selectResultTemplate(object);
          },
          query: function (options) {
            codesAndTitlesPromise.done(function () {
              var i,
                results = [],
                pushResult = function (i) {
                  return results.push({
                    id: codes[i],
                    selected: selectedModules.get(codes[i]),
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
            });
          }
        });

        this.ui.input.one('select2-open', this.onSelect2Open);
      }
    });
  });
