define(['underscore', 'app', 'backbone', 'backbone.marionette', 'nusmods',
    'hbs!../templates/select', 'hbs!../templates/select_result','select2'],
  function(_, App, Backbone, Marionette, NUSMods, template, selectResultTemplate) {
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

      onMouseup: function (event) {
        event.stopPropagation();
        var button = $(event.currentTarget);
        var add = button.hasClass('add');
        App.request((add ? 'add' : 'remove') + 'Module', button.data('code'));
        button
          .toggleClass('add remove')
          .prop('title', (add ? 'Add to' : 'Remove from') + 'Timetable')
          .children().toggleClass('fa-plus fa-times');
      },

      onSelect2Open: function () {
        $('#select2-drop').on('mouseup', '.btn', this.onMouseup);
      },

      onSelect2Selecting: function(event) {
        event.preventDefault();
        Backbone.history.navigate('modules/' + event.val, {trigger: true});
        this.ui.input.select2('close');
        this.$(':focus').blur();
      },

      onShow: function () {
        _.bindAll(this, 'onMouseup', 'onSelect2Open');

        var PAGE_SIZE = 50;
        this.ui.input.select2({
          multiple: true,
          formatResult: function (object) {
            return selectResultTemplate(object);
          },
          query: function (options) {
            codesAndTitlesPromise.then(function () {
              var i,
                results = [],
                pushResult = function (i) {
                  return results.push({
                    id: codes[i],
                    selected: App.request('isModuleSelected', codes[i]),
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
