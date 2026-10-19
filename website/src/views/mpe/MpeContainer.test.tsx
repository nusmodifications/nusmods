import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import config, { convertCPExWindow, isCPExAvailableAt } from 'config';
import MpeContainer from './MpeContainer';

const testWindow = convertCPExWindow({
  start: '2026-10-20T09:00:00+08:00',
  end: '2026-10-22T17:00:00+08:00',
});
if (!testWindow) throw new Error('Invalid CPEx page test window');

vi.mock('../../apis/mpe', () => ({
  getLoginState: () => false,
  getSSOLink: vi.fn(),
  getMpeSubmission: vi.fn(),
  updateMpeSubmission: vi.fn(),
  MpeSessionExpiredError: class extends Error {},
}));

describe(MpeContainer, () => {
  const originalWindow = config.cpexWindow;

  beforeEach(() => {
    config.cpexWindow = testWindow;
  });

  afterEach(() => {
    config.cpexWindow = originalWindow;
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test('keeps the direct page available with a closed status after the window ends', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-22T17:00:00+08:00'));
    vi.spyOn(config, 'isCPExAvailable').mockImplementation((now = new Date()) =>
      isCPExAvailableAt(now, testWindow, true, false),
    );

    render(
      <MemoryRouter>
        <MpeContainer />
      </MemoryRouter>,
    );

    expect(screen.getByText(/CPEx has ended for AY/)).toBeInTheDocument();
    expect(screen.queryByText(/indicate the course\(s\) you would like to read/)).toBeNull();
  });

  test('shows the scheduled opening date before the window starts', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-20T08:59:59+08:00'));
    vi.spyOn(config, 'isCPExAvailable').mockImplementation((now = new Date()) =>
      isCPExAvailableAt(now, testWindow, true, false),
    );

    render(
      <MemoryRouter>
        <MpeContainer />
      </MemoryRouter>,
    );

    expect(screen.getByText(/CPEx will open on:/)).toBeInTheDocument();
  });
});
