'use strict';

var $ = require('jquery');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/apps.hbs');
var AppsListView = require('./AppsListView');

var APPS_LIST_URL = 'https://nusmodifications.github.io/nusmods-apps/apps.json';

module.exports = Marionette.LayoutView.extend({
  template: template,
  regions: {
    appsListRegion: '.nm-news-apps-container'
  },
  onShow: function () {
    var that = this;
    $.ajax({
      type: 'GET',
      contentType: 'application/json',
      url: APPS_LIST_URL,
      dataType: 'jsonp',
      jsonpCallback: 'callback',
      success: function (data) {
        that.appsListRegion.show(new AppsListView({
          collection: new Backbone.Collection(data)
        }));
      }
    });
  }
});
