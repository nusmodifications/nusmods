define(['underscore', 
    'json!common/utils/themeOptions.json',
    'localforage'], 
  function (_, themeOptions, localforage) {
  'use strict';
  
  return {
    getThemeOptions: function () {
      return themeOptions;
    },
    selectNextTheme: function (direction) {
      var $body = $('body');
      var allThemes = _.pluck(themeOptions, 'value');
      var currentTheme = $body.attr('data-theme');

      var newIndex = allThemes.indexOf(currentTheme) + (direction === 'Left' ? -1 : +1);
      newIndex = Math.min(newIndex, allThemes.length - 1);
      newIndex = Math.max(newIndex, 0);

      this.applyTheme(themeOptions[newIndex].value);
    },
    selectRandomTheme: function () {
      var allThemes = _.pluck(themeOptions, 'value');
      var currentTheme = $('body').attr('data-theme');
      var newTheme;

      do {
        newTheme = allThemes[Math.floor(Math.random() * (allThemes.length))];
      } while (newTheme === currentTheme);

      this.applyTheme(newTheme);
    },
    applyTheme: function (newTheme) {

      var $themeOptions = $('#theme-options');
      if ($themeOptions.length) {
        $themeOptions.val(newTheme);
      }

      localforage.setItem('theme', newTheme);

      var $body = $('body');
      $body.attr('data-theme', newTheme);
      $body.removeClass();
      _.each(['mode', 'theme'], function (prop) {
        $body.addClass(prop + '-' + $body.attr('data-' + prop));
      });
    }
  };
});
