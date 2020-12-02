import type { QueryObject } from 'json2mq';

// NOTE: Keep in sync with Bootstrap's breakpoints.
// Breakpoints at time of writing: https://getbootstrap.com/docs/4.5/layout/overview/
const breakpoints = Object.freeze({
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
});
type Breakpoint = keyof typeof breakpoints;

function nextBreakpoint(size: Breakpoint): number | null {
  const breakpointEntries = Object.entries(breakpoints);
  const nextBreakpointIndex =
    breakpointEntries.findIndex(([breakpoint]) => breakpoint === size) + 1;
  if (nextBreakpointIndex >= breakpointEntries.length) return null;
  return breakpointEntries[nextBreakpointIndex][1];
}

export function breakpointDown(size: Breakpoint): QueryObject {
  const nextSize = nextBreakpoint(size);
  if (nextSize === null) return { all: true };
  return { maxWidth: nextSize - 1 };
}

export function breakpointUp(size: Breakpoint): QueryObject {
  return { minWidth: breakpoints[size] };
}

export function touchScreenOnly(): QueryObject {
  return { pointer: 'coarse' };
}

export function supportsCSSVariables() {
  // Safari does not support supports('--var', 'red')
  return CSS.supports && CSS.supports('(--var: red)');
}
