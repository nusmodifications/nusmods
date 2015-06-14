'use strict';

var $ = require('jquery');
var Marionette = require('backbone.marionette');
var template = require('../templates/news_feed_item.hbs');

module.exports = Marionette.ItemView.extend({
  initialize: function () {
    this.model.set('commentsShown', false);
  },
  tagName: 'div',
  className: 'nm-news-post js-nm-news-post col-md-12',
  template: template,
  events: {
    'click .js-nm-news-post-see-more': 'seeMorePost',
    'click .js-nm-news-toggle-comments': 'toggleComments'
  },
  seeMorePost: function (event) {
    var $postMessage = $(event.target).closest('.nm-news-post-message-container');
    $postMessage.addClass('nm-news-show-message');
    $postMessage.find('.nm-news-post-full-message').addClass('animated fadeIn');
  },
  toggleComments: function (event) {
    var $post = $(event.target).closest('.js-nm-news-post');
    var $comments = $post.find('.js-nm-news-comments');
    var count = this.model.get('comments').data.length;
    var suffix = count > 1 ? 's' : '';
    var commentsShown = this.model.get('commentsShown');
    if (commentsShown) {
      // $comments.addClass('animated fadeOut');
      // console.log('lola')
      $comments.slideUp();
      // var duration = parseInt($comments.css('animation-duration'));
      // duration = isNaN(duration) ? 800 : duration * 1000 * 0.8;
      // setTimeout(function () {
      //   $post.removeClass('nm-news-show-comments');
      // }, duration);
      $(event.target).text('Show ' + count + ' Comment' + suffix);
    } else {
      $comments.slideDown();
      // $comments.removeClass('animated fadeOut');
      // $post.addClass('nm-news-show-comments');
      // $comments.addClass('animated fadeIn');
      $(event.target).text('Hide Comment' + suffix);
    }
    this.model.set('commentsShown', !commentsShown);
  }
});
