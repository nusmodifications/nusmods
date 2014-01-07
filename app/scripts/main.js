require.config({
  packages: [
    {
      name: 'underscore',
      location: '../bower_components/lodash-amd/compat'
    }
  ],
  paths: {
    'backbone.localstorage': '../bower_components/backbone.localstorage/backbone.localStorage',
    'backbone.picky': '../bower_components/backbone.picky/lib/amd/backbone.picky',
    backbone: '../bower_components/backbone/backbone',
    'bootstrap-button': '../bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/button',
    'bootstrap-dropdown': '../bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/dropdown',
    'bootstrap-modal': '../bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/modal',
    'bootstrap-tab': '../bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/tab',
    'bootstrap-transition': '../bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/transition',
    downloadify: '../bower_components/downloadify/src/downloadify',
    jquery: '../bower_components/jquery/jquery',
    'jquery.ui.core': '../bower_components/jquery.ui/ui/jquery.ui.core',
    'jquery.ui.widget': '../bower_components/jquery.ui/ui/jquery.ui.widget',
    'jquery.ui.mouse': '../bower_components/jquery.ui/ui/jquery.ui.mouse',
    'jquery.ui.draggable': '../bower_components/jquery.ui/ui/jquery.ui.draggable',
    'jquery.ui.droppable': '../bower_components/jquery.ui/ui/jquery.ui.droppable',
    'jquery-ui-touch-punch-improved': '../bower_components/jquery-ui-touch-punch-improved/jquery.ui.touch-punch-improved',
    qtip2: '../bower_components/qtip2/jquery.qtip',
    select2: '../bower_components/select2/select2',
    spectrum: '../bower_components/spectrum/spectrum',
    swfobject: '../bower_components/swfobject/swfobject/swfobject',
    timetabledata: 'nus_timetable_data',
    zeroclipboard: '../bower_components/zeroclipboard/ZeroClipboard'
  },
  shim: {
    backbone: {
      deps: [
        'underscore',
        'jquery'
      ],
      exports: 'Backbone'
    },
    'backbone.localstorage': [
      'backbone'
    ],
    'bootstrap-button': [
      'jquery'
    ],
    'bootstrap-dropdown': [
      'jquery'
    ],
    'bootstrap-modal': [
      'jquery'
    ],
    'bootstrap-tab': [
      'jquery'
    ],
    'bootstrap-transition': [
      'jquery'
    ],
    downloadify: [
      'jquery',
      'swfobject'
    ],
    'jquery.ui.core': [
      'jquery'
    ],
    'jquery.ui.widget': [
      'jquery.ui.core'
    ],
    'jquery.ui.mouse': [
      'jquery.ui.widget'
    ],
    'jquery.ui.draggable': [
      'jquery.ui.mouse'
    ],
    'jquery.ui.droppable': [
      'jquery.ui.draggable'
    ],
    'jquery-ui-touch-punch-improved': [
      'jquery.ui.mouse'
    ],
    qtip2: [
      'jquery'
    ],
    select2: [
      'jquery'
    ],
    spectrum: [
      'jquery'
    ],
    swfobject: {
      exports: 'swfobject'
    }
  }
});

