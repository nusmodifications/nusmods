define(['backbone.marionette', 'hbs!../templates/selected_mods'],
function(Marionette, template) {
  'use strict';

  return Marionette.ItemView.extend({
    template: template,

    events: {
      'click #clear-all': function () {
        if (confirm('Are you sure you want to clear all selected modules?')) {
          this.collection.remove(this.collection.models);
        }
        return false;
      }
    },

    initialize: function () {
      this.listenTo(this.collection, 'add remove', this.render);
    },

    onRender: function() {
      var length = this.collection.length;
      if (length) {
        this.$('#select2-header').text('Selected ' + length + ' Module' +
            (length === 1 ? '' : 's'));
        this.$('#clear-all').removeClass('hidden');
      } else {
        this.$('#select2-header').text('Select Modules for Timetable ');
        this.$('#clear-all').addClass('hidden');
      }
      this.$('#short-url').val('').blur();
    }
  });
});
