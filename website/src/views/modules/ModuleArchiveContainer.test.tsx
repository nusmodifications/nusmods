import { waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import axios, { AxiosResponse } from 'axios';

import configureStore from 'bootstrapping/configure-store';
import reducers from 'reducers';
import { mockDom, mockDomReset } from 'test-utils/mockDom';
import { initAction } from 'test-utils/redux';
import renderWithRouterMatch from 'test-utils/renderWithRouterMatch';
import { CS1010S } from '__mocks__/modules';

import { ModuleArchiveContainerComponent } from './ModuleArchiveContainer';

jest.mock('utils/error');

const cs1010sResponse: AxiosResponse = {
  data: CS1010S,
  status: 200,
  statusText: 'Ok',
  headers: {},
  config: {},
};

const notFoundResponse: AxiosResponse = {
  data: undefined,
  status: 404,
  statusText: 'Not found',
  headers: {},
  config: {},
};

const someOtherErrorResponse: AxiosResponse = {
  data: undefined,
  status: 500,
  statusText: 'Test error',
  headers: {},
  config: {},
};

const CANONICAL = '/archive/CS1010S/2017-2018/programming-methodology';

const initialState = reducers(undefined, initAction());

function make(location: string = CANONICAL) {
  const { store } = configureStore(initialState);

  return renderWithRouterMatch(
    <Provider store={store}>
      <ModuleArchiveContainerComponent />
    </Provider>,
    {
      path: '/archive/:moduleCode/:year/:slug?',
      location,
    },
  );
}

describe('ModuleArchiveContainerComponent', () => {
  let mockAxiosRequest: jest.SpiedFunction<typeof axios.request>;

  beforeEach(() => {
    mockDom();
    mockAxiosRequest = jest.spyOn(axios, 'request');
  });

  afterEach(() => {
    mockAxiosRequest.mockRestore();
    mockDomReset();
  });

  test('should show 404 page when the module code does not exist', async () => {
    mockAxiosRequest.mockRejectedValue(notFoundResponse);
    const {
      renderResult: { getByText },
    } = make('/archive/CS1234/2017-2018');
    await waitFor(() => expect(getByText(/module CS1234 not found/)).toBeInTheDocument());
  });

  test('should redirect to canonical URL', async () => {
    mockAxiosRequest.mockResolvedValue(cs1010sResponse);
    const { history } = make('/archive/CS1010S/2017-2018');
    await waitFor(() =>
      expect(history.location.pathname).toBe('/archive/CS1010S/2017-2018/programming-methodology'),
    );
  });

  test('should fetch module', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue(cs1010sResponse);
    expect(mockAxiosRequest).not.toBeCalled(); // Sanity check
    const {
      renderResult: { getByText },
    } = make();
    expect(getByText(/Loading/i)).toBeInTheDocument();
    await waitFor(() => expect(getByText(/CS1010S/)).toBeInTheDocument());
  });

  test('should show error if module fetch failed', async () => {
    mockAxiosRequest.mockRejectedValue(someOtherErrorResponse);
    const {
      renderResult: { getByText },
    } = make();
    await waitFor(() => expect(getByText(/can't load the module information/)).toBeInTheDocument());
  });
});
