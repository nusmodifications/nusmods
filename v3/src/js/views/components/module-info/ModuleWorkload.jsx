// @flow
import React from 'react';
import type { Node } from 'react';
import classnames from 'classnames';
import _ from 'lodash';

import type { WorkloadComponent } from 'types/modules';

import { parseWorkload } from 'utils/modules';

const ROW_MAX = 10;

const shortComponentNames: { [WorkloadComponent]: string } = {
  Lecture: 'Lec',
  Tutorial: 'Tut',
  Laboratory: 'Lab',
  Project: 'Proj',
  Preparation: 'Prep',
};

type Props = {
  workload: string,
};

type WorkloadBlock = {
  showLabel: boolean,
  component: WorkloadComponent,
  count: number,
};

export default function ModuleWorkload(props: Props): Node {
  const workloadMap = parseWorkload(props.workload);
  if (typeof workloadMap === 'string') {
    return <p>{ workloadMap }</p>;
  }

  const workload = _.entries(workloadMap);
  const total = _.sumBy(workload, ([, hours]) => hours);

  if (!props.workload || !total) return null;

  // Convert workload into an array of blocks
  const blocks: WorkloadBlock[] = [];
  let currentRow = 0;
  let maxRowWidth = 0;
  let currentComponent = null;
  while (workload.length) {
    const [component, hours] = workload.shift();
    let spaceLeft = ROW_MAX - currentRow;

    // If there's not enough space, we make a new row
    if (spaceLeft < 3 && hours > spaceLeft) {
      maxRowWidth = Math.max(maxRowWidth, currentRow);
      currentRow = 0;
      spaceLeft = ROW_MAX;
    }

    let count = hours;
    if (hours > spaceLeft) {
      workload.unshift([component, hours - spaceLeft]);
      count = spaceLeft;
    }

    let showLabel = false;
    if (component !== currentComponent) {
      currentComponent = component;
      showLabel = true;
    }

    blocks.push({ component, count, showLabel });
    currentRow += count;
  }

  maxRowWidth = Math.max(maxRowWidth, currentRow);
  const blockWidth = 100 / maxRowWidth;

  return (
    <div className="module-workload-container">
      <h4>Workload - { total } hrs</h4>
      <div className="module-workload">
        {blocks.map(({ showLabel, component, count }, index) => (
          <div
            key={index}
            className="module-workload-component"
            style={{ width: `${count * blockWidth}%` }}
          >
            { showLabel &&
            <span className={classnames('module-workload-label', `workload-${component.toLowerCase()}-text`)}>
              { count > 3 ? component : shortComponentNames[component] }
            </span>}
            <div className="module-workload-blocks">
              {_.range(count).map(i => (
                <div key={i} className={`workload-${component.toLowerCase()}-bg`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
