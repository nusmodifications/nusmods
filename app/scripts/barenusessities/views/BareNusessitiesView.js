'use strict';

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/barenusessities.hbs');
var $ = require('jquery');
var BareNusessitiesFeedView = require('./BareNusessitiesFeedView');

module.exports = Marionette.LayoutView.extend({
  initialize: function () {
    this.model = new Backbone.Model();
    this.model.set('feedUrl', 'http://0.0.0.0/bare/barenusessities.php');
  },
  template: template,
  regions: {
    feedRegion: '#nm-bn-feed-region'
  },
  onShow: function () {
    this.feedItemsCollection = new Backbone.Collection();
    this.feedView = new BareNusessitiesFeedView({collection: this.feedItemsCollection});
    this.feedRegion.show(this.feedView);
    this.loadPosts();
  },
  events: {
    'click .js-nm-bn-more-posts': 'loadPosts'
  },
  loadPosts: function () {
    var that = this;
    $.get(that.model.get('feedUrl'), function (data) {
      console.log(data);
      that.feedItemsCollection.add(data.data);
      if (data.paging.next) {
        that.model.set('feedUrl', data.paging.next);
      } else {
        that.model.set('feedUrl', null);
      }
    });
  }
});
