// Define media breakpoints
import json2mq, { QueryObject } from 'json2mq';
import { entries } from 'lodash';
import bowser from 'bowser';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const breakpoints: { [breakpoint in Breakpoint]: number } = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

// Safari and Non-Safari browsers in iOS
export const isMobileIos = () => bowser.ios;

function nextBreakpoint(size: Breakpoint): number | null | undefined {
  const breakpointEntries = entries(breakpoints);
  const nextBreakpointIndex =
    breakpointEntries.findIndex(([breakpoint]) => breakpoint === size) + 1;
  if (nextBreakpointIndex >= breakpointEntries.length) return null;
  return breakpointEntries[nextBreakpointIndex][1];
}

/**
 * Matches breakpoints equal to and below the given size; equal to the
 * breakpoint-down SCSS mixin
 */
export function breakpointDown(size: Breakpoint): QueryObject {
  const nextSize = nextBreakpoint(size);
  if (nextSize == null) return { all: true };
  return { maxWidth: nextSize - 1 };
}

/**
 * Matches breakpoints strictly above the given size; equal to the
 * breakpoint-up SCSS mixin
 */
export function breakpointUp(size: Breakpoint): QueryObject {
  return { minWidth: breakpoints[size] };
}

/**
 * Matches user-agents which declare themselves to be touchscreens
 * or devices without a precise pointing device
 */
export function touchScreenOnly(): QueryObject {
  return { pointer: 'coarse' };
}

export function queryMatch(query: QueryObject) {
  return window.matchMedia(json2mq(query));
}

export function supportsCSSVariables() {
  // Safari does not support supports('--var', 'red')
  return CSS.supports && CSS.supports('(--var: red)');
}
