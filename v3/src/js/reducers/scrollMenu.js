// @flow

import type { FSA } from 'types/redux';
import { clamp } from 'lodash';
import type { ScrollMenuState, ScrollMenu, ScrollMenuItem, ScrollMenuId, ScrollMenuItemId } from 'types/reducers';
import { ADD_MENU_ITEM, CLEAR_MENU_STATE, NEXT_MENU_ITEM, SET_MENU_ITEM } from 'actions/scrollMenu';

const defaultState: ScrollMenuState = {};

function updateOrCreateMenu(id: ScrollMenuId, menu: ScrollMenu, item: ScrollMenuItem): ScrollMenu {
  if (!menu) {
    return {
      id,
      currentIndex: 0,
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

function setCurrentMenuItem(
  menu: ScrollMenu,
  itemId: ScrollMenuItemId,
  offset: number = 0,
): ScrollMenu {
  const reference = menu.items.findIndex(item => item.id === itemId);
  if (reference == null) {
    return menu;
  }

  return {
    ...menu,
    currentIndex: clamp(reference + offset, 0, menu.items.length - 1),
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

    case NEXT_MENU_ITEM: {
      const menu = state[action.payload.menuId];
      if (!menu) return state;

      return {
        ...state,
        [action.payload.menuId]: setCurrentMenuItem(menu, action.payload.after, 1),
      };
    }

    case SET_MENU_ITEM: {
      const menu = state[action.payload.menuId];
      if (!menu) return state;

      return {
        ...state,
        [action.payload.menuId]: setCurrentMenuItem(menu, action.payload.itemId),
      };
    }

    default:
      return state;
  }
}
