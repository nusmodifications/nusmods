// @flow

import update from 'immutability-helper';

import type { FSA } from 'types/redux';
import type { ScrollMenuState, ScrollMenu, ScrollMenuItem, ScrollMenuId } from 'types/reducers';
import { ADD_MENU_ITEM, CLEAR_MENU_STATE, UPDATE_MENU_STATE } from '../actions/scrollMenu';


const defaultState: ScrollMenuState = {};

function updateOrCreateMenu(id: ScrollMenuId, menu: ScrollMenu, item: ScrollMenuItem): ScrollMenu {
  if (!menu) {
    return {
      id,
      current: item.id,
      items: [item],
    };
  }

  if (menu.items.find(i => i.id === item.id)) {
    return menu;
  }

  return {
    ...menu,
    items: menu.items.concat([item]),
  };
}

export default function scrollMenu(state: ScrollMenuState = defaultState, action: FSA): ScrollMenuState {
  switch (action.type) {
    case ADD_MENU_ITEM: {
      const { menuId, item } = action.payload;

      return {
        ...state,
        [menuId]: updateOrCreateMenu(menuId, state[menuId], item),
      };
    }

    case CLEAR_MENU_STATE:
      return {
        ...state,
        [action.payload.menuId]: null,
      };

    case UPDATE_MENU_STATE:
      if (!state[action.payload.menuId]) return state;

      return update(state, {
        [action.payload.menuId]: {
          current: {
            $set: action.payload.itemId,
          },
        },
      });

    default:
      return state;
  }
}
