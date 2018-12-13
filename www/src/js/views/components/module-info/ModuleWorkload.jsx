// @flow
import type { Node } from 'react';
import React, { Fragment, PureComponent } from 'react';
import classnames from 'classnames';
import _ from 'lodash';

import type { WorkloadComponent } from 'types/modules';

import { parseWorkload } from 'utils/modules';
import Tooltip from 'views/components/Tooltip';

const ROW_MAX = 10;

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
    return (
      <Fragment>
        <span>{component}</span> <span>{hours} hrs</span>
      </Fragment>
    );
  }

  // Only show the full component name if there's enough space
  if (Math.ceil(hours) >= 3) {
    return component;
  }

  // Otherwise, use an abbreviation
  return <abbr title={component}>{shortComponentNames[component]}</abbr>;
}

function workloadBlocks(component: WorkloadComponent, hours: number): Node {
  const blocks: Node[] = _.range(Math.floor(hours)).map((hour) => (
    <div key={hour} className={bgClass(component)} />
  ));

  // Remainders (for non-integer workloads) are displayed as vertical half-blocks
  if (hours % 1) {
    blocks.push(<div key="remainder" className={classnames('remainder', bgClass(component))} />);
  }

  return blocks;
}

function sortWorkload(workload: {
  [WorkloadComponent]: number,
}): Array<[WorkloadComponent, number]> {
  // Push longer components (those that take up more than one row) down
  // $FlowFixMe: lodash libdef incorrectly marks the return type of _.entries as any[][]
  const components: Array<[WorkloadComponent, number]> = _.entries(workload);
  const [long, short] = _.partition(components, ([, hours]) => Math.ceil(hours) >= ROW_MAX);
  return short.concat(long);
}

type Props = {
  workload: string,
};

export default class ModuleWorkload extends PureComponent<Props> {
  renderFallback(): Node {
    // Workload cannot be parsed - so we just display it without any visualization
    return (
      <div className="module-workload-container">
        <h4>Workload</h4>
        <p className="module-workload-fallback">{this.props.workload}</p>
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
            <Tooltip content={`${hours} hours of ${component}`}>
              <div
                key={component}
                className="module-workload-component"
                style={{ width: `${(100 / ROW_MAX) * Math.min(ROW_MAX, Math.ceil(hours))}%` }}
              >
                <h5 className={textClass(component)}>{workloadLabel(component, hours)}</h5>

                <div
                  className={classnames('module-workload-blocks', {
                    'blocks-fixed': Math.ceil(hours) > ROW_MAX,
                  })}
                >
                  {workloadBlocks(component, hours)}
                </div>
              </div>
            </Tooltip>
          ))}
        </div>
      </div>
    );
  }
}
