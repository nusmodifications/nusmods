define(['underscore'], function (_) {
  'use strict';

  // Capitalize the first character of each word in a sentence
  return function(sentence) {
    var words = [];
    _.each(sentence.split(' '), function (word) {
      words.push(word.charAt(0) + word.slice(1).toLowerCase());
    })
    return words.join(' ');
  };
});
