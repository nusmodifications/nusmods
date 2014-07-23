'use strict';

var App = require('../../app');
var Backbone = require('backbone');
var BiddingStatsView = require('./BiddingStatsView');
var Marionette = require('backbone.marionette');
var NUSMods = require('../../nusmods');
var _ = require('underscore');
var d3 = require('d3');
var localforage = require('localforage');
var template = require('../templates/module.hbs');
require('../../templates/helpers/equals');
require('bootstrap/tooltip');

var searchPreferences = {};

function drawTree(selector, prereqs, lockedModules, modCode) {
  function isOrAnd (d) { return (d.name === 'or' || d.name === 'and'); }
  function modsFilter (d) { return !isOrAnd(d); }
  function andOrFilter (d) { return isOrAnd(d); }
  function getX (d) { return isOrAnd(d) ? -25 : -60; }
  function getY (d) { return isOrAnd(d) ? -17.5 : -35; }
  function getHeight (d) { return isOrAnd(d) ? 35 : 60; }
  function getWidth (d) { return isOrAnd(d) ? 50 : 120; }
  function getDefaultTranslation() { return [(SVGWidth) / 2, 180]; }
  function mouseOver (d) {
    if (!isOrAnd(d)) {
      rectangles.filter(modsFilter)
                .classed({'active-rect': false, 'opaque': false, 'translucent': true});
      d3.select(this).selectAll('rect').classed({'active-rect': true, 'opaque': true, 'translucent': false});
    }
  }
  function mouseOut () {
    rectangles.filter(modsFilter)
              .classed({'active-rect': false, 'opaque': true, 'translucent': false});
  }
  function clicked (d) {
    if (!isOrAnd(d) && d.name in allMods) {
      window.location.href = '/modules/' + d.name;
    }
  }
  function resized() {
    SVGWidth = $(selector).width();
    d3.select('#svg').attr('width', SVGWidth);

    interact.translate(getDefaultTranslation());
    d3.select('#drawarea')
      .transition()
      .delay(1)
      .attr('transform', 'translate('+getDefaultTranslation()+') scale('+interact.scale()+')');
  }

  var SVGWidth = $(selector).width(),
      SVGHeight = 550,
      allMods = NUSMods.getAllModules();

  d3.selectAll('svg').remove();
  var canvas = d3.select(selector)
                  .append('svg')
                  .attr('id', 'svg')
                  .attr('width', SVGWidth)
                  .attr('height', SVGHeight),
      interact = d3.behavior.zoom()
                    .scaleExtent([0.0, 5.0])
                    .size([960, 500])
                    .on('zoom', function () {
                      d3.select('#drawarea')
                        .attr('transform', 'translate('+d3.event.translate+') scale('+d3.event.scale+')');
                    });
  interact(d3.select('svg'));
  canvas = canvas.append('g')
                  .attr('id', 'drawarea');

  $(window).on('resize', _.debounce(resized, 100));
  resized();

  var tree = d3.layout.tree().nodeSize([130, 130]);
  var nodes = tree.nodes(prereqs);
  var links = tree.links(nodes);
  var diagonal = d3.svg.diagonal().projection(function (d) { return [d.x, d.y]; });

  var tree_lm = d3.layout.tree().nodeSize([130, 130]);
  var nodes_lm = tree_lm.nodes(lockedModules);
  var links_lm = tree_lm.links(nodes_lm);
  var diagonal_lm = d3.svg.diagonal().projection(function (d) { return [d.x, -d.y]; });

  canvas.selectAll('.link')
      .data(links)
      .enter()
      .append('path')
      .classed({'link': true, 'test': true})
      .attr('d', diagonal);

  canvas.selectAll('.link.locked-modules')
      .data(links_lm)
      .enter()
      .append('path')
      .classed({'link': true, 'locked-modules': true})
      .attr('d', diagonal_lm);

  var node = canvas.selectAll('.node')
                  .data(nodes)
                  .enter()
                  .append('g')
                  .attr('class', 'node')
                  .attr('transform', function (d) {
                    return 'translate('+d.x+','+d.y+')';
                  });

  var node_lm = canvas.selectAll('.node.locked-modules')
                      .data(nodes_lm)
                      .enter()
                      .append('g')
                      .classed({'node': true, 'locked-modules': true})
                      .attr('transform', function (d) {
                        return 'translate('+d.x+','+-d.y+')';
                      });
  var node_all = canvas.selectAll('.node');

  var rectangles = node_all.append('rect')
                        .attr('width', 0)
                        .attr('height', 0)
                        .attr('x', getX)
                        .attr('y', getY)
                        .attr('rx', 20)
                        .attr('ry', 20)
                        .classed({'rect': true, 'opaque': true})
                        .attr('nodeValue', function (d) { return d.name; });
  rectangles.filter(modsFilter)
            .classed({'mod-rect': true, 'non-linkable-mod': true})
            .filter(function (d) { return d.name in allMods; })
            .classed({'non-linkable-mod': false, 'linkable-mod': true});
  rectangles.filter(andOrFilter)
            .classed({'andor-rect': true});
  rectangles.filter(function (d) { return d.name === modCode; })
            .classed({'current-mod-rect': true});

  var labels = node_all.append('text')
                    .text(function (d) { return d.name; })
                    .classed({'rect-label': true, 'lead': true, 'transparent': true})
                    .attr('dy', function (d) { return isOrAnd(d)? '10' : ''; });
  labels.filter(andOrFilter)
        .classed({'andor-label': true});
  labels.filter(modsFilter)
        .classed({'non-linkable-mod': true})
        .filter(function (d) { return d.name in allMods; })
        .classed({'non-linkable-mod': false, 'linkable-mod': true});

  canvas.selectAll('path')
        .classed({'opacity-transition': true, 'opaque': true, 'transparent': false});

  node_all.selectAll('rect')
          .transition()
          .duration(1000)
          .attr('width', getWidth)
          .attr('height', getHeight)
          .ease('elastic');

  node_all.selectAll('text')
      .classed({'opacity-transition': true, 'opaque': true, 'transparent': false});

  node_all.on('mouseover', mouseOver);
  node_all.on('mouseout', mouseOut);
  node_all.on('click', clicked);
}

