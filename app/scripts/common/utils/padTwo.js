define(function () {
  'use strict';

  // Pad number to two digits.
  return function(number) {
    return (number < 10 ? '0' : '') + number;
  };
});
