define('templates/helpers/equals', ['hbs/handlebars'], function(Handlebars) {
  'use strict';

  function equals(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error('Handlebars helper equals needs 2 parameters');
    if (lvalue !== rvalue) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
  }
  Handlebars.registerHelper('equals', equals);
  return equals;
});