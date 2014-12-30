'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Marionette = require('backbone.marionette');
var NUSMods = require('../../nusmods');
var d3 = require('d3');

module.exports = Marionette.LayoutView.extend({
  template: _.template('<div id="nm-prerequisites-tree-canvas"></div>'),
  onShow: function () {
    this.drawTree('#nm-prerequisites-tree-canvas');
  },
  drawTree: function (selector) {
    var prereqs = this.model.get('prereqs');
    var lockedModules = this.model.get('lockedModules');
    var modCode = this.model.get('modCode');

    function isOrAnd (d) { 
      return (d.name === 'or' || d.name === 'and'); 
    }
    function modsFilter (d) { 
      return !isOrAnd(d); 
    }
    function andOrFilter (d) { 
      return isOrAnd(d); 
    }
    function getX (d) { 
      return isOrAnd(d) ? -25 : -60; 
    }
    function getY (d) { 
      return isOrAnd(d) ? -17.5 : -35; 
    }
    function getHeight (d) { 
      return isOrAnd(d) ? 35 : 60; 
    }
    function getWidth (d) { 
      return isOrAnd(d) ? 50 : 120; 
    }
    function getDefaultTranslation () { 
      return [(SVGWidth) / 2, 180]; 
    }
    function mouseOver (d) {
      /* jshint validthis: true */
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
    function resized () {
      SVGWidth = $(selector).width();
      d3.select('#svg').attr('width', SVGWidth);

      interact.translate(getDefaultTranslation());
      d3.select('#drawarea')
        .transition()
        .delay(1)
        .attr('transform', 'translate('+getDefaultTranslation()+') scale('+interact.scale()+')');
    }

    var SVGWidth = $(selector).width();
    var SVGHeight = 400;
    var allMods = NUSMods.getAllModules();

    d3.selectAll('svg').remove();
    var canvas = d3.select(selector)
                    .append('svg')
                    .attr('id', 'svg')
                    .attr('width', SVGWidth)
                    .attr('height', SVGHeight);
    var interact = d3.behavior.zoom()
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

    var treeLm = d3.layout.tree().nodeSize([130, 130]);
    var nodesLm = treeLm.nodes(lockedModules);
    var linksLm = treeLm.links(nodesLm);
    var diagonalLm = d3.svg.diagonal().projection(function (d) { return [d.x, -d.y]; });

    canvas.selectAll('.link')
        .data(links)
        .enter()
        .append('path')
        .classed({'link': true, 'test': true})
        .attr('d', diagonal);

    canvas.selectAll('.link.locked-modules')
        .data(linksLm)
        .enter()
        .append('path')
        .classed({'link': true, 'locked-modules': true})
        .attr('d', diagonalLm);

    canvas.selectAll('.node')
          .data(nodes)
          .enter()
          .append('g')
          .attr('class', 'node')
          .attr('transform', function (d) {
            return 'translate('+d.x+','+d.y+')';
          });

    canvas.selectAll('.node.locked-modules')
          .data(nodesLm)
          .enter()
          .append('g')
          .classed({'node': true, 'locked-modules': true})
          .attr('transform', function (d) {
            return 'translate('+d.x+','+-d.y+')';
          });
    var nodeAll = canvas.selectAll('.node');

    var rectangles = nodeAll.append('rect')
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

    var labels = nodeAll.append('text')
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

    nodeAll.selectAll('rect')
            .transition()
            .duration(1000)
            .attr('width', getWidth)
            .attr('height', getHeight)
            .ease('elastic');

    nodeAll.selectAll('text')
        .classed({'opacity-transition': true, 'opaque': true, 'transparent': false});

    nodeAll.on('mouseover', mouseOver);
    nodeAll.on('mouseout', mouseOut);
    nodeAll.on('click', clicked);
  }
});
