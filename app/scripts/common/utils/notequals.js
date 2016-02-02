'use strict';

var Handlebars = require('hbsfy/runtime');

function notequals(lvalue, rvalue, options) {
  if (arguments.length < 3) {
    throw new Error('Handlebars helper equals needs 2 parameters');
  }
  if (lvalue === rvalue) {
    return options.inverse(this); // jshint ignore:line
  } else {
    return options.fn(this); // jshint ignore:line
  }
}
Handlebars.registerHelper('notequals', notequals);
