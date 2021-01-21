import { render, screen } from '@testing-library/react';
import configureStore from 'bootstrapping/configure-store';
import produce from 'immer';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import reducers from 'reducers';
import { mockDom, mockDomReset } from 'test-utils/mockDom';
import { initAction } from 'test-utils/redux';

import Navbar from './Navbar';

const relevantStoreContents = {
  app: { activeSemester: 1 },
  settings: { beta: false },
};

const initialState = reducers(undefined, initAction());

function make(storeOverrides: Partial<typeof relevantStoreContents> = {}) {
  const { store } = configureStore(
    produce(initialState, (draft) => {
      draft.app.activeSemester =
        storeOverrides.app?.activeSemester ?? relevantStoreContents.app.activeSemester;
      draft.settings.beta = storeOverrides.settings?.beta ?? relevantStoreContents.settings.beta;
    }),
  );
  render(
    <MemoryRouter>
      <Provider store={store}>
        <Navbar />,
      </Provider>
    </MemoryRouter>,
  );
}

describe(Navbar, () => {
  beforeEach(() => {
    mockDom();
  });

  afterEach(() => {
    mockDomReset();
  });

  test('should render nav links', () => {
    make();
    expect(screen.getAllByRole('link').map((elem) => elem.textContent)).toMatchInlineSnapshot(`
      Array [
        "",
        "Today",
        "Timetable",
        "Modules",
        "Venues",
        "Settings",
        "Contribute",
        "NUS Business",
        "NUSWhispers",
      ]
    `);
  });

  test('should show beta nav links if beta is true', () => {
    make({ settings: { beta: true } });
    expect(screen.getAllByRole('link').map((elem) => elem.textContent)).toMatchInlineSnapshot(`
      Array [
        "",
        "Today",
        "Timetable",
        "Modules",
        "Venues",
        "PlannerBeta",
        "Settings",
        "Contribute",
        "NUS Business",
        "NUSWhispers",
      ]
    `);
  });
});
