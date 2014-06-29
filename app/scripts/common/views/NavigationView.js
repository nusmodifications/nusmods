define(['backbone.marionette', './NavigationItemView', 'bootstrap/collapse'],
  function (Marionette, NavigationItemView) {
    'use strict';

    return Marionette.CollectionView.extend({
      tagName: 'ul',
      className: 'nav navbar-nav navbar-right',
      childView: NavigationItemView
    });
  });
