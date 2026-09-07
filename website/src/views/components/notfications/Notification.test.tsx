import { act, fireEvent, render, screen } from '@testing-library/react';
import type { NotificationData } from 'types/reducers';
import { NotificationComponent } from './Notification';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

test('advances timed notifications, including consecutive identical messages', () => {
  const pop = vi.fn();
  const first: NotificationData = { message: 'Saved', timeout: 1000, willClose: vi.fn() };
  const second: NotificationData = { message: 'Saved', timeout: 1000 };
  const { rerender } = render(
    <NotificationComponent notifications={[first, second]} popNotification={pop} />,
  );
  act(() => {
    vi.advanceTimersByTime(1001);
  });
  expect(pop).toHaveBeenCalledTimes(1);
  rerender(<NotificationComponent notifications={[second]} popNotification={pop} />);
  expect(first.willClose).toHaveBeenCalledWith(true, false);
  act(() => {
    vi.advanceTimersByTime(1001);
  });
  expect(pop).toHaveBeenCalledTimes(2);
});

test('leaves the toast open when an action returns false and records an accepted action', () => {
  const pop = vi.fn();
  const handler = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(undefined);
  const notification: NotificationData = {
    message: 'Saved',
    action: { text: 'Undo', handler },
    willClose: vi.fn(),
  };
  const { rerender } = render(
    <NotificationComponent notifications={[notification]} popNotification={pop} />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
  expect(pop).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
  expect(pop).toHaveBeenCalledTimes(1);
  rerender(<NotificationComponent notifications={[]} popNotification={pop} />);
  expect(notification.willClose).toHaveBeenCalledWith(true, true);
});

test('reports a priority interruption as retained and resumes the queued notification', () => {
  const pop = vi.fn();
  const first: NotificationData = { message: 'First', willClose: vi.fn() };
  const priority: NotificationData = { message: 'Priority' };
  const { rerender } = render(
    <NotificationComponent notifications={[first]} popNotification={pop} />,
  );
  rerender(<NotificationComponent notifications={[priority, first]} popNotification={pop} />);
  expect(first.willClose).toHaveBeenCalledWith(false, false);
  expect(screen.getByText('Priority')).toBeInTheDocument();
  rerender(<NotificationComponent notifications={[first]} popNotification={pop} />);
  expect(screen.getByText('First')).toBeInTheDocument();
});
