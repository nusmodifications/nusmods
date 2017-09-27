// @flow

import type { ScrollMenuState } from 'types/reducers';
import { addMenuItem, createMenuItem, updateMenuState } from 'actions/scrollMenu';

import reducer from './scrollMenu';

test('should create new menu object if it does not exist', () => {
  const action = addMenuItem('test', 'Test Item');

  expect(reducer({}, action).test).toEqual({
    id: 'test',
    items: [{
      id: 'test-item',
      label: 'Test Item',
    }],
    current: 'test-item',
  });
});

test('should not duplicate menu items with the same ID', () => {
  // Add the same item 'Test Item' twice
  const state = reducer({}, addMenuItem('test', 'Test Item'));
  expect(reducer(state, addMenuItem('test', 'Test Item')).test.items).toHaveLength(1);
});

test('should set the correct menu item to current', () => {
  const state: ScrollMenuState = {
    test: {
      id: 'test',
      items: [
        createMenuItem('Test Item 1'),
        createMenuItem('Test Item 2'),
        createMenuItem('Test Item 3'),
      ],
      current: 'test-item-1',
    },
  };

  const changeToItem2 = updateMenuState('test', 'test-item-2');
  expect(reducer(state, changeToItem2).test.current).toEqual('test-item-2');

  const changeToItem1 = updateMenuState('test', 'test-item-1');
  expect(reducer(state, changeToItem1).test.current).toEqual('test-item-1');
});
