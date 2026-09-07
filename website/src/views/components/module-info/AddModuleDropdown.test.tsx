import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TimetableConfig } from 'types/timetables';
import { Module } from 'types/modules';
import { CS3216, CS1010S } from '__mocks__/modules';

import { AddModuleDropdownComponent } from './AddModuleDropdown';

describe(AddModuleDropdownComponent, () => {
  function make(module: Module, timetables: TimetableConfig = {}) {
    const addModule = vi.fn();
    const removeModule = vi.fn();
    const props = { module, timetables, addModule, removeModule };
    const result = render(<AddModuleDropdownComponent {...props} />);

    return { addModule, removeModule, props, ...result };
  }

  test('should not show dropdown menu when the module is only available in one semester', () => {
    const container = make(CS3216);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: /Add to Semester 1/ }));
    expect(container.addModule).toHaveBeenCalledWith(1, 'CS3216');
  });

  test('should show dropdown when the module is available in many semesters', async () => {
    const user = userEvent.setup();
    const container = make(CS1010S);

    await user.click(screen.getByRole('button', { name: 'Toggle Dropdown' }));
    const menuItem = screen.getByRole('menuitem', { name: /Semester 2/ });
    await user.click(menuItem);
    expect(container.addModule).toHaveBeenCalledWith(2, 'CS1010S');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  test('should allow selecting a semester with the keyboard', async () => {
    const user = userEvent.setup();
    const container = make(CS1010S);
    screen.getByRole('button', { name: 'Toggle Dropdown' }).focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(container.addModule).toHaveBeenCalledWith(2, 'CS1010S');
  });

  test('should show "loading" when the module is added timetable', () => {
    const container = make(CS3216);
    fireEvent.click(screen.getByRole('button', { name: /Add to/ }));
    expect(screen.getByRole('button', { name: 'Adding...' })).toBeInTheDocument();
    container.rerender(
      <AddModuleDropdownComponent
        {...container.props}
        timetables={{ 1: { CS3216: { Lecture: ['1'] } } }}
      />,
    );
    expect(screen.getByRole('button', { name: /Remove from Semester 1/ })).toBeInTheDocument();
  });

  test('should show remove button when the module is in timetable', () => {
    const container = make(CS3216, { 1: { CS3216: { Lecture: ['1'] } } });
    fireEvent.click(screen.getByRole('button', { name: /Remove from/ }));
    expect(container.removeModule).toHaveBeenCalledWith(1, 'CS3216');
  });
});
