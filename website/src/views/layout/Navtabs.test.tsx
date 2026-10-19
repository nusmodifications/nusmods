import { render, screen } from '@testing-library/react';
import { produce } from 'immer';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import config, { convertCPExWindow, isCPExAvailableAt } from 'config';
import configureStore from 'bootstrapping/configure-store';
import reducers from 'reducers';
import { initAction } from 'test-utils/redux';

import Navtabs from './Navtabs';

const relevantStoreContents = {
  app: { activeSemester: 1 },
  settings: { beta: false },
};

const initialState = reducers(undefined, initAction());
const testWindow = convertCPExWindow({
  start: '2026-10-20T09:00:00+08:00',
  end: '2026-10-22T17:00:00+08:00',
});
if (!testWindow) throw new Error('Invalid CPEx navigation test window');

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
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test('hides the CPEx tab when the shared window is closed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-20T08:59:59.999+08:00'));
    vi.spyOn(config, 'isCPExAvailable').mockImplementation((now = new Date()) =>
      isCPExAvailableAt(now, testWindow, true, false),
    );
    make();
    expect(screen.queryByRole('link', { name: 'CPEx' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Courses' })).toBeInTheDocument();
  });

  test('shows the CPEx tab when the shared window is open', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-20T09:00:00+08:00'));
    vi.spyOn(config, 'isCPExAvailable').mockImplementation((now = new Date()) =>
      isCPExAvailableAt(now, testWindow, true, false),
    );
    make();
    expect(screen.getByRole('link', { name: 'CPEx' })).toHaveAttribute('href', '/cpex');
  });
});
