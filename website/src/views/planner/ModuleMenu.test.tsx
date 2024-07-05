import { mount, ReactWrapper } from 'enzyme';
import ModuleMenu from './ModuleMenu';

import styles from './PlannerModule.scss';

function makeModuleMenu(includedInTimetable: boolean) {
  const removeModule = jest.fn();
  const editCustomData = jest.fn();
  const addModuleToTimetable = jest.fn();
  const viewSemesterTimetable = jest.fn();
  return {
    removeModule,
    editCustomData,
    addModuleToTimetable,
    wrapper: mount(
      <ModuleMenu
        includedInTimetable={includedInTimetable}
        removeModule={removeModule}
        editCustomData={editCustomData}
        addModuleToTimetable={addModuleToTimetable}
        viewSemesterTimetable={viewSemesterTimetable}
      />,
    ),
  };
}

function findButton(wrapper: ReactWrapper) {
  return wrapper.find(`.${styles.menuBtn}`);
}

function isExpanded(wrapper: ReactWrapper) {
  return wrapper.find(`.show`);
}

function isMenuRight(wrapper: ReactWrapper) {
  return wrapper.find(`.${styles.menuRight}`);
}

test('should show button only on render', () => {
  const { wrapper } = makeModuleMenu(false);
  expect(findButton(wrapper).exists()).toBe(true);
});

test('should show dropdown when button is clicked', () => {
  const { wrapper } = makeModuleMenu(false);
  wrapper.find('button').at(0).simulate('click');
  expect(isExpanded(wrapper).exists()).toBe(true);
});

test('should show add to timetable if module is not included', () => {
  const { wrapper } = makeModuleMenu(false);
  wrapper.find('button').at(0).simulate('click');
  expect(wrapper.text()).toContain('Edit Unit and Title');
  expect(wrapper.text()).toContain('Add to Timetable');
  expect(wrapper.text()).toContain('Remove');
});

test('should show view in timetable if module is included', () => {
  const { wrapper } = makeModuleMenu(true);
  wrapper.find('button').at(0).simulate('click');
  expect(wrapper.text()).toContain('Edit Unit and Title');
  expect(wrapper.text()).toContain('View in Timetable');
  expect(wrapper.text()).toContain('Remove');
});

test('should fix its overflow given a small window innerwidth', () => {
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 150,
  });
  window.dispatchEvent(new Event('resize'));

  const { wrapper } = makeModuleMenu(false);
  wrapper.find('button').at(0).simulate('click');
  expect(isMenuRight(wrapper).exists()).toBe(true);
});
