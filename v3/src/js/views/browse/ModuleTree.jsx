import React, { Component } from 'react';
import d3 from 'd3/d3';
// import _ from 'lodash';

type Props = {
  module: Module,
}
export default class ModuleTree extends Component {

  componentDidMount() {
    function isOrAnd(d) { return (d.name === 'or' || d.name === 'and'); }
    function modsFilter(d) { return !isOrAnd(d); }
    function andOrFilter(d) { return isOrAnd(d); }
    function getHeight(d) { return isOrAnd(d) ? 35 : 60; }
    function getWidth(d) { return isOrAnd(d) ? 50 : 120; }
    function getX(d) { return isOrAnd(d) ? -25 : -60; }
    function getY(d) { return isOrAnd(d) ? -17.5 : -35; }

    let rectangles;
    let interact;
    let SVGWidth = this.prereqRoot.clientWidth;

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
        window.location.href = `/modules/${d.name}`;
      }
    }
    function getDefaultTranslation() {
      return [(SVGWidth) / 2, 180];
    }
    const prereqRoot = this.prereqRoot;
    function resized() {
      SVGWidth = prereqRoot.clientWidth;
      d3.select('#svg').attr('width', SVGWidth);

      interact.translate(getDefaultTranslation());
      d3.select('#drawarea')
        .transition()
        .delay(1)
        .attr('transform', `translate(${getDefaultTranslation()}) scale(${interact.scale()})`);
    }

    const SVGHeight = 400;
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
    // window.on('resize', _.debounce(resized, 100));
    resized();
    interact(d3.select('svg'));
    const module = this.props.module;

    if (!module.ModmavenTree) {
      return;
    }

    const modCode = module.ModuleCode;
    const lockedModules = {
      name: module.ModmavenTree.name,
      children: module.LockedModules.map(lm => ({ name: lm, children: [] })),
    };
    const prereqs = module.ModmavenTree;
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

  props: Props;

  render() {
    return <div ref={div => (this.prereqRoot = div)} className="nm-prerequisites-tree"/>;
  }
}
