import * as React from 'react';
import classnames from 'classnames';
import { partition, range, sum, zip } from 'lodash';

import { Workload, WORKLOAD_COMPONENTS, WorkloadComponent } from 'types/modules';
import Tooltip, { TooltipGroup } from 'views/components/Tooltip';
import styles from './ModuleWorkload.scss';

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
    blocks.push(
      <div key="remainder" className={classnames(styles.remainder, bgClass(component))} />,
    );
  }

  return blocks;
}

type WorkloadTuple = [WorkloadComponent, number];

function sortWorkload(workload: readonly number[]): WorkloadTuple[] {
  const components = zip(WORKLOAD_COMPONENTS, workload) as WorkloadTuple[];

  // Only show non-empty components
  const nonEmptyComponents = components.filter(([, hours]) => hours > 0);

  // Push longer components (those that take up more than one row) down
  const [long, short] = partition(nonEmptyComponents, ([, hours]) => Math.ceil(hours) >= ROW_MAX);
  return short.concat(long);
}

type Props = {
  workload: Workload;
};

const ModuleWorkload = React.memo<Props>(({ workload }) => {
  if (typeof workload === 'string') {
    // Workload cannot be parsed - so we just display it without any visualization
    return (
      <div className={styles.moduleWorkloadContainer}>
        <h4>Workload</h4>
        <p className={styles.moduleWorkloadFallback}>{workload}</p>
      </div>
    );
  }

  const total = sum(workload);

  return (
    <div className={styles.moduleWorkloadContainer}>
      <h4>Workload - {total} hrs</h4>
      <div className={styles.moduleWorkload}>
        <TooltipGroup distance={0}>
          {sortWorkload(workload).map(([component, hours]) => (
            <Tooltip content={`${hours} hours of ${component}`} key={component}>
              <div
                className={styles.moduleWorkloadComponent}
                style={{ width: `${(100 / ROW_MAX) * Math.min(ROW_MAX, Math.ceil(hours))}%` }}
              >
                <h5 className={textClass(component)}>{workloadLabel(component, hours)}</h5>

                <div
                  className={classnames(styles.moduleWorkloadBlocks, {
                    [styles.blocksFixed!]: Math.ceil(hours) > ROW_MAX,
                  })}
                >
                  {workloadBlocks(component, hours)}
                </div>
              </div>
            </Tooltip>
          ))}
        </TooltipGroup>
      </div>
    </div>
  );
});

ModuleWorkload.displayName = 'ModuleWorkload';

export default ModuleWorkload;
