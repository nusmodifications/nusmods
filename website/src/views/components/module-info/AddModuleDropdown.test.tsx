import { mount } from 'enzyme';

import { TimetableConfig } from 'types/timetables';
import { Module } from 'types/modules';

/** @var {Module} */
import { CS3216, CS1010S } from '__mocks__/modules';

import { AddModuleDropdownComponent } from './AddModuleDropdown';

describe(AddModuleDropdownComponent, () => {
  function make(module: Module, timetables: TimetableConfig = {}) {
    const addModule = jest.fn();
    const removeModule = jest.fn();

    return {
      addModule,
      removeModule,
      wrapper: mount(
        <AddModuleDropdownComponent
          module={module}
          timetables={timetables}
          addModule={addModule}
          removeModule={removeModule}
        />,
      ),
    };
  }

  test('should not show dropdown menu when the module is only available in one semester', () => {
    const container = make(CS3216);
    const button = container.wrapper.find('button');
    expect(button).toHaveLength(1);

    // Check that clicking on it adds the module to the timetable
    button.simulate('click');
    expect(container.addModule).toHaveBeenCalledWith(1, 'CS3216');
  });

  test('should show dropdown when the module is available in many semesters', () => {
    const container = make(CS1010S);

    const toggle = container.wrapper.find('.dropdown-toggle');
    expect(toggle.exists()).toBe(true);

    // Check that clicking on it toggles the menu
    toggle.simulate('click');
    const menu = container.wrapper.find('.dropdown-menu');

    expect(menu.exists()).toBe(true);

    // Check that the menu contains the correct item
    const menuButton = menu.find('button');
    expect(menuButton).toHaveLength(1);
    expect(menuButton.text()).toMatch('Semester 2');

    // Check that pressing the button adds the correct module
    menuButton.simulate('click');
    expect(container.addModule).toHaveBeenCalledWith(2, 'CS1010S');
  });

  test('should show "loading" when the module is added timetable', () => {
    // eslint-disable-next-line no-useless-computed-key
    const timetables = { [1]: { CS3216: { Lecture: '1' } } };
    const container = make(CS3216);
    const button = container.wrapper.find('button');

    expect(button.text()).toMatch('Add to');

    button.simulate('click');
    expect(button.text()).toMatch('Adding');

    container.wrapper.setProps({ timetables });
    expect(button.text()).toMatch('Remove');
  });

  test('should show remove button when the module is in timetable', () => {
    // eslint-disable-next-line no-useless-computed-key
    const container = make(CS3216, { [1]: { CS3216: { Lecture: ['1'] } } });
    const button = container.wrapper.find('button');

    expect(button.text()).toMatch('Remove');

    button.simulate('click');
    expect(container.removeModule).toHaveBeenCalledWith(1, 'CS3216');
  });
});
