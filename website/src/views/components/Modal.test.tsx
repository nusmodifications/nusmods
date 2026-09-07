import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

function Example({ closeOnOverlay = true }: { closeOnOverlay?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Modal
        isOpen={open}
        onRequestClose={() => setOpen(false)}
        shouldCloseOnOverlayClick={closeOnOverlay}
      >
        <h2>Timetable settings</h2>
        <button type="button" onClick={() => setOpen(false)}>
          Done
        </button>
      </Modal>
    </>
  );
}

test('names the dialog from its existing heading and restores keyboard focus after Escape', async () => {
  const user = userEvent.setup();
  render(<Example />);
  const trigger = screen.getByRole('button', { name: 'Open' });
  await user.click(trigger);
  expect(screen.getByRole('dialog', { name: 'Timetable settings' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Done' })).toHaveFocus();
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(trigger).toHaveFocus();
});

test('respects the overlay dismissal optout while retaining Escape dismissal', async () => {
  const user = userEvent.setup();
  render(<Example closeOnOverlay={false} />);
  await user.click(screen.getByRole('button', { name: 'Open' }));
  const overlay = document.querySelector('.ui-dialog-overlay');
  expect(overlay).not.toBeNull();
  fireEvent.pointerDown(overlay!, { pointerType: 'mouse', button: 0 });
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});
