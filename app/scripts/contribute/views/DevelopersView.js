'use strict';

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/developers.hbs');
var item_template = require('../templates/developers_item.hbs')
var $ = require('jquery');
var _ = require('underscore');

var DeveloperItemView = Marionette.ItemView.extend({
  tagName: 'div',
  className: 'nm-ct-dev-item col-md-4 col-sm-4 col-xs-6',
  template: item_template
});

var DevelopersListView = Marionette.CollectionView.extend({
  tagName: 'div',
  className: 'nm-ct-devs',
  childView: DeveloperItemView
});

module.exports = Marionette.LayoutView.extend({
  initialize: function () {
    this.model = new Backbone.Model();
    this.model.set('devsUrl', 'https://api.github.com/repos/NUSModifications/NUSMods/contributors');
  },
  template: template,
  regions: {
    developersRegion: '.nm-ct-devs-container'
  },
  onShow: function () {
    this.developersCollection = new Backbone.Collection();
    this.developersListView = new DevelopersListView({collection: this.developersCollection});
    var _this = this;
    $.get(_this.model.get('devsUrl'), function (items) {
      _this.developersCollection.add(items);
    });
    $('.nm-ct-devs-container').addClass('animated fadeIn');
    this.developersRegion.show(this.developersListView);
  },
});