import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchkitManager } from 'searchkit';

import renderWithRouterMatch from 'test-utils/renderWithRouterMatch';
import ModuleFinderApiError from './ModuleFinderApiError';

jest.mock('views/components/RandomKawaii');

const mockedUrl = 'https://someEsUrl.com';
const CANONICAL = '/modules?q=GER1000&sem[0]=1&sem[1]=2&sem[2]=3&sem[3]=4';

const searchkit = new SearchkitManager(mockedUrl, {
  searchUrlPath: '_search?track_total_hits=true',
});

describe(ModuleFinderApiError, () => {
  test('should render', async () => {
    const { container } = render(<ModuleFinderApiError searchkit={searchkit} />);
    expect(container).toMatchSnapshot();
  });

  test('should render with url', async () => {
    const { view } = renderWithRouterMatch(<ModuleFinderApiError searchkit={searchkit} />, {
      path: '/modules',
      location: CANONICAL,
    });
    const { container } = view;
    expect(container).toMatchSnapshot();
  });

  // TODO: Tech Debt - Check if this test can correctly perform an assertion on `history`
  test('should have unchanged url when search is retried', async () => {
    const { history, view } = renderWithRouterMatch(
      <ModuleFinderApiError searchkit={searchkit} />,
      {
        path: '/modules',
        location: CANONICAL,
      },
    );
    expect(history.location.pathname).toBe('/modules');
    expect(history.location.search).toBe('?q=GER1000&sem[0]=1&sem[1]=2&sem[2]=3&sem[3]=4');

    const { getByRole } = view;
    searchkit.history = {
      push: jest.fn(),
    };
    const tryAgainButton = getByRole('button');
    userEvent.click(tryAgainButton);
    expect(searchkit.history.push).toHaveBeenCalled();
    expect(history.location.pathname).toBe('/modules');
    expect(history.location.search).toBe('?q=GER1000&sem[0]=1&sem[1]=2&sem[2]=3&sem[3]=4');
  });
});
