'use strict';

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/barenus.hbs');
var $ = require('jquery');
var BareNusFeedView = require('./BareNusFeedView');
var _ = require('underscore');
var moment = require('moment');
require('../../common/utils/notequals');

module.exports = Marionette.LayoutView.extend({
  initialize: function () {
    this.model = new Backbone.Model();
    this.feedLoadedOnce = false;
    this.model.set('feedUrl', '/barenus.php');
  },
  template: template,
  regions: {
    feedRegion: '#nm-bn-feed-region'
  },
  onShow: function () {
    this.feedItemsCollection = new Backbone.Collection();
    this.feedView = new BareNusFeedView({collection: this.feedItemsCollection});
    this.feedRegion.show(this.feedView);
    this.loadPosts();
  },
  events: {
    'click .js-nm-bn-more-posts': 'loadPosts'
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

        item.postId = item.id.split('_')[1];
        item.postUrl = 'https://www.facebook.com/bareNUS/posts/' + item.postId;

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
  }
});
