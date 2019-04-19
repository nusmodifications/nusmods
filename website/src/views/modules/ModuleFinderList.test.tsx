import * as React from 'react';
import { shallow } from 'enzyme';
import { noop, last } from 'lodash';

import cs1010s from '__mocks__/modules/CS1010S.json';

import { Module } from 'types/modules';
import ModuleFinderList from './ModuleFinderList';

function makeInstance(
  modules: Module[] = [],
  pages = { current: 0, start: 0, loaded: 5 },
  onPageChange = noop,
): ModuleFinderList {
  const wrapper = shallow<ModuleFinderList>(
    <ModuleFinderList modules={modules} page={pages} onPageChange={onPageChange} />,
  );
  return wrapper.instance();
}

function lastCall(fn: jest.Mock) {
  return last(fn.mock.calls)![0];
}

test('start() should start at 1', () => {
  const instance = makeInstance();
  expect(instance.start(0)).toEqual(1);
});

test('end() should equal to total number of modules for the last page', () => {
  const instance = makeInstance([cs1010s as Module, cs1010s as Module]);
  expect(instance.end(0)).toBe(2);
});

test('onEnterPage() should set current to the correct page', () => {
  const onPageChange = jest.fn();

  makeInstance([], { start: 0, current: 0, loaded: 1 }, onPageChange).onEnterPage(1);
  expect(lastCall(onPageChange)).toHaveProperty('current', 1);

  makeInstance([], { start: 0, current: 1, loaded: 1 }, onPageChange).onEnterPage(2);
  expect(lastCall(onPageChange)).toHaveProperty('current', 2);

  makeInstance([], { start: 5, current: 1, loaded: 1 }, onPageChange).onEnterPage(1);
  expect(lastCall(onPageChange)).toHaveProperty('current', 6);
});

test('onEnterPage() should increment loaded page if it is near the end', () => {
  const onPageChange = jest.fn();

  makeInstance([], { start: 0, current: 0, loaded: 1 }, onPageChange).onEnterPage(1);
  expect(lastCall(onPageChange)).toHaveProperty('loaded', 1);

  makeInstance([], { start: 5, current: 1, loaded: 1 }, onPageChange).onEnterPage(1);
  expect(lastCall(onPageChange)).toHaveProperty('loaded', 1);

  // Pages should not be loaded when scrolling up
  makeInstance([], { start: 0, current: 2, loaded: 3 }, onPageChange).onEnterPage(1);
  expect(lastCall(onPageChange)).not.toHaveProperty('loaded');

  makeInstance([], { start: 5, current: 2, loaded: 3 }, onPageChange).onEnterPage(1);
  expect(lastCall(onPageChange)).not.toHaveProperty('loaded');
});
