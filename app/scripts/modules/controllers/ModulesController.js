define(['underscore', 'require', 'app', 'backbone.marionette'],
  function (_, require, App, Marionette) {
    'use strict';

    var navigationItem = App.request('addNavigationItem', {
      name: 'Modules',
      icon: 'search',
      url: '#modules'
    });

    var SEMESTER = '2013-2014/1';

    return Marionette.Controller.extend({
      showModules: function () {
        require(['../views/ModulesView'],
          function (ModulesView) {
            navigationItem.select();
            App.mainRegion.show(new ModulesView());
          });
      },
      showModule: function (id) {
        require(['../views/ModuleView', 'nusmods', 'common/models/ModuleModel'],
          function (ModuleView, NUSMods, ModuleModel) {
            navigationItem.select();
            var modCode = id.toUpperCase();
            $.getJSON('/api/json/' + SEMESTER + '/modules/' + modCode + '.json', function (data) {
              var moduleModel = new ModuleModel(data);
              App.mainRegion.show(new ModuleView({model: moduleModel}));
            });

            (function() {
              $('#disqus-script').remove(); // Force reload of disqus
              window.disqus_shortname = 'corspedia';
              window.disqus_identifier = modCode;
              window.disqus_url = window.location.href;
              var dsq = document.createElement('script'); 
              dsq.type = 'text/javascript'; 
              dsq.async = true;
              dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
              dsq.id = 'disqus-script';
              (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
              console.log('init dsq')
            })();
          });
      }
    });
  });
