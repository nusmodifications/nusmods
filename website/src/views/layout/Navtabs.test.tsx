import { render } from '@testing-library/react';
import configureStore from 'bootstrapping/configure-store';
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
  return render(
    <MemoryRouter>
      <Provider store={store}>
        <Navtabs />,
      </Provider>
    </MemoryRouter>,
  );
}

describe(Navtabs, () => {
  test('should render into nav element', () => {
    const { container } = make();
    expect(Array.from(container.getElementsByTagName('a')).map((elem) => elem.textContent))
      .toMatchInlineSnapshot(`
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
    expect(container).toMatchSnapshot();
  });

  test('should show beta tabs if beta is true', () => {
    const { container } = make({ settings: { beta: true } });
    expect(Array.from(container.getElementsByTagName('a')).map((elem) => elem.textContent))
      .toMatchInlineSnapshot(`
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
    expect(container).toMatchSnapshot();
  });
});
