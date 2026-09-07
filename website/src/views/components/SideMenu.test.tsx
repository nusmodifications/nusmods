import { useEffect, useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useMediaQuery from 'views/hooks/useMediaQuery';
import SideMenu from './SideMenu';

vi.mock('views/hooks/useMediaQuery', () => ({ default: vi.fn(() => false) }));

const register = vi.fn();
const unregister = vi.fn();

function Filters() {
  useEffect(() => {
    register();
    return unregister;
  }, []);
  return <input type="checkbox" aria-label="No Exam" />;
}

function Example() {
  const [open, setOpen] = useState(false);
  return (
    <SideMenu isOpen={open} toggleMenu={setOpen}>
      <Filters />
    </SideMenu>
  );
}

test('keeps filters registered and selected across dismissal, reopening, and desktop layout', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<Example />);
  expect(register).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

  const trigger = screen.getByRole('button', { name: 'Open menu' });
  await user.click(trigger);
  expect(screen.getByRole('dialog', { name: 'Open menu' })).toBeInTheDocument();
  await user.click(screen.getByRole('checkbox', { name: 'No Exam' }));
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(trigger).toHaveFocus();
  expect(unregister).not.toHaveBeenCalled();

  await user.click(trigger);
  expect(screen.getByRole('checkbox', { name: 'No Exam' })).toBeChecked();
  await user.click(screen.getByRole('button', { name: 'Close menu' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(document.body.style.pointerEvents).toBe('');

  vi.mocked(useMediaQuery).mockReturnValue(true);
  rerender(<Example />);
  expect(screen.getByRole('checkbox', { name: 'No Exam' })).toBeChecked();
  expect(register).toHaveBeenCalledTimes(1);
  expect(unregister).not.toHaveBeenCalled();
});
