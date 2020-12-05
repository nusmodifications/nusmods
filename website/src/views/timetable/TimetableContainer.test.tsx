import { waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import axios from 'axios';
import produce from 'immer';

import type { Semester } from 'types/modules';

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

import { CS1010S, CS3216 } from '__mocks__/modules';
import modulesList from '__mocks__/moduleList.json';

import { TimetableContainerComponent } from './TimetableContainer';

/**
 * A module that exists in our mock `moduleList` but which is also *not*
 * pre-loaded into `moduleBank`. Intended to be used by tests that expect
 * modules to be fetched.
 */
const moduleCodeThatCanBeLoaded = 'BFS1001';

const relevantStoreContents = {
  app: {
    activeSemester: 1,
  },
};

const initialState = reducers(undefined, initAction());

function make(location: string, storeOverrides: Partial<typeof relevantStoreContents> = {}) {
  const { store } = configureStore(
    produce(initialState, (draft) => {
      draft.app.activeSemester =
        storeOverrides.app?.activeSemester ?? relevantStoreContents.app.activeSemester;
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
    ),
  };
}

describe(TimetableContainerComponent, () => {
  let mockAxiosRequest: jest.SpiedFunction<typeof axios.request>;

  beforeEach(() => {
    mockDom();
    mockAxiosRequest = jest.spyOn(axios, 'request');
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
      // eslint-disable-next-line no-await-in-loop
      await waitFor(() => {
        const { history } = make('/timetable', { app: { activeSemester: semester } });
        return expect(history.location.pathname).toBe(timetablePage(semester));
      });
    }
  });

  test('should redirect to homepage when the URL is invalid', async () => {
    function expectRedirectToHomepageFrom(from: string) {
      return waitFor(() => {
        const homepage = timetablePage(relevantStoreContents.app.activeSemester);
        const { history } = make(from);
        return expect(history.location.pathname).toBe(homepage);
      });
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
    const importedTimetable = { [moduleCodeThatCanBeLoaded]: { Lecture: '1' } };
    const location = timetableShare(semester, importedTimetable);
    const {
      renderResult: { getByRole, getByText },
    } = make(location);

    // Expect spinner when loading modules
    expect(getByText(/Loading/)).toBeInTheDocument();

    // Expect import header to be present
    await waitFor(() => expect(getByRole('button', { name: 'Import' })).toBeInTheDocument());

    // Expect imported module info to be displayed
    expect(getByText(/Personal Development & Career Management/)).toBeInTheDocument();

    // Expect correct network calls to be made
    expect(mockAxiosRequest).toHaveBeenCalledTimes(1);
  });

  test('should ignore invalid modules in imported timetable', () => {
    const semester = 1;
    const importedTimetable = { TRUMP2020: { Lecture: '1' } };
    const location = timetableShare(semester, importedTimetable);
    const {
      renderResult: { getByRole, queryByText },
    } = make(location);

    // Expect nothing to be fetched and the invalid module to be ignored
    expect(queryByText(/Loading/)).not.toBeInTheDocument();
    expect(mockAxiosRequest).not.toHaveBeenCalledTimes(1);
    expect(queryByText(/TRUMP2020/)).not.toBeInTheDocument();

    // Expect import header to still be present
    expect(getByRole('button', { name: 'Import' })).toBeInTheDocument();
  });

  test('should display saved timetable when there is no imported timetable', () => {
    const semester = 1;
    const location = timetablePage(semester);
    const {
      store,
      renderResult: { getByText, queryByRole, queryByText },
    } = make(location);

    // Populate moduleBank using "succeeded" requests-middleware requests
    store.dispatch({ type: SUCCESS_KEY(FETCH_MODULE), payload: CS1010S });
    store.dispatch({ type: SUCCESS_KEY(FETCH_MODULE), payload: CS3216 });

    // Populate mock timetable
    const timetable = { CS1010S: { Lecture: '1' }, CS3216: { Lecture: '1' } };
    store.dispatch(setTimetable(semester, timetable));

    // Expect nothing to be fetched as timetable exists in `moduleBank`.
    expect(queryByText(/Loading/)).not.toBeInTheDocument();
    expect(mockAxiosRequest).not.toHaveBeenCalled();

    // Expect imported module info to be displayed
    expect(getByText(/Programming Methodology/)).toBeInTheDocument();

    // Expect import header not to be present
    expect(queryByRole('button', { name: 'Import' })).not.toBeInTheDocument();
  });
});
