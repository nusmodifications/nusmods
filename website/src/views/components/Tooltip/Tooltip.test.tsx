import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from 'components/ui/button';
import Tooltip from './Tooltip';

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test('shows keyboard hints inside the requested export root and preserves trigger actions', async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  const host = document.createElement('div');
  document.body.appendChild(host);
  const shadowRoot = host.attachShadow({ mode: 'open' });
  const appendTo = vi.fn(() => shadowRoot);
  const { unmount } = render(
    <Tooltip
      content="Classes"
      placement="bottom"
      distance={0}
      appendTo={appendTo}
      arrow
      interactive
    >
      <Button onClick={onClick}>Show classes</Button>
    </Tooltip>,
  );

  await user.tab();
  const trigger = screen.getByRole('button', { name: 'Show classes' });
  expect(trigger).toHaveFocus();
  await waitFor(() =>
    expect(within(shadowRoot as unknown as HTMLElement).getByRole('tooltip')).toHaveTextContent(
      'Classes',
    ),
  );
  expect(appendTo).toHaveBeenCalledWith(trigger);
  expect(shadowRoot.querySelector('.ui-tooltip-content')).toHaveAttribute('data-side', 'bottom');
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  await user.click(trigger);
  expect(onClick).toHaveBeenCalledTimes(1);
  unmount();
  host.remove();
});

test('opens after the hover delay and dismisses with Escape', async () => {
  vi.useFakeTimers();
  render(
    <Tooltip content="Next page" delay={[800, 0]}>
      <Button>Next</Button>
    </Tooltip>,
  );
  fireEvent.pointerMove(screen.getByRole('button', { name: 'Next' }));
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(800);
  });
  expect(screen.getByRole('tooltip')).toHaveTextContent('Next page');
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});

test('a long touch shows a hint without activating the action, while a tap still clicks', async () => {
  vi.useFakeTimers();
  const onClick = vi.fn();
  render(
    <Tooltip content="Remove course" touch={['hold', 50]}>
      <Button onClick={onClick}>Remove</Button>
    </Tooltip>,
  );
  const trigger = screen.getByRole('button', { name: 'Remove' });
  fireEvent.touchStart(trigger);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(50);
  });
  expect(screen.getByRole('tooltip')).toHaveTextContent('Remove course');
  fireEvent.touchEnd(trigger);
  fireEvent.click(trigger);
  expect(onClick).not.toHaveBeenCalled();
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

  await act(async () => {
    await vi.advanceTimersByTimeAsync(501);
  });
  fireEvent.touchStart(trigger);
  fireEvent.touchEnd(trigger);
  fireEvent.click(trigger);
  expect(onClick).toHaveBeenCalledTimes(1);
});
