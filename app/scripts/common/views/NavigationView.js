define(['backbone.marionette', './NavigationItemView'],
  function (Marionette, NavigationItemView) {
    'use strict';

    return Marionette.CollectionView.extend({
      tagName: 'ul',
      className: 'nav navbar-nav',
      itemView: NavigationItemView
    });
  });
