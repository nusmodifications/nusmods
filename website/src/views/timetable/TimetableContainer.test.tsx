import { screen, waitFor } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import axios, { AxiosHeaders, AxiosResponse } from 'axios';
import { produce } from 'immer';

import type { Semester } from 'types/modules';
import type { Dispatch } from 'types/redux';

import { FETCH_MODULE, FETCH_MODULE_LIST } from 'actions/constants';
import { setTimetable } from 'actions/timetables';
import configureStore from 'bootstrapping/configure-store';
import config from 'config';
import { SUCCESS_KEY } from 'middlewares/requests-middleware';
import reducers from 'reducers';
import { mockDom, mockDomReset } from 'test-utils/mockDom';
import { initAction } from 'test-utils/redux';
import renderWithRouterMatch from 'test-utils/renderWithRouterMatch';

import { timetablePage, timetableShare } from 'views/routes/paths';

import { BFS1001, CS1010S, CS3216 } from '__mocks__/modules';
import modulesList from '__mocks__/moduleList.json';

import { TimetableContainerComponent } from './TimetableContainer';

/**
 * A module that exists in our mock `moduleList` but which is also *not*
 * pre-loaded into `moduleBank`. Intended to be used by tests that expect
 * modules to be fetched.
 */
const moduleCodeThatCanBeLoaded = 'BFS1001';

const bfs1001Response: AxiosResponse = {
  data: BFS1001,
  status: 200,
  statusText: 'Ok',
  headers: {},
  config: {
    headers: new AxiosHeaders(),
  },
};

const relevantStoreContents = {
  app: {
    activeSemester: 1,
  },
};

const initialState = reducers(undefined, initAction());

function make(
  location: string,
  options: {
    storeOverrides?: Partial<typeof relevantStoreContents>;
    renderOptions?: Omit<RenderOptions, 'queries'> | undefined;
  } = {},
) {
  const { store } = configureStore(
    produce(initialState, (draft) => {
      draft.app.activeSemester =
        options.storeOverrides?.app?.activeSemester ?? relevantStoreContents.app.activeSemester;
    }),
  );

  // Populate moduleBank moduleList using "succeeded" requests-middleware requests
  store.dispatch({ type: SUCCESS_KEY(FETCH_MODULE_LIST), payload: modulesList });

  return {
    store,
    ...renderWithRouterMatch(
      <Provider store={store}>
        <TimetableContainerComponent />
      </Provider>,
      {
        path: '/timetable/:semester?/:action?',
        location,
      },
      options.renderOptions,
    ),
  };
}

