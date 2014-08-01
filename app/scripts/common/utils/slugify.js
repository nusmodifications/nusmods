'use strict';

// Turns a string into slug form.
module.exports = function (string) {
  return string.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'');
};
