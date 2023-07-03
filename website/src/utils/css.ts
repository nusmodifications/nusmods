import type { QueryObject } from 'json2mq';

// NOTE: Keep in sync with Bootstrap's breakpoints.
// Breakpoints at time of writing: https://getbootstrap.com/docs/4.5/layout/overview/
const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
} as const;
type Breakpoint = keyof typeof breakpoints;

function nextBreakpoint(size: Breakpoint): number | undefined {
  const breakpointEntries = Object.entries(breakpoints);
  const nextBreakpointIndex =
    breakpointEntries.findIndex(([breakpoint]) => breakpoint === size) + 1;
  return breakpointEntries[nextBreakpointIndex][1];
}

export function breakpointDown(size: Breakpoint): QueryObject {
  const nextSize = nextBreakpoint(size);
  if (nextSize === undefined) return { all: true };
  return { maxWidth: nextSize - 1 };
}

export function breakpointUp(size: Breakpoint) {
  return { minWidth: breakpoints[size] } satisfies QueryObject;
}

export function touchScreenOnly(): QueryObject {
  return { pointer: 'coarse' };
}

export function supportsCSSVariables() {
  // Safari does not support supports('--var', 'red')
  return CSS.supports && CSS.supports('(--var: red)');
}
