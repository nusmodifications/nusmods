import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { Redirect } from 'react-router-dom';

import { Module } from 'types/modules';
import ModuleNotFoundPage from 'views/errors/ModuleNotFoundPage';
import LoadingSpinner from 'views/components/LoadingSpinner';
import createHistory from 'test-utils/createHistory';
import { waitFor } from 'test-utils/async';
import ApiError from 'views/errors/ApiError';
import { CS1010S } from '__mocks__/modules';
import { ModuleCode } from '../../types/moduleBaseTypes';
import { ModulePageContainerComponent } from './ModulePageContainer';

jest.mock('utils/error');

const CANONICAL = '/modules/CS1010S/programming-methodology';

type MakeContainerOptions = {
  module: Module | null;
  fetchModule: () => Promise<any>;
  moduleExists: boolean;
  archiveYear?: string;
};

function make(moduleCode: ModuleCode, url: string, options: Partial<MakeContainerOptions>) {
  const props: MakeContainerOptions = {
    module: null,
    fetchModule: () => Promise.resolve(),
    moduleExists: true,
    ...options,
  };

  return shallow(
    <ModulePageContainerComponent moduleCode={moduleCode} {...props} {...createHistory()} />,
  );
}

function assertRedirect(component: ShallowWrapper, redirectTo = CANONICAL) {
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
      make('CS1010S', '/modules/cs1010s/programming-methodology', { module: CS1010S }),
    );
    assertRedirect(make('CS1010S', '/modules/CS1010S', { module: CS1010S }));
    assertRedirect(
      make('CS1010S', '/archive/CS1010S', { module: CS1010S, archiveYear: '2017/2018' }),
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
