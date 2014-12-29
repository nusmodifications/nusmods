'use strict';

var $ = require('jquery');
var Marionette = require('backbone.marionette');
var template = require('../templates/barenus_feed_item.hbs');

module.exports = Marionette.ItemView.extend({
  initialize: function () {
    this.model.set('commentsShown', false);
  },
  tagName: 'div',
  className: 'nm-bn-post js-nm-bn-post col-md-12',
  template: template,
  events: {
    'click .js-nm-bn-post-see-more': 'seeMorePost',
    'click .js-nm-bn-toggle-comments': 'toggleComments'
  },
  seeMorePost: function (event) {
    var $postMessage = $(event.target).closest('.nm-bn-post-message-container');
    $postMessage.addClass('nm-bn-show-message');
    $postMessage.find('.nm-bn-post-full-message').addClass('animated fadeIn');
  },
  toggleComments: function (event) {
    var $post = $(event.target).closest('.js-nm-bn-post');
    var $comments = $post.find('.js-nm-bn-comments');
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
      //   $post.removeClass('nm-bn-show-comments');
      // }, duration);
      $(event.target).text('Show ' + count + ' Comment' + suffix);
    } else {
      $comments.slideDown();
      // $comments.removeClass('animated fadeOut');
      // $post.addClass('nm-bn-show-comments');
      // $comments.addClass('animated fadeIn');
      $(event.target).text('Hide Comment' + suffix);
    }
    this.model.set('commentsShown', !commentsShown);
  }
});
