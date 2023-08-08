import { screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import axios, { AxiosError, AxiosHeaders, AxiosResponse } from 'axios';

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
  config: {
    headers: new AxiosHeaders(),
  },
};

const notFoundError: Partial<AxiosError> = {
  response: {
    data: undefined,
    status: 404,
    statusText: 'Not found',
    headers: {},
    config: {
      headers: new AxiosHeaders(),
    },
  },
};

const someOtherError: Partial<AxiosError> = {
  response: {
    data: undefined,
    status: 500,
    statusText: 'Test error',
    headers: {},
    config: {
      headers: new AxiosHeaders(),
    },
  },
};

const CANONICAL = '/courses/CS1010S/programming-methodology';

const initialState = reducers(undefined, initAction());

function make(location: string = CANONICAL) {
  const { store } = configureStore(initialState);

  return renderWithRouterMatch(
    <Provider store={store}>
      <ModulePageContainerComponent />
    </Provider>,
    {
      path: '/courses/:moduleCode/:slug?',
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
    make('/courses/CS1234');
    expect(await screen.findByText(/module CS1234 not found/)).toBeInTheDocument();
  });

  test('should redirect to canonical URL', async () => {
    mockAxiosRequest.mockResolvedValue(cs1010sResponse);
    const { history } = make('/courses/CS1010S');
    await waitFor(() =>
      expect(history.location.pathname).toBe('/courses/CS1010S/programming-methodology'),
    );
  });

  test('should fetch module', async () => {
    mockAxiosRequest.mockResolvedValue(cs1010sResponse);
    expect(mockAxiosRequest).not.toBeCalled(); // Sanity check
    make();
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    // Expect module information to be displayed
    expect(await screen.findByText(/This course introduces/)).toBeInTheDocument();
    // Expect component to fetch
    expect(mockAxiosRequest).toBeCalled();
  });

  test('should show error if module fetch failed', async () => {
    mockAxiosRequest.mockRejectedValue(someOtherError);
    make();
    expect(await screen.findByText(/can't load the course information/)).toBeInTheDocument();
  });
});
