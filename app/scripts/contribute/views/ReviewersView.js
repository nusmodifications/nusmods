'use strict';

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var template = require('../templates/reviewers.hbs');
// var itemTemplate = require('../templates/reviewers_item.hbs');

// var ReviewersItemView = Marionette.ItemView.extend({
//   tagName: 'div',
//   className: 'nm-ct-rev-item col-md-3 col-sm-3 col-xs-4',
//   template: itemTemplate
// });

// var ReviewersListView = Marionette.CollectionView.extend({
//   tagName: 'div',
//   className: 'nm-ct-revs',
//   childView: ReviewersItemView
// });

module.exports = Marionette.LayoutView.extend({
  initialize: function () {
    this.model = new Backbone.Model();
    // temporary using developer list lol
    // this.model.set('revsUrl', 'https://api.github.com/repos/NUSModifications/NUSMods/contributors');
  },
  template: template,
  regions: {
    reviewersRegion: '.nm-ct-revs-container'
  },
  onShow: function () {
    // this.reviewersCollection = new Backbone.Collection();
    // this.reviewersListView = new ReviewersListView({collection: this.reviewersCollection});
    // var _this = this;
    // $.get(_this.model.get('revsUrl'), function (items) {
    //   _this.reviewersCollection.add(items);
    // });
    // $('.nm-ct-revs-container').addClass('animated fadeIn');
    // this.reviewersRegion.show(this.reviewersListView);
  },
});