module.exports = Marionette.LayoutView.extend({
  template: template,
  regions: {
    biddingStatsRegion: '#bidding-stats'
  },
  initialize: function () {

    if (this.model.get('section') === 'corspedia') {
      var formElements = {
        'faculty': '#faculty',
        'account': '#account',
        'student': 'input:radio[name="student-radios"]'
      };

      var defaults = {
        'faculty': 'Arts & Social Sciences',
        'account': 'P',
        'student': 'true'
      };

      var that = this;
      var loadedItems = 0;
      _.each(formElements, function (selector, item) {
        localforage.getItem(item, function (value) {
          if (!value) {
            value = defaults[item];
            localforage.setItem(item, value);
          }
          $(selector).val([value]);
          searchPreferences[item] = value;
          loadedItems++;
          if (loadedItems === _.keys(formElements).length) {
            that.showBiddingStatsRegion(true);
          }
        });
      });
    }
  },
  events: {
    'change #faculty, input:radio[name="student-radios"], #account': 'updateCorspedia',
    'click .show-full-desc': 'showFullDescription',
    'click #show-all-stats': 'showAllStats',
    'click .add-timetable': function (event) {
      var qtipContent;
      if (App.request('isModuleSelected', this.model.get('module').ModuleCode)) {
        qtipContent = 'Already added!';
      } else {
        qtipContent = 'Added!';
        App.request('addModule', this.model.get('module').ModuleCode);
      }
      $(event.currentTarget).qtip({
        content: qtipContent,
        show: {
          event: false,
          ready: true
        },
        hide: {
          event: false,
          inactive: 1000
        }
      });
    },
    'click .add-bookmark': function (event) {
      App.request('addBookmark', this.model.get('module').ModuleCode);
      $(event.currentTarget).qtip({
        content: 'Bookmarked!',
        show: {
          event: false,
          ready: true
        }
      });
    }
  },
  onShow: function () {
    var module = this.model.get('module');

    if (this.model.get('section') === 'modmaven') {
      var lockedModules = {'name': module.ModmavenTree['name'], 'children': []};
      for (var i = 0; i < module.LockedModules.length; i++) {
        lockedModules['children'].push({'name': module.LockedModules[i], 'children': []});
      };
      drawTree('#tree', module.ModmavenTree, lockedModules, module.ModuleCode);
    }

    var code = module.ModuleCode;
    var disqusShortname = 'nusmods';
    if (this.model.get('section') === 'reviews') {
      // Only reset Disqus when showing reviews section
      var url = 'http://nusmods.com/modules/' + code + '/reviews';
      var title = code + ' ' + module.ModuleTitle;

      window.disqus_identifier = code;
      window.disqus_title = title;
      window.disqus_url = url;

      if (!window.DISQUS) {
        window.disqus_shortname = disqusShortname;

        (function() {
          var dsq = document.createElement('script');
          dsq.type = 'text/javascript';
          dsq.async = true;
          dsq.src = '//nusmods.disqus.com/embed.js';
          (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
        })();
      } else {
        DISQUS.reset({
          reload: true,
          config: function () {
            this.page.identifier = code;
            this.page.title = title;
            this.page.url = url;
          }
        });
      }
    }

    (function () {
      if (typeof disqus_domain !== 'undefined') {
        DISQUSWIDGETS.domain = 'disqus.com';
      }
      DISQUSWIDGETS.forum = disqusShortname;
      DISQUSWIDGETS.getCount();
    })();

    $('.nm-help').tooltip();
  },
  showFullDescription: function () {
    $('.module-desc').addClass('module-desc-more');
    return false;
  },
  showAllStats: function () {
    this.showBiddingStatsRegion(false);
  },
  updateCorspedia: function ($ev) {
    var $target = $($ev.target);
    $target.blur();
    var property = $target.attr('data-pref-type');
    var value = $target.val();
    if (this.savePreference(property, value)) {
      searchPreferences[property] = value;
      this.showBiddingStatsRegion(true);
    }
  },
  showBiddingStatsRegion: function (displayFiltered) {
    var biddingStatsDeepCopy = $.extend(true, {},
      this.model.attributes.module.FormattedCorsBiddingStats);
    var biddingStatsModel = new Backbone.Model({stats: biddingStatsDeepCopy});
    var biddingStatsView = new BiddingStatsView({model: biddingStatsModel});

    var faculty = searchPreferences.faculty;
    var accountType = searchPreferences.account;
    var newStudent = searchPreferences.student === 'true';

    if (faculty && faculty !== 'default' && accountType && displayFiltered) {
      biddingStatsView.filterStats(faculty, accountType, newStudent);
    }

    this.biddingStatsRegion.show(biddingStatsView);
  },
  savePreference: function(property, value) {
    if (property === 'faculty' && value === 'default') {
      alert('You have to select a faculty.');
      localforage.getItem(property, function(value) {
          $('#faculty').val(value);
      });
      return false;
    }
    localforage.setItem(property, value);
    return true;
  }
});
