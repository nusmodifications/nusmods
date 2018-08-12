// @flow

import React from 'react';
import { shallow } from 'enzyme';
import { Redirect } from 'react-router-dom';

import createHistory from 'test-utils/createHistory';
import type { ModuleCodeMap } from 'types/reducers';
import type { Module, ModuleCode } from 'types/modules';

/* @var {Module} */
import cs1010s from '__mocks__/modules/CS1010S.json';
import ModuleNotFoundPage from 'views/errors/ModuleNotFoundPage';
import LoadingSpinner from 'views/components/LoadingSpinner';
import { waitFor } from 'test-utils/async';
import ErrorPage from 'views/errors/ErrorPage';
import { ModulePageContainerComponent } from './ModulePageContainer';

const CANONICAL = '/modules/CS1010S/programming-methodology';
const MODULE_CODE_MAP: ModuleCodeMap = {
  CS1010S: {
    ModuleCode: 'CS1010S',
    ModuleTitle: 'Programming Methodology',
    Semesters: [1, 2],
  },
};

function make(
  moduleCode: ModuleCode,
  url: string,
  module: ?Module = null,
  fetchModule: (ModuleCode) => Promise<*> = () => Promise.resolve(),
) {
  return shallow(
    <ModulePageContainerComponent
      moduleCode={moduleCode}
      moduleCodes={MODULE_CODE_MAP}
      module={module}
      fetchModule={fetchModule}
      {...createHistory()}
    />,
  );
}

function assertRedirect(component, redirectTo = CANONICAL) {
  expect(component.type()).toEqual(Redirect);
  expect(component.props()).toMatchObject({ to: { pathname: redirectTo } });
}

test('should show 404 page when the module code does not exist', () => {
  expect(make('CS1234', '/modules/CS1234').type()).toEqual(ModuleNotFoundPage);
});

test('should redirect to canonical URL', () => {
  assertRedirect(make('CS1010S', '/modules/cs1010s/programming-methodology', cs1010s));
  assertRedirect(make('CS1010S', '/modules/CS1010S', cs1010s));
});

test('should fetch module', () => {
  const fetchModule = jest.fn().mockReturnValue(Promise.resolve());
  const component = make('CS1010S', CANONICAL, null, fetchModule);
  expect(component.type()).toEqual(LoadingSpinner);
  expect(fetchModule).toBeCalledWith('CS1010S');
});

test('should show error if module fetch failed', async () => {
  const fetchModule = jest.fn().mockReturnValue(Promise.reject(new Error('Test error')));
  const component = make('CS1010S', CANONICAL, null, fetchModule);
  await waitFor(() => {
    component.update();
    return component.type() !== LoadingSpinner;
  });

  expect(component.type()).toEqual(ErrorPage);
  expect(fetchModule).toBeCalledWith('CS1010S');
});
