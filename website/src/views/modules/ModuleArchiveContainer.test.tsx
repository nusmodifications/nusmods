import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { Redirect } from 'react-router-dom';

import { Module, ModuleCode } from 'types/modules';
import ModuleNotFoundPage from 'views/errors/ModuleNotFoundPage';
import LoadingSpinner from 'views/components/LoadingSpinner';
import createHistory from 'test-utils/createHistory';
import { waitFor } from 'test-utils/async';
import ApiError from 'views/errors/ApiError';
import { CS1010S } from '__mocks__/modules';

import { ModuleArchiveContainerComponent } from './ModuleArchiveContainer';

jest.mock('utils/error');

const CANONICAL = '/archive/CS1010S/2019-2020/programming-methodology';

type MakeContainerOptions = {
  module: Module | null;
  fetchModule: () => Promise<any>;
  archiveYear: string;
};

function make(moduleCode: ModuleCode, url: string, options: Partial<MakeContainerOptions> = {}) {
  const props: MakeContainerOptions = {
    module: null,
    fetchModule: () => Promise.resolve(),
    archiveYear: '2019/2020',
    ...options,
  };

  return shallow(
    <ModuleArchiveContainerComponent moduleCode={moduleCode} {...props} {...createHistory()} />,
  );
}

function assertRedirect(component: ShallowWrapper, redirectTo = CANONICAL) {
  expect(component.type()).toEqual(Redirect);
  expect(component.props()).toMatchObject({ to: { pathname: redirectTo } });
}

describe(ModuleArchiveContainerComponent, () => {
  test('should show 404 page when the module code does not exist', () => {
    const wrapper = make('CS1234', '/archive/CS1234/2017-2018');
    wrapper.setState({ error: { response: { status: 404 } } });
    expect(wrapper.type()).toEqual(ModuleNotFoundPage);
  });

  test('should redirect to canonical URL', () => {
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
