'use strict';

var _ = require('underscore');
var $ = require('jquery');
var App = require('../../app');
var Marionette = require('backbone.marionette');
var template = require('../templates/friends_selected_list_item.hbs');

module.exports = Marionette.LayoutView.extend({
  tagName: 'span',
  className: 'badge',
  template: template,
  events: {
    'click .js-nm-friends-deselect': 'deselectFriend',
  },
  onShow: function () {  
    
  },
  deselectFriend: function (e) {
    var selected = this.model.get('selected');
    this.model.set('selected', !selected);
  }
});
