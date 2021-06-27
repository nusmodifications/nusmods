import { render, screen } from '@testing-library/react';
import configureStore from 'bootstrapping/configure-store';
import { enableMpe } from 'featureFlags';
import produce from 'immer';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import reducers from 'reducers';
import { initAction } from 'test-utils/redux';

import Navtabs from './Navtabs';

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
        <Navtabs />,
      </Provider>
    </MemoryRouter>,
  );
}

describe(Navtabs, () => {
  test('should render into nav element', () => {
    make();
    if (enableMpe) {
      expect(screen.getAllByRole('link').map((elem) => elem.textContent)).toMatchInlineSnapshot(`
      Array [
        "Today",
        "Timetable",
        "Modules",
        "MPE",
        "Venues",
        "Settings",
        "Contribute",
        "Whispers",
      ]
    `);
    } else {
      expect(screen.getAllByRole('link').map((elem) => elem.textContent)).toMatchInlineSnapshot(`
      Array [
        "Today",
        "Timetable",
        "Modules",
        "Venues",
        "Settings",
        "Contribute",
        "Whispers",
      ]
    `);
    }
  });

  test('should show beta tabs if beta is true', () => {
    make({ settings: { beta: true } });
    if (enableMpe) {
      expect(screen.getAllByRole('link').map((elem) => elem.textContent)).toMatchInlineSnapshot(`
      Array [
        "Today",
        "Timetable",
        "Modules",
        "MPE",
        "Venues",
        "Planner",
        "Settings",
        "Contribute",
        "Whispers",
      ]
    `);
    } else {
      expect(screen.getAllByRole('link').map((elem) => elem.textContent)).toMatchInlineSnapshot(`
      Array [
        "Today",
        "Timetable",
        "Modules",
        "Venues",
        "Planner",
        "Settings",
        "Contribute",
        "Whispers",
      ]
    `);
    }
  });
});
