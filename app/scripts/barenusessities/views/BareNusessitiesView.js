'use strict';

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/barenusessities.hbs');
var $ = require('jquery');
var BareNusessitiesFeedView = require('./BareNusessitiesFeedView');
var _ = require('underscore');
var moment = require('moment');

module.exports = Marionette.LayoutView.extend({
  initialize: function () {
    this.model = new Backbone.Model();
    this.feedLoadedOnce = false;
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
          item.message = _.escape(item.message);
          if (words.length > MESSAGE_LIMIT + 10) {
            item.shortMessage = words.splice(0, MESSAGE_LIMIT).join(' ');
            item.shortMessage = item.shortMessage.replace(/\n/g, '<br>');
            item.fullMessage = words.join(' ');
            item.fullMessage = item.fullMessage.replace(/\n/g, '<br>');
          } else {
            item.message = item.message.replace(/\n/g, '<br>\n');
          }
        }
        item.month = moment(item.created_time).format('MMM');
        item.date = moment(item.created_time).format('DD');
        if (item.comments) {
          _.each(item.comments.data, function (comment) {
            comment.message = _.escape(comment.message);
            comment.date = moment(comment.created_time).fromNow();
            if (comment.comments) {
              _.each(comment.comments.data, function (comment) {
                comment.message = _.escape(comment.message);
                comment.date = moment(comment.created_time).fromNow();
              });
            }
          });
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
      if (!this.feedLoadedOnce) {
        $('.nm-bn-feed-container').addClass('animated fadeIn');
        this.feedLoadedOnce = true;
      }
    });
  },
  seeMorePost: function (event) {
    var $postMessage = $(event.target).closest('.nm-bn-post-message-container');
    $postMessage.addClass('nm-bn-show-message');
    $postMessage.find('.nm-bn-post-full-message').addClass('animated fadeIn');
  },
  showComments: function (event) {
    var $post = $(event.target).closest('.js-nm-bn-post');
    $post.addClass('nm-bn-show-comments');
    $post.find('.js-nm-bn-comments').addClass('animated fadeIn');
  }
});
