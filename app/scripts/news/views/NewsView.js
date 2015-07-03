'use strict';

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/news.hbs');
var $ = require('jquery');
var NewsFeedView = require('./NewsFeedView');
var _ = require('underscore');
var moment = require('moment');
var newsPagesList = require('../newsPagesList.json');

require('../../common/utils/notequals');

module.exports = Marionette.LayoutView.extend({
  initialize: function (data) {
    var that = this;
    this.feedLoadedOnce = false;
    this.model = new Backbone.Model();
    this.model.set('fbPageId', data.fbPageId);
    this.model.set('feedUrl', 'https://nusmods.com/news.php?fbPageId=' + this.model.get('fbPageId'));
    // this.model.set('feedUrl', '/news.php?fbPageId=' + this.model.get('fbPageId'));
    _.each(newsPagesList, function (item) {
      item.url = '/news/' + item.id;
      if (item.id === that.model.get('fbPageId')) {
        that.model.set('activePage', item);  
        item.active = true;
      } else {
        item.active = false;
      }
    });
    this.model.set('newsPagesList', newsPagesList);
  },
  template: template,
  regions: {
    feedRegion: '#nm-news-feed-region'
  },
  onShow: function () {
    this.feedItemsCollection = new Backbone.Collection();
    this.feedView = new NewsFeedView({collection: this.feedItemsCollection});
    this.feedRegion.show(this.feedView);
    this.loadPosts();
    if (window.FB) {
      FB.XFBML.parse();
    } else {
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v2.3&appId=1524196174461544";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    }
  },
  events: {
    'click .js-nm-news-more-posts': 'loadPosts'
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
        item.postUrl = 'https://www.facebook.com/' + that.model.get('fbPageId') 
                        + '/posts/' + item.postId;

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

      that.feedItemsCollection.add(feedData);

      if (data.paging.next) {
        that.model.set('feedUrl', data.paging.next);
      } else {
        that.model.set('feedUrl', null);
      }
      if (!this.feedLoadedOnce) {
        $('.nm-news-feed-container').addClass('animated fadeIn');
        this.feedLoadedOnce = true;
      }
    });
  }
});
