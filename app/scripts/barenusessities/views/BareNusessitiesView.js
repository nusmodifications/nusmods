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
    this.model.set('feedUrl', 'http://localhost/bare/barenusessities.php');
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
    'click .js-nm-bn-more-posts': 'loadPosts',
    'click .js-nm-bn-post-see-more': 'seeMorePost',
    'click .js-nm-bn-show-comments': 'showComments'
  },
  loadPosts: function () {
    var that = this;
    var MESSAGE_LIMIT = 50;
    $.get(that.model.get('feedUrl'), function (data) {
      var feedData = data.data;
      _.each(feedData, function (item) {
        if (!!item.message) {
          var words = item.message.split(' ');
          if (words.length > 50) {
            item.shortMessage = words.splice(0, MESSAGE_LIMIT).join(' ');
            item.shortMessage = item.shortMessage.replace(/\n/g, '<br>\n');
          }
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
  },
  seeMorePost: function (event) {
    $(event.target).closest('.nm-bn-post-caption').addClass('nm-bn-show-message');
  },
  showComments: function (event) {
    var $post = $(event.target).closest('.js-nm-bn-post');
    $post.addClass('nm-bn-show-comments');
    $post.find('.js-nm-bn-comments').addClass('animated fadeIn');
  }
});
