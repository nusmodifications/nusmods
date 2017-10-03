// @flow

import { kebabCase } from 'lodash';

import type { FSA } from 'types/redux';
import type { ScrollMenuId, ScrollMenuItem, ScrollMenuItemId } from 'types/reducers';

export function createMenuItem(label: string, id?: string): ScrollMenuItem {
  return {
    label,
    id: id || kebabCase(label),
  };
}

export const ADD_MENU_ITEM = 'ADD_MENU_ITEM';
export function addMenuItem(menuId: ScrollMenuId, itemOrLabel: string | ScrollMenuItem): FSA {
  const item: ScrollMenuItem = typeof itemOrLabel === 'string' ? createMenuItem(itemOrLabel) : itemOrLabel;

  return {
    type: ADD_MENU_ITEM,
    payload: { item, menuId },
  };
}

export const CLEAR_MENU_STATE = 'CLEAR_MENU_STATE';
export function clearMenuState(menuId: ScrollMenuId): FSA {
  return {
    type: CLEAR_MENU_STATE,
    payload: { menuId },
  };
}

export const NEXT_MENU_ITEM = 'NEXT_MENU_ITEM';
export function nextMenuItem(menuId: ScrollMenuId, after: ScrollMenuItemId): FSA {
  return {
    type: NEXT_MENU_ITEM,
    payload: { menuId, after },
  };
}

export const SET_MENU_ITEM = 'SET_MENU_ITEM';
export function setMenuItem(menuId: ScrollMenuId, itemId: ScrollMenuItemId): FSA {
  return {
    type: SET_MENU_ITEM,
    payload: { menuId, itemId },
  };
}