require([
  'timetabledata',
  'app',
  'router',
  'jquery',
  'backbone',
  'views/AppView',
  'views/TimetableBuilderView',
  'backbone.localstorage',
  'bootstrap-button',
  'bootstrap-dropdown',
  'bootstrap-modal',
  'bootstrap-tab',
  'bootstrap-transition',
  'qtip2'
],

function(timetableData, app, Router, $, Backbone, AppView, TimetableBuilderView) {
  'use strict';

  var appView = new AppView();
  var timetableBuilderView = new TimetableBuilderView();

  // Define your master router on the application namespace and trigger all
  // navigation from this instance.
  app.router = new Router();

  // Trigger the initial route and enable HTML5 History API support, set the
  // root folder to '/' by default.  Change in app.js.
  Backbone.history.start({ root: app.root });

//  // All navigation that is relative should be passed through the navigate
//  // method, to be processed by the router. If the link has a `data-bypass`
//  // attribute, bypass the delegation completely.
//  $(document).on("click", "a:not([data-bypass])", function(evt) {
//    // Get the absolute anchor href.
//    var href = $(this).attr("href");
//
//    // If the href exists and is a hash route, run it through Backbone.
//    if (href && href.indexOf("#") === 0) {
//      // Stop the default event to ensure the link will not cause a page
//      // refresh.
//      evt.preventDefault();
//
//      // `Backbone.history.navigate` is sufficient for all Routers and will
//      // trigger the correct events. The Router's internal `navigate` method
//      // calls this anyways.  The fragment is sliced from the root.
//      Backbone.history.navigate(href, true);
//    }
//  });

  Backbone.sync = function() {};

//  var modsLength = timetableData.code.length;

//  prevHash = s2 = void 0;
//
//  loadHash = function(hash) {
//    var code, el, firstGroup, group, groups, i, lesson, loaded, loadedGroup, loadedGroups, loadedLessonsLength, pair, shortCode, type, types, val, _base1, _base2, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
//    _ref = $('.lesson');
//    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
//      el = _ref[_i];
//      $(el).data('lesson').detach();
//    }
//    loaded = {};
//    _ref1 = hash.split('&');
//    for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
//      pair = _ref1[i];
//      _ref2 = pair.split('='), shortCode = _ref2[0], val = _ref2[1];
//      code = timetableData.code[getModIndex(shortCode)];
//      if (!code) {
//        alert('' + shortCode + ' no longer exists.');
//        continue;
//      }
//      loaded[code] || (loaded[code] = {});
//      if (!val) {
//        addMod(code);
//        continue;
//      }
//      if (!timetable[code]) {
//        addMod(code, false);
//      }
//      type = val[0] === 'A' ? '10' : val[0];
//      if (!timetable[code][type]) {
//        alert('' + code + ' ' + lessonTypes[type] + ' no longer exists.');
//        continue;
//      }
//      (_base1 = loaded[code])[type] || (_base1[type] = {});
//      group = val.slice(1);
//      if ((_ref3 = (_base2 = loaded[code][type])[group]) == null) {
//        _base2[group] = 0;
//      }
//      if ((_ref4 = timetable[code][type][group]) != null) {
//        if ((_ref5 = _ref4[loaded[code][type][group]++]) != null) {
//          _ref5.attach();
//        }
//      }
//    }
//    for (code in timetable) {
//      types = timetable[code];
//      if (!loaded[code]) {
//        removeMod(code);
//        continue;
//      }
//      for (type in types) {
//        groups = types[type];
//        if (!(loadedGroups = loaded[code][type])) {
//          for (firstGroup in groups) {
//            _ref6 = groups[firstGroup];
//            for (_k = 0, _len2 = _ref6.length; _k < _len2; _k++) {
//              lesson = _ref6[_k];
//              lesson.attach();
//            }
//            break;
//          }
//          continue;
//        }
//        for (loadedGroup in loadedGroups) {
//          loadedLessonsLength = loadedGroups[loadedGroup];
//          if (!groups[loadedGroup]) {
//            for (firstGroup in groups) {
//              alert(('' + code + ' ' + lessonTypes[type] + ' Group ' + loadedGroup + ' no ') + ('longer exists. Adding Group ' + firstGroup + ' instead.'));
//              _ref7 = groups[firstGroup];
//              for (_l = 0, _len3 = _ref7.length; _l < _len3; _l++) {
//                lesson = _ref7[_l];
//                lesson.attach();
//              }
//              break;
//            }
//            break;
//          }
//          while (loadedLessonsLength < groups[loadedGroup].length) {
//            groups[loadedGroup][loadedLessonsLength++].attach();
//          }
//        }
//      }
//    }
//    return s2.select2('val', (function() {
//      var _results;
//      _results = [];
//      for (code in loaded) {
//        _results.push(code);
//      }
//      return _results;
//    })());
//  };

//  $(function() {
//
//
//
//    var hash = location.href.split('#')[1] || localStorage.getItem('hash');
//    if (hash && hash.indexOf('=') !== -1) {
//      loadHash(hash);
//    } else if (s2val = localStorage.getItem('select2')) {
//      _ref = (IDs = s2val.split(','));
//      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
//        ID = _ref[_i];
//        addMod(ID);
//      }
//      s2.select2('val', IDs);
//    }

//    $(window).on('hashchange', function() {
//      if (!prevHash) {
//        return;
//      }
//      hash = location.href.split('#')[1];
//      if (hash.indexOf('=') === -1) {
//        location.hash = prevHash;
//      } else if (hash !== prevHash) {
////        loadHash(prevHash = hash);
//      }
//    });
//

//  });

//  queryString = function() {
//    var code, el, val;
//    return ((function() {
//      var _results;
//      _results = [];
//      for (code in timetable) {
//        val = timetable[code];
//        if ($.isEmptyObject(val)) {
//          _results.push(code.split(' ')[0]);
//        }
//      }
//      return _results;
//    })()).concat((function() {
//      var _i, _len, _ref, _results;
//      _ref = $('td > .lesson');
//      _results = [];
//      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
//        el = _ref[_i];
//        //_results.push($(el).data('lesson').queryString);
//      }
//      return _results;
//    })()).join('&');
//  };
});
