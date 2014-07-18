'use strict';

// Pad number to two digits.
module.exports = function(number) {
  return (number < 10 ? '0' : '') + number;
};
