import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import configureStore from 'bootstrapping/configure-store';
import config, {
  convertCPExWindow,
  getNextCPExAvailabilityChangeAt,
  isCPExAvailableAt,
} from 'config';
import { mockDom, mockDomReset } from 'test-utils/mockDom';
import MpeContainer from './MpeContainer';

const mpeApiMocks = vi.hoisted(() => ({
  getLoginState: vi.fn(() => false),
  fetchMpeModuleList: vi.fn(() => Promise.resolve([])),
  getMpeSubmission: vi.fn(() => Promise.resolve({ intendedMCs: 0, preferences: [] })),
  updateMpeSubmission: vi.fn(() => Promise.resolve()),
}));

const testWindow = convertCPExWindow({
  start: '2026-10-20T09:00:00+08:00',
  end: '2026-10-22T17:00:00+08:00',
});
if (!testWindow) throw new Error('Invalid CPEx page test window');

vi.mock('../../apis/mpe', () => ({
  getLoginState: mpeApiMocks.getLoginState,
  getSSOLink: vi.fn(),
  fetchMpeModuleList: mpeApiMocks.fetchMpeModuleList,
  getMpeSubmission: mpeApiMocks.getMpeSubmission,
  updateMpeSubmission: mpeApiMocks.updateMpeSubmission,
  MpeSessionExpiredError: class extends Error {},
}));

describe(MpeContainer, () => {
  const originalWindow = config.cpexWindow;

  beforeEach(() => {
    config.cpexWindow = testWindow;
    mpeApiMocks.getLoginState.mockReturnValue(false);
    mpeApiMocks.fetchMpeModuleList.mockResolvedValue([]);
    mpeApiMocks.getMpeSubmission.mockResolvedValue({ intendedMCs: 0, preferences: [] });
    mpeApiMocks.updateMpeSubmission.mockResolvedValue();
  });

  afterEach(() => {
    config.cpexWindow = originalWindow;
    mockDomReset();
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

  test('shows a load error instead of an empty submission when reopened after CPEx closes', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-22T17:00:00+08:00'));
    mpeApiMocks.getLoginState.mockReturnValue(true);
    mpeApiMocks.getMpeSubmission.mockRejectedValueOnce(new Error('CPEx is closed'));
    vi.spyOn(config, 'isCPExAvailable').mockImplementation((now = new Date()) =>
      isCPExAvailableAt(now, testWindow, true, false),
    );

    render(
      <MemoryRouter>
        <MpeContainer />
      </MemoryRouter>,
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Unable to load your CPEx submission. Your saved choices are not displayed.',
    );
    expect(screen.queryByText('All changes are saved')).toBeNull();
    expect(screen.queryByRole('spinbutton')).toBeNull();
    expect(mpeApiMocks.getMpeSubmission).toHaveBeenCalledOnce();
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

  test('keeps the direct CPEx page available on previews after the configured window ends', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-23T12:00:00+08:00'));
    vi.spyOn(config, 'isCPExAvailable').mockReturnValue(true);

    render(
      <MemoryRouter>
        <MpeContainer />
      </MemoryRouter>,
    );

    expect(screen.getByText(/indicate the course\(s\) you would like to read/)).toBeInTheDocument();
  });

  test('keeps the final save result visible and disables editing after the window closes', async () => {
    mockDom();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-22T16:59:59.999+08:00'));
    mpeApiMocks.getLoginState.mockReturnValue(true);
    vi.spyOn(config, 'isCPExAvailable').mockImplementation((now = new Date()) =>
      isCPExAvailableAt(now, testWindow, true, false),
    );
    vi.spyOn(config, 'getNextCPExAvailabilityChange').mockImplementation((now) =>
      getNextCPExAvailabilityChangeAt(now, testWindow, true, false),
    );

    let rejectSave!: (reason: Error) => void;
    const pendingSave = new Promise<void>((_resolve, reject) => {
      rejectSave = reject;
    });
    mpeApiMocks.updateMpeSubmission.mockReturnValueOnce(pendingSave);

    const { store } = configureStore();
    render(
      <MemoryRouter>
        <Provider store={store}>
          <MpeContainer />
        </Provider>
      </MemoryRouter>,
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    const intendedUnits = screen.getByRole('spinbutton');
    fireEvent.change(intendedUnits, { target: { value: '18' } });
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(mpeApiMocks.getMpeSubmission).toHaveBeenCalledOnce();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByText(/CPEx has ended for AY/)).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeDisabled();
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(mpeApiMocks.getMpeSubmission).toHaveBeenCalledOnce();

    vi.useRealTimers();
    await act(async () => {
      rejectSave(new Error('Save failed'));
      await pendingSave.catch(() => undefined);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText(/Changes could not be saved/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry Saving Changes' })).toBeNull();
  });
});
