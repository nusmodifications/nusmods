// @flow
import type { LocationShape, RouterHistory } from 'react-router-dom';

import React from 'react';
import axios from 'axios';
import { type ShallowWrapper, shallow } from 'enzyme';
import _ from 'lodash';
import qs from 'query-string';

import type { FilterGroupId, PageRange } from 'types/views';

import mockDom from 'test-utils/mockDom';
import createHistory from 'test-utils/createHistory';
import { nextTick, waitFor } from 'test-utils/async';
import FilterGroup from 'utils/filters/FilterGroup';
import { ModuleFinderContainerComponent, mergePageRange } from './ModuleFinderContainer';

type ActiveFilters = { [FilterGroupId]: string[] };
type Container = { component: ShallowWrapper, history: RouterHistory };

describe('<ModuleFinderContainer', () => {
  beforeEach(() => {
    mockDom();

    // Silence console.info calls
    jest.spyOn(console, 'info').mockImplementation(_.noop);

    // Mock axios to stop it from firing API requests
    jest
      .spyOn(axios, 'get')
      .mockImplementation(
        (url) =>
          url.includes('facultyDepartments')
            ? Promise.resolve({ data: {} })
            : Promise.resolve({ data: [] }),
      );
  });

  afterEach(() => {
    axios.get.mockRestore();
    console.info.mockRestore(); // eslint-disable-line no-console
  });

  async function createContainer(initialEntries?: string[]): Promise<Container> {
    const router = createHistory(initialEntries);

    const container = {
      history: router.history,
      component: shallow(
        <ModuleFinderContainerComponent resetModuleFinder={_.noop} searchTerm="" {...router} />,
      ),
    };

    await nextTick();
    return container;
  }

  function extractQueryString(location: LocationShape | string): string {
    const query =
      typeof location === 'string'
        ? qs.extract(location)
        : (location.search || '').replace(/^\?/, '');

    return decodeURIComponent(query);
  }

  function activeFilters({ component }: Container): ActiveFilters {
    // Helper function to extract a mapping of ID of active filters, which is an easier
    // data structure to assert against
    const active = {};

    _.values(component.state().filterGroups).forEach((group: FilterGroup<*>) => {
      const filters = group.activeFilters.map((filter) => filter.id);
      if (filters.length) active[group.id] = filters;
    });

    return active;
  }

  function interceptRouteChanges(history: RouterHistory): string[] {
    const calls = [];
    jest.spyOn(history, 'push').mockImplementation((location) => calls.push(location));
    jest.spyOn(history, 'replace').mockImplementation((location) => calls.push(location));
    return calls;
  }

  test('should read initial filter state from query string', async () => {
    expect(activeFilters(await createContainer())).toEqual({});

    expect(activeFilters(await createContainer(['?lecture=monday-morning']))).toEqual({
      lecture: ['monday-morning'],
    });

    expect(
      activeFilters(await createContainer(['?lecture=monday-morning,tuesday-afternoon'])),
    ).toEqual({ lecture: ['monday-morning', 'tuesday-afternoon'] });

    expect(
      activeFilters(await createContainer(['?lecture=monday-morning,tuesday-afternoon&mc=0'])),
    ).toEqual({
      lecture: ['monday-morning', 'tuesday-afternoon'],
      mc: ['0'],
    });
  });

  test('should update filter state when query string changes', async () => {
    // Simulate the URL changing to check that the filter state changes with it
    const container = await createContainer();

    container.history.push('?lecture=monday-morning,tuesday-afternoon');
    expect(activeFilters(container)).toEqual({
      lecture: ['monday-morning', 'tuesday-afternoon'],
    });

    container.history.push('?lecture=monday-morning,tuesday-evening');
    expect(activeFilters(container)).toEqual({
      lecture: ['monday-morning', 'tuesday-evening'],
    });

    container.history.replace('?mc=0');
    expect(activeFilters(container)).toEqual({
      mc: ['0'],
    });
  });

  test('#updateQueryString() should update query string', async () => {
    // Mock the two history manipulation methods by redirecting their inputs to
    // an array so we can assert against them to check that the filter state is
    // updated when the query string changes
    const container = await createContainer();
    const calls = interceptRouteChanges(container.history);

    const instance = container.component.instance();
    if (!(instance instanceof ModuleFinderContainerComponent)) return; // Make Flow happy

    // Simulate a number of calls to onFilterChange to ensure the query string is updated
    instance.onFilterChange(instance.state.filterGroups.mc.toggle('0'));
    instance.onFilterChange(instance.state.filterGroups.level.toggle('2'));
    instance.onFilterChange(instance.state.filterGroups.level.toggle('1'));
    instance.onFilterChange(instance.state.filterGroups.mc.toggle('0'));

    expect(calls.map(extractQueryString)).toEqual([
      'mc=0',
      'level=2&mc=0',
      'level=1,2&mc=0',
      'level=1,2',
    ]);
  });

  test('searches should update query string', async () => {
    // Mock the two history manipulation methods by redirecting their inputs to
    // an array so we can assert against them to check that the filter state is
    // updated when the query string changes
    const container = await createContainer();
    const calls = interceptRouteChanges(container.history);

    container.component.setProps({ searchTerm: 'new search' });
    await waitFor(() => calls.length > 0); // Wait until the route has changed

    expect(calls.map(extractQueryString)).toEqual(['q=new search']);
  });
});

describe('mergePageRange()', () => {
  let prev: PageRange;

  beforeEach(() => {
    prev = {
      current: 4,
      start: 3,
      loaded: 2,
    };
  });

  test('should set current page', () => {
    expect(mergePageRange(prev, { current: 5 })).toMatchObject({ current: 5 });
  });

  test('should update start and pages', () => {
    expect(mergePageRange(prev, { start: 1 })).toMatchObject({ start: 4 });
    expect(mergePageRange(prev, { start: 2 })).toMatchObject({ start: 5 });

    expect(mergePageRange(prev, { loaded: 1 })).toMatchObject({ loaded: 3 });
    expect(mergePageRange(prev, { loaded: 2 })).toMatchObject({ loaded: 4 });

    expect(mergePageRange(prev, { start: 1, loaded: 2 })).toMatchObject({ start: 4, loaded: 4 });
  });
});
