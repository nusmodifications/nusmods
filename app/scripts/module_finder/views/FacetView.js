define(['backbone.marionette', './FilterView'],
  function (Marionette, FilterView) {
    'use strict';

    return Marionette.CollectionView.extend({
      itemView: FilterView
    });
  });
