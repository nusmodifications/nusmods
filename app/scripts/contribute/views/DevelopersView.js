'use strict';

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/developers.hbs');
var item_template = require('../templates/developers_item.hbs')
var $ = require('jquery');
var _ = require('underscore');
require('../../common/utils/notequals');

var DeveloperItemView = Marionette.ItemView.extend({
  tagName: 'div',
  className: 'nm-ct-dev-item col-md-3 col-sm-4 col-xs-6',
  template: item_template
});

var DevelopersListView = Marionette.CollectionView.extend({
  tagName: 'div',
  className: 'nm-ct-devs',
  childView: DeveloperItemView
});

var DEVELOPERS_URL = 'https://api.github.com/repos/NUSModifications/NUSMods/contributors';

module.exports = Marionette.LayoutView.extend({
  initialize: function () {
    this.model = new Backbone.Model();
  },
  template: template,
  regions: {
    developersRegion: '.nm-ct-devs-container'
  },
  onShow: function () {
    this.developersCollection = new Backbone.Collection();
    this.developersListView = new DevelopersListView({collection: this.developersCollection});
    var _this = this;
    $.get(DEVELOPERS_URL, function (items) {
      _this.developersCollection.add(items);
    });

    $('.nm-ct-devs-container').addClass('animated fadeIn');
    this.developersRegion.show(this.developersListView);
  },
});