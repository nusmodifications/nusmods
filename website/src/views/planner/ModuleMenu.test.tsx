import { mount, ReactWrapper } from 'enzyme';
import ModuleMenu from './ModuleMenu';

import styles from './PlannerModule.scss';

function makeModuleMenu() {
  const removeModule = jest.fn();
  const editCustomData = jest.fn();
  return {
    removeModule,
    editCustomData,
    wrapper: mount(<ModuleMenu removeModule={removeModule} editCustomData={editCustomData} />),
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
  const { wrapper } = makeModuleMenu();
  expect(findButton(wrapper).exists()).toBe(true);
});

test('should show dropdown when button is clicked', () => {
  const { wrapper } = makeModuleMenu();
  wrapper.find('button').at(0).simulate('click');
  expect(isExpanded(wrapper).exists()).toBe(true);
});

test('should fix its overflow given a small window innerwidth', () => {
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 150,
  });
  window.dispatchEvent(new Event('resize'));

  const { wrapper } = makeModuleMenu();
  wrapper.find('button').at(0).simulate('click');
  expect(isMenuRight(wrapper).exists()).toBe(true);
});
