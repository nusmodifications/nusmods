// @flow
import type { Node } from 'react';
import React, { PureComponent } from 'react';
import _ from 'lodash';

import type { WorkloadComponent } from 'types/modules';

import { parseWorkload } from 'utils/modules';

// Also update styles/components/module-workload.scss if
const ROW_MAX = 10;
const BLOCK_HEIGHT_REM = 2;

const shortComponentNames: { [WorkloadComponent]: string } = {
  Lecture: 'Lec',
  Tutorial: 'Tut',
  Laboratory: 'Lab',
  Project: 'Proj',
  Preparation: 'Prep',
};

function bgClass(component: WorkloadComponent): string {
  return `workload-${component.toLowerCase()}-bg`;
}

function textClass(component: WorkloadComponent): string {
  return `workload-${component.toLowerCase()}-text`;
}

function workloadLabel(component: WorkloadComponent, hours: number): Node {
  // For components with lots of hours, we show a count to make it more glanceable
  if (Math.ceil(hours) >= 5) {
    return [
      <span key="title">{component}</span>,
      <span key="count">{hours} hrs</span>,
    ];
  }

  // Only show the full component name if there's enough space
  if (Math.ceil(hours) >= 3) {
    return component;
  }

  // Otherwise, use an abbreviation
  return <abbr title={component}>{ shortComponentNames[component] }</abbr>;
}

function workloadBlocks(component: WorkloadComponent, hours: number): Node {
  const itemWidth = 100 / Math.min(ROW_MAX, Math.ceil(hours));
  const style = { width: `${itemWidth}%` };

  const blocks: Node[] = _.range(Math.floor(hours)).map(hour => (
    <div
      key={hour}
      className={bgClass(component)}
      style={style}
    />
  ));

  // Remainders (for non-integer workloads) are displayed as vertical half-blocks
  const remainder = hours % 1;
  if (remainder) {
    blocks.push(<div
      key="remainder"
      className={bgClass(component)}
      style={{ ...style, height: `${remainder * BLOCK_HEIGHT_REM}rem` }}
    />);
  }

  return blocks;
}

function sortWorkload(workload: { [WorkloadComponent]: number }): Array<[WorkloadComponent, number]> {
  // Push longer components (those that take up more than one row) down
  // $FlowFixMe: lodash libdef incorrectly marks the return type of _.entries as any[][]
  const components: Array<[WorkloadComponent, number]> = _.entries(workload);
  const [long, short] = _.partition(components, ([, hours]) => Math.ceil(hours) > ROW_MAX);
  return short.concat(long);
}

type Props = {
  workload: string,
};

export default class ModuleWorkload extends PureComponent<Props> {
  props: Props;

  renderFallback(): Node {
    // Workload cannot be parsed - so we just display it without any visualization
    return (
      <div className="module-workload-container">
        <h4>Workload</h4>
        <p className="module-workload-fallback">{ this.props.workload }</p>
      </div>
    );
  }

  render() {
    const workload = parseWorkload(this.props.workload);
    if (typeof workload === 'string') return this.renderFallback();

    const total = _.sum(_.values(workload));

    return (
      <div className="module-workload-container">
        <h4>Workload - {total} hrs</h4>
        <div className="module-workload">
          {sortWorkload(workload).map(([component, hours]) => (
            <div
              key={component}
              className="module-workload-component"
              style={{ width: `${(100 / ROW_MAX) * Math.min(ROW_MAX, Math.ceil(hours))}%` }}
            >
              <h5 className={textClass(component)}>
                {workloadLabel(component, hours)}
              </h5>

              <div className="module-workload-blocks">
                {workloadBlocks(component, hours)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
