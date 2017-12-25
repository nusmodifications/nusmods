// @flow

// Define media breakpoints
import { entries } from 'lodash';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
const breakpoints: { [Breakpoint]: number } = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

function nextBreakpoint(size: Breakpoint): ?Breakpoint {
  const breakpointEntries = entries(breakpoints);
  const nextBreakpointIndex = breakpointEntries.findIndex(([breakpoint]) => breakpoint === size) + 1;
  if (nextBreakpointIndex >= breakpointEntries.length) return null;
  return breakpointEntries[nextBreakpointIndex][1];
}

export function breakpointDown(size: Breakpoint): string {
  const nextSize = nextBreakpoint(size);
  if (nextSize == null) return 'all';
  return `(max-width: ${breakpoints[nextSize] - 1}px )`;
}

export function breakpointUp(size: Breakpoint): string {
  return `(min-width: ${breakpoints[size]}px)`;
}

export function touchScreenOnly(): string {
  return '(pointer: coarse)';
}

export function supportsCSSVariables() {
  // Safari does not support supports('--var', 'red')
  return window.CSS.supports && window.CSS.supports('(--var: red)');
}
