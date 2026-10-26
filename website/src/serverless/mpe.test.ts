import config, { convertCPExWindow, isCPExAvailableAt } from '../config';
import type { Request, Response } from './handler';
import { featureFlagEnablerMiddleware } from './mpe';

const testWindow = convertCPExWindow({
  start: '2026-10-20T09:00:00+08:00',
  end: '2026-10-22T17:00:00+08:00',
});
if (!testWindow) throw new Error('Invalid CPEx server test window');

describe(featureFlagEnablerMiddleware, () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test('uses the shared window for each request, opening at start and closing at end', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-20T08:59:59.999+08:00'));
    let isEmergencyDisabled = false;
    const isAvailable = vi
      .spyOn(config, 'isCPExAvailable')
      .mockImplementation((now = new Date()) =>
        isCPExAvailableAt(now, testWindow, true, isEmergencyDisabled),
      );
    const status = vi.fn().mockReturnThis();
    const end = vi.fn();
    const req = {} as Request;
    const res = { status, end } as unknown as Response;
    const next = vi.fn();
    const middleware = featureFlagEnablerMiddleware(next);

    await middleware(req, res);
    expect(status).toHaveBeenCalledWith(404);
    expect(end).toHaveBeenCalledOnce();
    expect(next).not.toHaveBeenCalled();

    vi.setSystemTime(new Date('2026-10-20T09:00:00+08:00'));
    await middleware(req, res);
    expect(status).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledOnce();

    isEmergencyDisabled = true;
    await middleware(req, res);
    expect(status).toHaveBeenCalledTimes(2);
    expect(end).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenCalledOnce();

    isEmergencyDisabled = false;
    vi.setSystemTime(new Date('2026-10-22T17:00:00+08:00'));
    await middleware(req, res);
    expect(status).toHaveBeenCalledTimes(3);
    expect(end).toHaveBeenCalledTimes(3);
    expect(next).toHaveBeenCalledOnce();
    expect(isAvailable).toHaveBeenCalledTimes(4);
  });
});
