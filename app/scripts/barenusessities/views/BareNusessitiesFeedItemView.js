'use strict';

var $ = require('jquery');
var Marionette = require('backbone.marionette');
var template = require('../templates/barenusessities_feed_item.hbs');

module.exports = Marionette.ItemView.extend({
  tagName: 'div',
  className: 'nm-bn-post js-nm-bn-post col-md-12',
  template: template,
  events: {
    'click .js-nm-bn-post-see-more': 'seeMorePost',
    'click .js-nm-bn-show-comments': 'showComments',
    'click .js-nm-bn-share-fb': 'sharePostFacebook',
    'click .js-nm-bn-share-tw': 'sharePostTwitter'
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
  },
  sharePostFacebook : function (event) {
    window.open('http://www.facebook.com/sharer.php?u=' +
      encodeURIComponent(this.model.get('postUrl')), '', 'width=660,height=350');
  }
});
