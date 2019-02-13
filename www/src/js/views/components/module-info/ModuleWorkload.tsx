import * as React from 'react';
import classnames from 'classnames';
import { sum, entries, partition, zipObject, range } from 'lodash';

import { Workload, WORKLOAD_COMPONENTS, WorkloadComponent } from 'types/modules';
import Tooltip from 'views/components/Tooltip';

const ROW_MAX = 10;

const shortComponentNames: { [workloadComponent: string]: string } = {
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

function workloadLabel(component: WorkloadComponent, hours: number): React.ReactNode {
  // For components with lots of hours, we show a count to make it more glanceable
  if (Math.ceil(hours) >= 5) {
    return (
      <>
        <span>{component}</span> <span>{hours} hrs</span>
      </>
    );
  }

  // Only show the full component name if there's enough space
  if (Math.ceil(hours) >= 3) {
    return component;
  }

  // Otherwise, use an abbreviation
  return <abbr title={component}>{shortComponentNames[component]}</abbr>;
}

function workloadBlocks(component: WorkloadComponent, hours: number): React.ReactNode {
  const blocks: React.ReactNode[] = range(Math.floor(hours)).map((hour) => (
    <div key={hour} className={bgClass(component)} />
  ));

  // Remainders (for non-integer workloads) are displayed as vertical half-blocks
  if (hours % 1) {
    blocks.push(<div key="remainder" className={classnames('remainder', bgClass(component))} />);
  }

  return blocks;
}

type WorkloadMap = { [workload in WorkloadComponent]: number };

function sortWorkload(workload: WorkloadMap): [WorkloadComponent, number][] {
  // Push longer components (those that take up more than one row) down
  const components = entries(workload) as [WorkloadComponent, number][];
  const [long, short] = partition(components, ([, hours]) => Math.ceil(hours) >= ROW_MAX);
  return short.concat(long);
}

type Props = {
  workload: Workload;
};

export default class ModuleWorkload extends React.PureComponent<Props> {
  renderFallback(): React.ReactNode {
    // Workload cannot be parsed - so we just display it without any visualization
    return (
      <div className="module-workload-container">
        <h4>Workload</h4>
        <p className="module-workload-fallback">{this.props.workload}</p>
      </div>
    );
  }

  render() {
    const { workload } = this.props;
    if (typeof workload === 'string') return this.renderFallback();

    // Pair the workload with their numbers
    const workloadMap = zipObject(WORKLOAD_COMPONENTS, workload) as WorkloadMap;
    const total = sum(workload);

    return (
      <div className="module-workload-container">
        <h4>Workload - {total} hrs</h4>
        <div className="module-workload">
          {sortWorkload(workloadMap).map(([component, hours]) => (
            <Tooltip content={`${hours} hours of ${component}`} key={component}>
              <div
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
