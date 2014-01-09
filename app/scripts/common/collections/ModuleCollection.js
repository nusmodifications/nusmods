define(['backbone', '../models/ModuleModel'], function(Backbone, Module) {
  'use strict';

  var ModuleCollection = Backbone.Collection.extend({
    model: Module
  });

  return ModuleCollection;
});
