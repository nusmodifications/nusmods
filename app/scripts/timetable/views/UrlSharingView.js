'use strict';

var $ = require('jquery');
var Marionette = require('backbone.marionette');
var ZeroClipboard = require('zeroclipboard');
var _ = require('underscore');
var template = require('../templates/url_sharing.hbs');
require('qTip2');

module.exports = Marionette.ItemView.extend({
  template: template,

  ui: {
    copyToClipboard: '#copy-to-clipboard',
    input: 'input',
    shareEmail: '#share-email',
    shareFacebook: '#share-facebook',
    shareTwitter: '#share-twitter'
  },

  events: {
    'cut keydown @ui.input': function (event) {
      // Prevent default actions on cut and keydown to simulate readOnly
      // behavior on input, as the readOnly attribute does not allow selection
      // on some mobile platforms.
      event.preventDefault();
    },
    'focus @ui.input': function () {
      this.getShortURL().then(_.bind(function () {
        // shortURLInput.select() does not work on iOS
        this.ui.input[0].setSelectionRange(0, 99);
      }, this));
    },
    'mouseup @ui.input': function (event) {
      // Prevent the mouseup event from unselecting the selection
      event.preventDefault();
    },
    'mousedown @ui.copyToClipboard': function () {
      // Have to get short URL synchronously in order to maintain the
      // temporarily elevated permissions granted by the user's click event:
      // https://github.com/zeroclipboard/zeroclipboard/blob/master/docs/instructions.md#synchronicity-required-during-copy
      this.getShortURL(true).then(_.bind(function (shortURL) {
        this.clip.setText(shortURL);
      }, this));
    },
    'click @ui.shareEmail': function () {
      this.getShortURL().then(function (shortURL) {
        window.location.href = 'mailto:?subject=My%20NUSMods.com%20Timetable&' +
          'body=' + encodeURIComponent(shortURL);
      });
    },
    'click @ui.shareFacebook': function () {
      this.getShortURL().then(function (shortURL) {
        window.open('http://www.facebook.com/sharer.php?u=' +
          encodeURIComponent(shortURL), '', 'width=660,height=350');
      });
    },
    'click @ui.shareTwitter': function () {
      this.getShortURL().then(function (shortURL) {
        window.open('http://twitter.com/intent/tweet?url=' +
          encodeURIComponent(shortURL), '', 'width=660,height=350');
      });
    }
  },

  getShortURL: function (sync) {
    if (!this.shortUrlPromise ||
      (sync && this.shortUrlPromise.state() !== 'resolved')) {
      var jqxhr = $.ajax('/short_url.php', {
        async: !sync,
        data: {
          url: location.href
        },
        dataType: 'json'
      });
      this.shortUrlPromise = (sync ? $.when(jqxhr.responseJSON) : jqxhr)
        .then(_.bind(function (data) {
          this.ui.input.val(data.shorturl);
          return data.shorturl;
        }, this));
    }
    return this.shortUrlPromise;
  },

  initialize: function () {
    ZeroClipboard.config({
      swfPath: '/ZeroClipboard.swf'
    });
  },

  modulesChanged: function () {
    this.shortUrlPromise = null;
    this.ui.input.val('');
  },

  onShow: function () {
    this.listenTo(this.collection, 'add remove', this.modulesChanged);
    this.listenTo(this.collection.timetable, 'change', this.modulesChanged);

    var ui = this.ui;

    this.clip = new ZeroClipboard(ui.copyToClipboard);
    this.clip.on('aftercopy', function () {
      ui.copyToClipboard.qtip('option', 'content.text', 'Copied!');
    });

    var CLIPBOARD_TOOLTIP = 'Copy to Clipboard';
    ui.copyToClipboard.qtip({
      content: CLIPBOARD_TOOLTIP,
      events: {
        hidden: function () {
          // Set to original text when hidden as text may have been changed.
          ui.copyToClipboard.qtip('option', 'content.text', CLIPBOARD_TOOLTIP);
        }
      }
    });

    _.each(['Email', 'Facebook', 'Twitter'], function (medium) {
      ui['share' + medium].qtip({content: 'Share via ' + medium});
    });
  }
});
