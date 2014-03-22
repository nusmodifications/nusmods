define(['backbone', '../models/ModuleModel'], function(Backbone, Module) {
  'use strict';

  return Backbone.Collection.extend({
    model: Module
  });
});
