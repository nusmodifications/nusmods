// @flow

import React from 'react';
import { shallow } from 'enzyme';
import { Redirect } from 'react-router-dom';

import createHistory from 'test-utils/createHistory';
import type { Module, ModuleCode } from 'types/modules';

/* @var {Module} */
import cs1010s from '__mocks__/modules/CS1010S.json';
import ModuleNotFoundPage from 'views/errors/ModuleNotFoundPage';
import LoadingSpinner from 'views/components/LoadingSpinner';
import { waitFor } from 'test-utils/async';
import ApiError from 'views/errors/ApiError';
import { ModulePageContainerComponent } from './ModulePageContainer';

jest.mock('utils/error');

const CANONICAL = '/modules/CS1010S/programming-methodology';

type MakeContainerOptions = {
  module: ?Module,
  fetchModule: () => Promise<*>,
  archiveYear: ?string,
  moduleExists: boolean,
};

function make(moduleCode: ModuleCode, url: string, options: $Shape<MakeContainerOptions>) {
  const props: MakeContainerOptions = Object.assign(
    {}, // See https://github.com/facebook/flow/issues/6092
    {
      module: null,
      fetchModule: () => Promise.resolve(),
      archiveYear: null,
      moduleExists: true,
    },
    options,
  );

  return shallow(
    <ModulePageContainerComponent moduleCode={moduleCode} {...props} {...createHistory()} />,
  );
}

function assertRedirect(component, redirectTo = CANONICAL) {
  expect(component.type()).toEqual(Redirect);
  expect(component.props()).toMatchObject({ to: { pathname: redirectTo } });
}

describe(ModulePageContainerComponent, () => {
  test('should show 404 page when the module code does not exist', () => {
    expect(make('CS1234', '/modules/CS1234', { moduleExists: false }).type()).toEqual(
      ModuleNotFoundPage,
    );
  });

  test('should redirect to canonical URL', () => {
    assertRedirect(
      make('CS1010S', '/modules/cs1010s/programming-methodology', { module: cs1010s }),
    );
    assertRedirect(make('CS1010S', '/modules/CS1010S', { module: cs1010s }));
    assertRedirect(
      make('CS1010S', '/archive/CS1010S', { module: cs1010s, archiveYear: '2017/2018' }),
      '/archive/CS1010S/2017-2018/programming-methodology',
    );
  });

  test('should fetch module', () => {
    const fetchModule = jest.fn().mockReturnValue(Promise.resolve());
    const component = make('CS1010S', CANONICAL, { fetchModule });
    expect(component.type()).toEqual(LoadingSpinner);
    expect(fetchModule).toBeCalled();
  });

  test('should show error if module fetch failed', async () => {
    const fetchModule = jest.fn().mockReturnValue(Promise.reject(new Error('Test error')));
    const component = make('CS1010S', CANONICAL, { fetchModule });
    await waitFor(() => {
      component.update();
      return component.type() !== LoadingSpinner;
    });

    expect(component.type()).toEqual(ApiError);
    expect(fetchModule).toBeCalled();
  });
});
