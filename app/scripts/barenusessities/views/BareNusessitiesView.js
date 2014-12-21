'use strict';

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/barenusessities.hbs');
var $ = require('jquery');
var BareNusessitiesFeedView = require('./BareNusessitiesFeedView');
var _ = require('underscore');

module.exports = Marionette.LayoutView.extend({
  initialize: function () {
    this.model = new Backbone.Model();
    this.model.set('feedUrl', '/barenusessities.php');
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
      var feedData = data.data;
      _.each(feedData, function (item) {
        if (item.message) {
          item.message = item.message.replace(/\n/g, '<br>\n');
        }
      });
      that.feedItemsCollection.add(_.filter(feedData, function (item) {
        return !!item.object_id;
      }));
      if (data.paging.next) {
        that.model.set('feedUrl', data.paging.next);
      } else {
        that.model.set('feedUrl', null);
      }
    });
  }
});
