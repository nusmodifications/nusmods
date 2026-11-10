import { render, within } from '@testing-library/react';
import { capitalize } from 'lodash-es';

import { Workload } from 'types/modules';
import ModuleWorkload from './ModuleWorkload';
import styles from './ModuleWorkload.scss';

function make(workload: Workload) {
  return render(<ModuleWorkload workload={workload} />).container;
}

// Each workload component's heading is coloured with a `workload-<component>-text` class,
// which identifies the component even when its label is abbreviated (e.g. "Lec").
function componentNames(container: HTMLElement): string[] {
  return within(container)
    .getAllByRole('heading', { level: 5 })
    .map((heading) => capitalize(/workload-([^-]+)-text/.exec(heading.className)?.[1]));
}

// The blocks are purely visual, so they are found by class name.
function blocks(container: HTMLElement) {
  return container.querySelectorAll(`.${styles.moduleWorkloadBlocks} > *`);
}

test('it should render workload correctly', () => {
  const container = make([2, 0, 2, 0, 6]);

  // Check total workload count
  expect(within(container).getByRole('heading', { level: 4 })).toHaveTextContent('10');

  // Check that the correct number of blocks have been rendered
  expect(blocks(container)).toHaveLength(10);
});

test('it should render non-integer workloads correctly', () => {
  const container = make([
    1.5, // 2 blocks
    0,
    0.25, // 1 block
    1.75, // 2 blocks
    6.5, // 7 blocks
  ]);

  expect(container.querySelectorAll(`.${styles.remainder}`)).toHaveLength(4);

  // Total hours should be 10
  expect(within(container).getByRole('heading', { level: 4 })).toHaveTextContent('10');

  // But total number of blocks should be 12
  expect(blocks(container)).toHaveLength(12);
});

test('it should rearrange components correctly', () => {
  // Do not sort - all workloads are below 10 hrs
  expect(componentNames(make([2, 0, 9, 0, 6]))).toEqual(['Lecture', 'Laboratory', 'Preparation']);

  // Do not sort - only last workload is 10+ hrs
  expect(componentNames(make([2, 0, 9, 0, 10]))).toEqual(['Lecture', 'Laboratory', 'Preparation']);

  // Sort - Prep is after Lab, but has less than 10 hrs of workload
  expect(componentNames(make([2, 0, 10, 0, 6]))).toEqual(['Lecture', 'Preparation', 'Laboratory']);
});
