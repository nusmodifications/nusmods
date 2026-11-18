import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SemesterSwitcher from './SemesterSwitcher';

const jest = vi;
describe('<SemesterSwitcher />', () => {
  test('simulates click events', async () => {
    const onButtonClick = jest.fn();
    render(<SemesterSwitcher semester={2} onSelectSemester={onButtonClick} />);

    await userEvent.click(screen.getByRole('button', { name: 'Previous Semester' }));
    expect(onButtonClick).toHaveBeenCalledWith(1);
    await userEvent.click(screen.getByRole('button', { name: 'Next Semester' }));
    expect(onButtonClick).toHaveBeenCalledWith(3);
  });

  describe('semester switching buttons are disabled appropriately', () => {
    test('left button', async () => {
      const onButtonClick = jest.fn();
      render(<SemesterSwitcher semester={1} onSelectSemester={onButtonClick} />);

      const prev = screen.getByRole('button', { name: 'Previous Semester' });
      expect(prev).toBeDisabled();
      await userEvent.click(prev);
      expect(onButtonClick).not.toHaveBeenCalled();
      await userEvent.click(screen.getByRole('button', { name: 'Next Semester' }));
      expect(onButtonClick).toHaveBeenCalledWith(2);
    });

    test('right button', async () => {
      const onButtonClick = jest.fn();
      render(<SemesterSwitcher semester={4} onSelectSemester={onButtonClick} />);

      const next = screen.getByRole('button', { name: 'Next Semester' });
      expect(next).toBeDisabled();
      await userEvent.click(next);
      expect(onButtonClick).not.toHaveBeenCalled();
      await userEvent.click(screen.getByRole('button', { name: 'Previous Semester' }));
      expect(onButtonClick).toHaveBeenCalledWith(3);
    });
  });
});
