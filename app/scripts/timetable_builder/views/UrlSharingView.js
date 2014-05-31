define(['backbone', 'zeroclipboard'], function(Backbone, ZeroClipboard) {
  'use strict';

  return Backbone.View.extend({
    el: '#share-container',

    initialize: function() {
      ZeroClipboard.config({
        swfPath: 'bower_components/ZeroClipboard/dist/ZeroClipboard.swf'
      });

      // For ZeroClipboard versions >= v1.3.x and < v2.x
      ZeroClipboard.config({ moviePath: ZeroClipboard.config('swfPath') });

      var copyToClipboard = $('#copy-to-clipboard'),
          clip = new ZeroClipboard(copyToClipboard),
          shortURLInput = $('#short-url');

      function getShortURL(callback) {
        var shortURL = shortURLInput.val();
        if (shortURL) {
          callback(shortURL);
        } else {
          $.getJSON('short_url.php', {
            url: location.href
          }, function(data) {
            shortURL = data.shorturl;
            if (shortURL) {
              shortURLInput.val(shortURL);
              callback(shortURL);
            }
          });
        }
      }

      shortURLInput.focus(function() {
        getShortURL(function() {});
      });

      copyToClipboard.qtip({
        content: 'Copy to Clipboard',
        events: {
          hidden: function() {
            copyToClipboard.qtip('option', 'content.text', 'Copy to Clipboard');
          }
        }
      });

      clip.on('mouseover', function() {
        getShortURL(function(shortURL) {
          clip.setText(shortURL);
        });
        copyToClipboard.qtip('show');
      });
      clip.on('mouseout', function() {
        copyToClipboard.qtip('hide');
      });
      clip.on('complete', function() {
        copyToClipboard.qtip('option', 'content.text', 'Copied!');
      });

      $('#share-email').click(function() {
        getShortURL(function(shortURL) {
          window.location.href = 'mailto:?subject=My%20NUSMods.com%20Timetable&' +
              'body=' + encodeURIComponent(shortURL);
        });
      }).qtip({
            content: 'Share via Email'
          });

      $('#share-facebook').click(function() {
        getShortURL(function(shortURL) {
          window.open('http://www.facebook.com/sharer.php?u=' +
              encodeURIComponent(shortURL), '', 'width=660,height=350');
        });
      }).qtip({
            content: 'Share via Facebook'
          });

      $('#share-twitter').click(function() {
        getShortURL(function(shortURL) {
          window.open('http://twitter.com/intent/tweet?url=' +
              encodeURIComponent(shortURL), '', 'width=660,height=350');
        });
      }).qtip({
            content: 'Share via Twitter'
          });
    }
  });
});
