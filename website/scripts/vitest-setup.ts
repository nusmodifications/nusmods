import Adapter from '@cfaester/enzyme-adapter-react-18';
import { configure as configureTestingLibrary } from '@testing-library/dom';
import { configure } from 'enzyme';
import { setAutoFreeze } from 'immer';
import { afterEach } from 'vitest';

import '@testing-library/jest-dom/vitest';

// Increase async utility timeout to handle resource contention when running
// tests in parallel across workspace packages (pnpm -r test)
configureTestingLibrary({ asyncUtilTimeout: 5000 });

configure({ adapter: new Adapter() });

// immer uses Object.freeze on returned state objects, which is incompatible with
// redux-persist. See https://github.com/rt2zz/redux-persist/issues/747
setAutoFreeze(false);

// Prevent causing errors during test runs due to unclosed BroadcastChannel
vi.mock('redux-state-sync');

// In Jest, `config` was resolved via moduleDirectories and its __mocks__/config.ts
// was auto-applied. Vitest resolves via vite-tsconfig-paths so we need to mock the
// resolved path explicitly.
vi.mock('config', async () => {
  const actual = await vi.importActual<typeof import('config')>('config');
  return {
    ...actual,
    default: {
      ...actual.default,
      academicYear: '2017/2018',
      semester: 1,
      timetableAvailable: [1],
      archiveYear: ['2015/2016', '2016/2017'],
      getSemesterKey: () => '2017/2018 Semester 1',
    },
  };
});

// Clear the DOM after each test to remove any mounted components.
// This prevents timers or async work (e.g. from Downshift) from
// accessing a torn-down jsdom document in later tests.
afterEach(() => {
  /* eslint-env browser */
  document.body.innerHTML = '';
});
