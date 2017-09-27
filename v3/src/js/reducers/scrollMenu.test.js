// @flow

import type { ScrollMenuState } from 'types/reducers';
import { addMenuItem, createMenuItem, nextMenuItem, prevMenuItem } from 'actions/scrollMenu';

import reducer from './scrollMenu';

test('should create new menu object if it does not exist', () => {
  const action = addMenuItem('test', 'Test Item');

  expect(reducer({}, action).test).toEqual({
    id: 'test',
    items: [{
      id: 'test-item',
      label: 'Test Item',
    }],
    currentIndex: 0,
  });
});

test('should not duplicate menu items with the same ID', () => {
  // Add the same item 'Test Item' twice
  const state = reducer({}, addMenuItem('test', 'Test Item'));
  expect(reducer(state, addMenuItem('test', 'Test Item')).test.items).toHaveLength(1);
});

test('should update the correct menu item correctly', () => {
  const state: ScrollMenuState = {
    test: {
      id: 'test',
      items: [
        createMenuItem('Test Item 1'),
        createMenuItem('Test Item 2'),
        createMenuItem('Test Item 3'),
      ],
      currentIndex: 1,
    },
  };

  const afterItem2 = nextMenuItem('test', 'test-item-2');
  expect(reducer(state, afterItem2).test.currentIndex).toEqual(2);
  const afterItem3 = nextMenuItem('test', 'test-item-3');
  expect(reducer(state, afterItem3).test.currentIndex).toEqual(2);

  const beforeItem2 = prevMenuItem('test', 'test-item-2');
  expect(reducer(state, beforeItem2).test.currentIndex).toEqual(0);
  const beforeItem1 = prevMenuItem('test', 'test-item-1');
  expect(reducer(state, beforeItem1).test.currentIndex).toEqual(0);
});
