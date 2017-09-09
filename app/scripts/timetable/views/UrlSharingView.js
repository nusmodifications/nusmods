'use strict';

var $ = require('jquery');
var Marionette = require('backbone.marionette');
var _ = require('underscore');
var Clipboard = require('clipboard');
var template = require('../templates/url_sharing.hbs');
require('qtip2');

module.exports = Marionette.ItemView.extend({
  template: template,

  ui: {
    copyToClipboard: '#copy-to-clipboard',
    copyToClipboardGroup: '.copy-to-clipboard-group',
    input: '#short-url',
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

  getShortURL: function () {
    if (!this.shortUrlPromise || this.shortUrlPromise.state() !== 'resolved') {
      var jqxhr = $.ajax('/short_url.php', {
        data: {
          url: location.href
        },
        dataType: 'json'
      });

      this.shortUrlPromise = jqxhr
        .then(_.bind(function (data) {
          this.ui.input.val(data.shorturl);
          if (Clipboard.isSupported()) {
            this.ui.copyToClipboardGroup.show();
          }
          return data.shorturl;
        }, this));
    }

    return this.shortUrlPromise;
  },

  modulesChanged: function () {
    this.shortUrlPromise = null;
    this.ui.input.val('');
    this.ui.copyToClipboardGroup.hide();
  },

  onShow: function () {
    this.listenTo(this.collection, 'add remove', this.modulesChanged);
    this.listenTo(this.collection.timetable, 'change', this.modulesChanged);

    var ui = this.ui;
    var copyTarget = this.ui.input.get(0);
    this.clip = new Clipboard(this.ui.copyToClipboard.get(0), {
      target: function() { return copyTarget; }
    });

    this.ui.copyToClipboardGroup.hide();

    this.clip.on('success', function () {
      ui.copyToClipboard.qtip('option', 'content.text', 'Copied!');
      window.getSelection().removeAllRanges();
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
