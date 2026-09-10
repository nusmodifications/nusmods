import type { MockInstance } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import axios, { AxiosError, AxiosHeaders, AxiosResponse } from 'axios';

import { fetchArchiveRequest } from 'actions/constants';
import config from 'config';
import configureStore from 'bootstrapping/configure-store';
import reducers from 'reducers';
import { initAction } from 'test-utils/redux';
import renderWithRouterMatch from 'test-utils/renderWithRouterMatch';
import { SUCCESS } from 'types/reducers';
import { CS1010S } from '__mocks__/modules';
import { moduleArchive, modulePage } from 'views/routes/paths';

import ModuleHistoryMenu from './ModuleHistoryMenu';

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

const initialState = reducers(undefined, initAction());

function make(archiveYear?: string, loadedArchiveYear?: string) {
  const { store } = configureStore(
    loadedArchiveYear
      ? {
          ...initialState,
          requests: {
            ...initialState.requests,
            [fetchArchiveRequest('CS1010S', loadedArchiveYear)]: { status: SUCCESS },
          },
        }
      : initialState,
  );

  return renderWithRouterMatch(
    <Provider store={store}>
      <ModuleHistoryMenu
        moduleCode="CS1010S"
        moduleTitle="Programming Methodology"
        archiveYear={archiveYear}
      />
    </Provider>,
    {},
  );
}

describe(ModuleHistoryMenu, () => {
  let mockAxiosRequest: MockInstance<typeof axios.request>;

  beforeEach(() => {
    mockAxiosRequest = vi.spyOn(axios, 'request');
  });

  afterEach(() => {
    mockAxiosRequest.mockRestore();
  });

  test('fetches after render, shows loading, lists archive years, and avoids duplicate requests', async () => {
    let resolveRequests: (response: AxiosResponse) => void = () => undefined;
    const pendingResponse = new Promise<AxiosResponse>((resolve) => {
      resolveRequests = resolve;
    });
    mockAxiosRequest.mockReturnValue(pendingResponse);
    make();

    expect(screen.getByText('Course History')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'AY2025/2026' })).not.toBeInTheDocument();

    expect(await screen.findByRole('status')).toHaveTextContent('Loading historical data...');
    expect(mockAxiosRequest).toHaveBeenCalledTimes(config.archiveYears.length);

    resolveRequests(cs1010sResponse);
    const toggle = await screen.findByRole('button', { name: 'Show past courses' });

    const user = userEvent.setup();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'AY2025/2026' })).not.toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveTextContent('Hide past courses');

    const archiveLinks = screen
      .getAllByRole('link', { name: /^AY/ })
      .filter((element) => element.textContent?.startsWith('AY'));
    expect(archiveLinks.map((link) => link.textContent)).toEqual(
      [...config.archiveYears].reverse().map((year) => `AY${year}`),
    );
    expect(archiveLinks[0]).toHaveAttribute(
      'href',
      moduleArchive('CS1010S', '2025/2026', 'Programming Methodology'),
    );

    await user.keyboard('{Enter}');
    expect(toggle).toHaveTextContent('Show past courses');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
    expect(screen.queryByRole('link', { name: 'AY2025/2026' })).not.toBeInTheDocument();
    expect(mockAxiosRequest).toHaveBeenCalledTimes(config.archiveYears.length);
  });

  test('only lists archive years whose requests succeed', async () => {
    mockAxiosRequest.mockImplementation((request) => {
      if (request.url?.includes('2024-2025')) {
        return Promise.resolve(cs1010sResponse);
      }

      return Promise.reject(notFoundError);
    });
    make();

    const toggle = await screen.findByRole('button', { name: 'Show past courses' });
    await userEvent.click(toggle);
    expect(screen.getByRole('link', { name: 'AY2024/2025' })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'AY2025/2026' })).toBeNull();
    });
  });

  test('fetches the remaining archive years when an archive page already has data', async () => {
    mockAxiosRequest.mockResolvedValue(cs1010sResponse);
    make('2021/2022', '2021/2022');

    expect(mockAxiosRequest).toHaveBeenCalledTimes(config.archiveYears.length + 1);
    const user = userEvent.setup();
    const toggle = await screen.findByRole('button', { name: 'Show past courses' });
    expect(screen.queryByRole('link', { name: 'AY2021/2022' })).not.toBeInTheDocument();
    await user.click(toggle);
    expect(await screen.findByRole('link', { name: 'AY2021/2022' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'AY2025/2026' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^AY/ })).toHaveLength(config.archiveYears.length);
    expect(screen.getByRole('link', { name: 'AY2021/2022' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await user.click(toggle);
    expect(toggle).toHaveTextContent('Show past courses');
    expect(screen.queryByRole('link', { name: 'AY2021/2022' })).not.toBeInTheDocument();
  });

  test('shows an empty state when all archive requests fail', async () => {
    mockAxiosRequest.mockRejectedValue(notFoundError);
    make();

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('No historical data available');
    });
  });

  test('links from an archive page to the current course and supports keyboard navigation', async () => {
    const user = userEvent.setup();
    mockAxiosRequest.mockResolvedValue(cs1010sResponse);
    make('2024/2025');

    const toggle = await screen.findByRole('button', { name: 'Show past courses' });
    expect(screen.queryByRole('link', { name: /current course/i })).not.toBeInTheDocument();
    await user.click(toggle);
    const currentLink = await screen.findByRole('link', { name: /current course/i });
    await user.tab();
    expect(currentLink).toHaveFocus();
    expect(currentLink).toHaveAttribute('href', modulePage('CS1010S', 'Programming Methodology'));

    expect(await screen.findByRole('link', { name: 'AY2024/2025' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('omits the current-course link when the current course is unavailable', async () => {
    mockAxiosRequest.mockImplementation((request) => {
      if (request.url?.includes('2026-2027')) {
        return Promise.reject(notFoundError);
      }

      return Promise.resolve(cs1010sResponse);
    });
    make('2024/2025');

    const toggle = await screen.findByRole('button', { name: 'Show past courses' });
    await userEvent.click(toggle);
    expect(await screen.findByRole('link', { name: 'AY2025/2026' })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: /current course/i })).not.toBeInTheDocument();
    });
  });
});
