import React from 'react';
import { shallow } from 'enzyme';

import { SearchContainerComponent } from 'views/layout/GlobalSearchContainer';

const MODULES = [
  { ModuleCode: 'AS1010', ModuleTitle: 'Test' },
  { ModuleCode: 'BS1010', ModuleTitle: 'Test' },
  { ModuleCode: 'CS1010', ModuleTitle: 'Test' },
  { ModuleCode: 'DS1010', ModuleTitle: 'Test' },
  { ModuleCode: 'ES1010', ModuleTitle: 'Test' },
  { ModuleCode: 'FS1010', ModuleTitle: 'Test' },
  { ModuleCode: 'GS1010', ModuleTitle: 'Test' },
  { ModuleCode: 'HS1010', ModuleTitle: 'Test' },
];

const VENUES = ['A-1', 'B-1', 'C-1', 'D-1', 'E-1', 'F-1', 'G-1', 'H-1'];

function make(props = {}) {
  const allProps = {
    matchBreakpoint: true,
    fetchVenueList: jest.fn(),
    moduleList: MODULES,
    venueList: VENUES,
    ...props,
  };
  return shallow(<SearchContainerComponent {...allProps} />);
}

test('hides module when screen size is small', () => {
  expect(make().isEmptyRender()).toBeFalsy();
  expect(make({ matchBreakpoint: false }).isEmptyRender()).toBeTruthy();
});

test('fetches venue list', () => {
  const mock = jest.fn();
  make({ fetchVenueList: mock });
  expect(mock).toHaveBeenCalled();
});

test('shows at no choices when search is too short', () => {
  const instance = make().instance();
  const [mods, venues] = instance.getResults('1');
  expect(mods).toHaveLength(0);
  expect(venues).toHaveLength(0);
});

test('shows at most 7 choices when search returns plentiful', () => {
  const instance = make().instance();
  const [mods, venues] = instance.getResults('1 ');
  expect(mods).toHaveLength(4);
  expect(venues).toHaveLength(3);
});

test('shows at most 7 choices when there are many venues', () => {
  const instance = make({
    moduleList: MODULES.slice(0, 2),
    venueList: VENUES.slice(0, 4),
  }).instance();
  const [mods, venues] = instance.getResults('1 ');
  expect(mods).toHaveLength(2);
  expect(venues).toHaveLength(4);
});

test('shows at most 7 choices when there are many modules', () => {
  const instance = make({ venueList: VENUES.slice(0, 2) }).instance();
  const [mods, venues] = instance.getResults('1 ');
  expect(mods).toHaveLength(5);
  expect(venues).toHaveLength(2);
});

test('shows all results when there are few', () => {
  const instance = make().instance();
  const [mods, venues] = instance.getResults('A ');
  expect(mods).toHaveLength(1);
  expect(venues).toHaveLength(1);
});
