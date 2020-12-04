import { waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import axios, { AxiosError, AxiosResponse } from 'axios';

import configureStore from 'bootstrapping/configure-store';
import reducers from 'reducers';
import { mockDom, mockDomReset } from 'test-utils/mockDom';
import { initAction } from 'test-utils/redux';
import renderWithRouterMatch from 'test-utils/renderWithRouterMatch';
import { CS1010S } from '__mocks__/modules';

import { ModulePageContainerComponent } from './ModulePageContainer';

jest.mock('views/components/RandomKawaii');
jest.mock('utils/error');

const cs1010sResponse: AxiosResponse = {
  data: CS1010S,
  status: 200,
  statusText: 'Ok',
  headers: {},
  config: {},
};

const notFoundError: Partial<AxiosError> = {
  response: {
    data: undefined,
    status: 404,
    statusText: 'Not found',
    headers: {},
    config: {},
  },
};

const someOtherError: Partial<AxiosError> = {
  response: {
    data: undefined,
    status: 500,
    statusText: 'Test error',
    headers: {},
    config: {},
  },
};

const CANONICAL = '/modules/CS1010S/programming-methodology';

const initialState = reducers(undefined, initAction());

function make(location: string = CANONICAL) {
  const { store } = configureStore(initialState);

  return renderWithRouterMatch(
    <Provider store={store}>
      <ModulePageContainerComponent />
    </Provider>,
    {
      path: '/modules/:moduleCode/:slug?',
      location,
    },
  );
}

describe(ModulePageContainerComponent, () => {
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
    mockAxiosRequest.mockRejectedValue(notFoundError);
    const {
      renderResult: { getByText },
    } = make('/modules/CS1234');
    await waitFor(() => expect(getByText(/module CS1234 not found/)).toBeInTheDocument());
  });

  test('should redirect to canonical URL', async () => {
    mockAxiosRequest.mockResolvedValue(cs1010sResponse);
    const { history } = make('/modules/CS1010S');
    await waitFor(() =>
      expect(history.location.pathname).toBe('/modules/CS1010S/programming-methodology'),
    );
  });

  test('should fetch module', async () => {
    mockAxiosRequest.mockResolvedValue(cs1010sResponse);
    expect(mockAxiosRequest).not.toBeCalled(); // Sanity check
    const {
      renderResult: { getByText },
    } = make();
    expect(getByText(/Loading/i)).toBeInTheDocument();
    // Expect module information to be displayed
    await waitFor(() => expect(getByText(/This module introduces/)).toBeInTheDocument());
    // Expect component to fetch
    expect(mockAxiosRequest).toBeCalled();
  });

  test('should show error if module fetch failed', async () => {
    mockAxiosRequest.mockRejectedValue(someOtherError);
    const {
      renderResult: { getByText },
    } = make();
    await waitFor(() => expect(getByText(/can't load the module information/)).toBeInTheDocument());
  });
});