describe(TimetableContainerComponent, () => {
  let mockAxiosRequest: jest.SpiedFunction<typeof axios.request>;

  beforeEach(() => {
    mockDom();
    mockAxiosRequest = jest.spyOn(axios, 'request');
    mockAxiosRequest.mockResolvedValue(bfs1001Response);
  });

  afterEach(() => {
    mockAxiosRequest.mockRestore();
    mockDomReset();
  });

  test('should redirect to activeSemester when semester is empty', async () => {
    const semesters: Semester[] = Object.keys(config.shortSemesterNames).map(Number);
    expect(semesters.length).toBeGreaterThan(0); // Sanity check: `semesters` cannot be empty

    // Use for-of loop as we `waitFor` must be executed sequentially.
    // eslint-disable-next-line no-restricted-syntax
    for (const semester of semesters) {
      const { history } = make('/timetable', {
        storeOverrides: { app: { activeSemester: semester } },
      });
      // eslint-disable-next-line no-await-in-loop
      await waitFor(() => expect(history.location.pathname).toBe(timetablePage(semester)));
    }
  });

  test('should redirect to homepage when the URL is invalid', async () => {
    function expectRedirectToHomepageFrom(from: string) {
      const homepage = timetablePage(relevantStoreContents.app.activeSemester);
      const { history } = make(from);
      return waitFor(() => expect(history.location.pathname).toBe(homepage));
    }
    await expectRedirectToHomepageFrom('/timetable/hello');
    await expectRedirectToHomepageFrom('/timetable/sem-3');
    await expectRedirectToHomepageFrom('/timetable/sem-1/hello');
    await expectRedirectToHomepageFrom('/timetable/2017-2018');
    await expectRedirectToHomepageFrom('/timetable/2017-2018/sem2');
    await expectRedirectToHomepageFrom('/timetable/2017-2018/share');
    await expectRedirectToHomepageFrom('/timetable/2017-2018/v1');
  });

  test('should eventually display imported timetable if there is one', async () => {
    const semester = 1;
    const importedTimetable = {
      [moduleCodeThatCanBeLoaded]: { 'Sectional Teaching': 'A1' }, // BFS1001 doesn't have Lecture, only SectionalTeaching
    };
    const location = timetableShare(semester, importedTimetable, []);
    make(location);

    // Expect spinner when loading modules
    expect(screen.getByText(/Loading/)).toBeInTheDocument();

    // Expect import header to be present
    expect(await screen.findByRole('button', { name: 'Import' })).toBeInTheDocument();

    // Expect imported module info to be displayed
    expect(screen.getByText(/Personal Development & Career Management/)).toBeInTheDocument();

    // Expect correct network calls to be made
    expect(mockAxiosRequest).toHaveBeenCalledTimes(1);

    // Expect there to be a rendered timetable cell (Sectional Teaching)
    expect(screen.getByText(/SEC/)).toBeInTheDocument();
  });

  test('should eventually display imported timetable without any modules loaded', async () => {
    const semester = 1;
    const importedTimetable = { [moduleCodeThatCanBeLoaded]: { 'Sectional Teaching': 'A1' } };
    const location = timetableShare(semester, importedTimetable, [moduleCodeThatCanBeLoaded]);
    make(location);

    // Expect spinner when loading modules
    expect(screen.getByText(/Loading/)).toBeInTheDocument();

    // Expect import header to be present
    expect(await screen.findByRole('button', { name: 'Import' })).toBeInTheDocument();

    // Expect imported module info to be displayed
    expect(screen.getByText(/Personal Development & Career Management/)).toBeInTheDocument();

    // Expect correct network calls to be made
    expect(mockAxiosRequest).toHaveBeenCalledTimes(1);

    // Expect there to not be a rendered timetable cell (Sectional Teaching)
    expect(screen.queryByText(/SEC/)).not.toBeInTheDocument();
  });

  test('should ignore invalid modules in imported timetable', () => {
    const semester = 1;
    const importedTimetable = { TRUMP2020: { Lecture: '1' } };
    const location = timetableShare(semester, importedTimetable, []);
    make(location);

    // Expect nothing to be fetched and the invalid module to be ignored
    expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    expect(mockAxiosRequest).not.toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/TRUMP2020/)).not.toBeInTheDocument();

    // Expect import header to still be present
    expect(screen.getByRole('button', { name: 'Import' })).toBeInTheDocument();
  });

  test('should display saved timetable when there is no imported timetable', async () => {
    const semester = 1;
    const location = timetablePage(semester);
    // TODO: Get this test to work with the new createRoot API, i.e. legacyRoot = false.
    const { store } = make(location, { renderOptions: { legacyRoot: true } });

    // Populate moduleBank using "succeeded" requests-middleware requests
    store.dispatch({ type: SUCCESS_KEY(FETCH_MODULE), payload: CS1010S });
    store.dispatch({ type: SUCCESS_KEY(FETCH_MODULE), payload: CS3216 });

    // Populate mock timetable
    const timetable = { CS1010S: { Lecture: '1' }, CS3216: { Lecture: '1' } };
    (store.dispatch as Dispatch)(setTimetable(semester, timetable));

    // Expect nothing to be fetched as timetable exists in `moduleBank`.
    expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    expect(mockAxiosRequest).not.toHaveBeenCalled();

    // Expect imported module info to be displayed
    expect(screen.getByText(/Programming Methodology/)).toBeInTheDocument();

    // Expect import header not to be present
    expect(screen.queryByRole('button', { name: 'Import' })).not.toBeInTheDocument();
  });
});
