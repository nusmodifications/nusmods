import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import _ from 'lodash';

import { Workload } from 'types/moduleBaseTypes';
import ModuleWorkload from './ModuleWorkload';

function make(workload: Workload) {
  return shallow(<ModuleWorkload workload={workload} />);
}

// Get the component name from anything that represents a component
function extractComponent(node: ShallowWrapper): string {
  if (node.hasClass('module-workload-component')) {
    return extractComponent(node.find('h5').first());
  }

  if (node.hasClass('module-workload-blocks')) {
    return extractComponent(node.children().first());
  }

  const match = node.get(0).props.className.match(/workload-([^-]+)/);
  return _.capitalize(match[1]);
}

test('it should render workload correctly', () => {
  const component = make([2, 0, 2, 0, 6]);

  // Check total workload count
  const heading = component.find('h4').first();
  expect(heading.text()).toEqual(expect.stringContaining('10'));

  // Check that the correct number of blocks have been rendered
  expect(component.find('.module-workload-blocks').children()).toHaveLength(10);
});

test('it should render non-integer workloads correctly', () => {
  const component = make([
    1.5, // 2 blocks
    0,
    0.25, // 1 block
    1.75, // 2 blocks
    6.5, // 7 blocks
  ]);

  expect(component.find('.remainder')).toHaveLength(4);

  // Total hours should be 10
  const heading = component.find('h4').first();
  expect(heading.text()).toEqual(expect.stringContaining('10'));

  // But total number of blocks should be 12
  expect(component.find('.module-workload-blocks').children()).toHaveLength(12);
});

test('it should rearrange components correctly', () => {
  // Do not sort - all workloads are below 10 hrs
  const noSorting = make([2, 0, 9, 0, 6]);

  expect(noSorting.find('h5').map(extractComponent)).toEqual([
    'Lecture',
    'Laboratory',
    'Preparation',
  ]);

  // Do not sort - only last workload is 10+ hrs
  const alreadySorted = make([2, 0, 9, 0, 10]);

  expect(alreadySorted.find('h5').map(extractComponent)).toEqual([
    'Lecture',
    'Laboratory',
    'Preparation',
  ]);

  // Sort - Prep is after Lab, but has less than 10 hrs of workload
  const needsSorting = make([2, 0, 10, 0, 6]);

  expect(needsSorting.find('h5').map(extractComponent)).toEqual([
    'Lecture',
    'Preparation',
    'Laboratory',
  ]);
});
