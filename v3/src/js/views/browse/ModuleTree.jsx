// @flow

import React, { Component } from 'react';
import _ from 'lodash';
import d3 from 'd3/build/d3';

import type { Module } from 'types/modules';

type Props = {
  module: Module,
};

export default class ModuleTree extends Component {
  props: Props;
  prereqRoot: HTMLDivElement;

  componentDidMount() {
    const isOrAnd = d => d.name === 'or' || d.name === 'and';
    const modsFilter = d => !isOrAnd(d);
    const andOrFilter = d => isOrAnd(d);
    const getHeight = d => (isOrAnd(d) ? 35 : 60);
    const getWidth = d => (isOrAnd(d) ? 50 : 120);
    const getX = d => (isOrAnd(d) ? -25 : -60);
    const getY = d => (isOrAnd(d) ? -17.5 : -35);

    const SVGHeight = 400;
    let SVGWidth = this.prereqRoot.clientWidth;
    let rectangles;
    let interact;

    const getDefaultTranslation = () => [(SVGWidth) / 2, 180].join(',');

    function mouseOver(d) {
      if (!isOrAnd(d)) {
        rectangles.filter(modsFilter)
          .classed({ 'active-rect': false, opaque: false, translucent: true });
        d3.select(this)
          .selectAll('rect')
          .classed({ 'active-rect': true, opaque: true, translucent: false });
      }
    }

    function mouseOut() {
      rectangles.filter(modsFilter)
        .classed({ 'active-rect': false, opaque: true, translucent: false });
    }

    function clicked(d) {
      if (!isOrAnd(d)) {
        // TODO: Use React Router to navigate.
        window.location.href = `/modules/${d.name}`;
      }
    }

    function resized() {
      SVGWidth = this.prereqRoot.clientWidth;
      d3.select('#svg').attr('width', SVGWidth);

      interact.translate(getDefaultTranslation());
      d3.select('#drawarea')
        .transition()
        .delay(1)
        .attr('transform', `translate(${getDefaultTranslation()}) scale(${interact.scale()})`);
    }

    const module = this.props.module;

    // early return so we don't draw a huge blank canvas
    if (!module.ModmavenTree) {
      return;
    }

    let canvas = d3.select(this.prereqRoot)
      .append('svg')
      .attr('id', 'svg')
      .attr('width', SVGWidth)
      .attr('height', SVGHeight);
    canvas = canvas.append('g')
      .attr('id', 'drawarea');
    interact = d3.behavior.zoom()
      .scaleExtent([0.0, 5.0])
      .size([960, 500])
      .on('zoom', () => (
        d3.select('#drawarea')
          .attr('transform', `translate(${d3.event.translate}) scale(${d3.event.scale})`)
      ));
    window.addEventListener('resize', _.debounce(resized.bind(this), 100));
    resized.bind(this)();
    interact(d3.select('svg'));

    const modCode = module.ModuleCode;
    // $FlowFixMe: Suppressing this error until we change the Module type.
    const modmavenTree = module.ModmavenTree;
    const lockedModules = {
      name: modmavenTree.name,
      // $FlowFixMe: Suppressing this error until we change the Module type.
      children: module.LockedModules.map(lm => ({ name: lm, children: [] })),
    };
    const prereqs = modmavenTree;
    const tree = d3.layout.tree().nodeSize([130, 130]);
    const nodes = tree.nodes(prereqs);
    const links = tree.links(nodes);
    const diagonal = d3.svg.diagonal().projection(d => [d.x, d.y]);

    const treeLm = d3.layout.tree().nodeSize([130, 130]);
    const nodesLm = treeLm.nodes(lockedModules);
    const linksLm = treeLm.links(nodesLm);
    const diagonalLm = d3.svg.diagonal().projection(d => [d.x, -d.y]);

    canvas.selectAll('.link')
      .data(links)
      .enter()
      .append('path')
      .classed({ link: true, test: true })
      .attr('d', diagonal);

    canvas.selectAll('.link.locked-modules')
      .data(linksLm)
      .enter()
      .append('path')
      .classed({ link: true, 'locked-modules': true })
      .attr('d', diagonalLm);

    canvas.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);
    canvas.selectAll('.node.locked-modules')
      .data(nodesLm)
      .enter()
      .append('g')
      .classed({ node: true, 'locked-modules': true })
      .attr('transform', d => `translate(${d.x}, ${-d.y})`);

    const nodeAll = canvas.selectAll('.node');

    rectangles = nodeAll.append('rect')
      .attr('width', 0)
      .attr('height', 0)
      .attr('x', getX)
      .attr('y', getY)
      .attr('rx', 20)
      .attr('ry', 20)
      .classed({ rect: true, opaque: true })
      .attr('nodeValue', d => d.name);

    rectangles.filter(modsFilter)
      .classed({ 'mod-rect': true, 'non-linkable-mod': true })
      .filter(() => true)
      .classed({ 'non-linkable-mod': false, 'linkable-mod': true });
    rectangles.filter(andOrFilter)
      .classed({ 'andor-rect': true });
    rectangles.filter(d => d.name === modCode)
      .classed({ 'current-mod-rect': true });

    const labels = nodeAll.append('text')
      .text(d => d.name)
      .classed({ 'rect-label': true, lead: true, transparent: true })
      .attr('dy', d => (isOrAnd(d) ? '10' : ''));

    labels.filter(andOrFilter)
      .classed({ 'andor-label': true });

    labels.filter(modsFilter)
      .classed({ 'non-linkable-mod': true })
      .filter(() => true)
      .classed({ 'non-linkable-mod': false, 'linkable-mod': true });

    canvas.selectAll('path')
      .classed({ 'opacity-transition': true, opaque: true, transparent: false });

    nodeAll.selectAll('rect')
      .transition()
      .duration(1000)
      .attr('width', getWidth)
      .attr('height', getHeight)
      .ease('elastic');

    nodeAll.selectAll('text')
      .classed({ 'opacity-transition': true, opaque: true, transparent: false });
    nodeAll.on('mouseover', mouseOver);
    nodeAll.on('mouseout', mouseOut);
    nodeAll.on('click', clicked);
  }

  render() {
    return <div ref={(div) => { this.prereqRoot = div; }} className="nm-prerequisites-tree" />;
  }
}
