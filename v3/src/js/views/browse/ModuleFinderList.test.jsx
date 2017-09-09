// @flow

import React from 'react';
import { shallow } from 'enzyme';
import { noop } from 'lodash';

import cs1010s from '__mocks__/modules/CS1010S.json';

import ModuleFinderList from './ModuleFinderList';

function makeInstance(
  modules = [],
  pages = { current: 0, start: 0, loaded: 5 },
): ModuleFinderList {
  const wrapper = shallow(
    <ModuleFinderList
      modules={modules}
      page={pages}
      onPageChange={noop}
    />,
  );
  return wrapper.instance();
}

test('start() should start at 1', () => {
  const instance = makeInstance();
  expect(instance.start(0)).toEqual(1);
});

test('end() should equal to total number of modules for the last page', () => {
  const instance = makeInstance([cs1010s, cs1010s]);
  expect(instance.end(0)).toBe(2);
});
