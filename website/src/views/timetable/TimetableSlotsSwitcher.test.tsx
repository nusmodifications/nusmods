import { mount } from 'enzyme';
import { setupDownshiftTimers } from 'test-utils/downshiftTimers';

import { TimetableSlot } from 'types/reducers';
import Modal from 'views/components/Modal';

import { TimetableSlotsSwitcherComponent } from './TimetableSlotsSwitcher';
import styles from './TimetableSlotsSwitcher.scss';

const emptyData = { lessons: {}, colors: {}, hidden: [], ta: [] };

const twoSlots: TimetableSlot[] = [
  { id: '0', title: 'Timetable 1', data: emptyData },
  { id: '1', title: 'Backup plan', data: emptyData },
];

function makeSwitcher(slots: TimetableSlot[] = twoSlots, activeSlotId = '0') {
  const onSwitchSlot = vi.fn();
  const onAddSlot = vi.fn();
  const onRenameSlot = vi.fn();
  const onDeleteSlot = vi.fn();

  const wrapper = mount(
    <TimetableSlotsSwitcherComponent
      slots={slots}
      activeSlotId={activeSlotId}
      onSwitchSlot={onSwitchSlot}
      onAddSlot={onAddSlot}
      onRenameSlot={onRenameSlot}
      onDeleteSlot={onDeleteSlot}
    />,
  );

  return { wrapper, onSwitchSlot, onAddSlot, onRenameSlot, onDeleteSlot };
}

const findTabs = (wrapper: ReturnType<typeof mount>) => wrapper.find(`button.${styles.tab}`);
const clickMenuItem = (wrapper: ReturnType<typeof mount>, label: string, menuLabel: string) => {
  wrapper.find(`button[aria-label="${menuLabel}"]`).simulate('click');
  const item = wrapper
    .find('button.dropdown-item')
    .filterWhere((button) => button.text().includes(label));
  item.simulate('click');
};

setupDownshiftTimers();

describe(TimetableSlotsSwitcherComponent, () => {
  test('should render a tab for each slot with the active tab marked', () => {
    const { wrapper } = makeSwitcher();
    const tabs = findTabs(wrapper);

    expect(tabs).toHaveLength(2);
    expect(tabs.at(0).text()).toContain('Timetable 1');
    expect(tabs.at(1).text()).toContain('Backup plan');
    expect(tabs.at(0).prop('aria-selected')).toBe(true);
    expect(tabs.at(1).prop('aria-selected')).toBe(false);
  });

  test('should switch to an inactive slot when its tab is clicked', () => {
    const { wrapper, onSwitchSlot } = makeSwitcher();
    findTabs(wrapper).at(1).simulate('click');

    expect(onSwitchSlot).toHaveBeenCalledWith('1');
  });

  test('should not switch when the active tab is clicked', () => {
    const { wrapper, onSwitchSlot } = makeSwitcher();
    findTabs(wrapper).at(0).simulate('click');

    expect(onSwitchSlot).not.toHaveBeenCalled();
  });

  test('should add a blank timetable from the add menu', () => {
    const { wrapper, onAddSlot } = makeSwitcher();
    clickMenuItem(wrapper, 'New empty timetable', 'Add timetable');

    expect(onAddSlot).toHaveBeenCalledWith({});
  });

  test('should duplicate the current timetable from the add menu', () => {
    const { wrapper, onAddSlot } = makeSwitcher();
    clickMenuItem(wrapper, 'Duplicate current timetable', 'Add timetable');

    expect(onAddSlot).toHaveBeenCalledWith({ duplicateCurrent: true });
  });

  test('should rename the active slot through the rename modal', () => {
    const { wrapper, onRenameSlot } = makeSwitcher();
    clickMenuItem(wrapper, 'Rename', 'Timetable options');

    const modal = wrapper.find(Modal).filterWhere((m) => !!m.prop('isOpen'));
    expect(modal.exists()).toBe(true);

    const input = wrapper.find('input[type="text"]');
    expect(input.prop('value')).toBe('Timetable 1');

    input.simulate('change', { target: { value: 'Plan A' } });
    wrapper.find('form').simulate('submit');

    expect(onRenameSlot).toHaveBeenCalledWith('0', 'Plan A');
  });

  test('should delete the active slot after confirmation', () => {
    const { wrapper, onDeleteSlot } = makeSwitcher();
    clickMenuItem(wrapper, 'Delete', 'Timetable options');

    expect(onDeleteSlot).not.toHaveBeenCalled();

    const confirmButton = wrapper
      .find('button')
      .filterWhere((button) => button.text() === 'Delete')
      .last();
    confirmButton.simulate('click');

    expect(onDeleteSlot).toHaveBeenCalledWith('0');
  });

  test('should not allow deleting the last remaining slot', () => {
    const { wrapper, onDeleteSlot } = makeSwitcher([twoSlots[0]]);
    clickMenuItem(wrapper, 'Delete', 'Timetable options');

    expect(
      wrapper
        .find(Modal)
        .filterWhere((m) => !!m.prop('isOpen'))
        .exists(),
    ).toBe(false);
    expect(onDeleteSlot).not.toHaveBeenCalled();
  });
});
