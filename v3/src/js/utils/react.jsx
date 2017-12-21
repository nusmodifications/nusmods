// @flow

import type { Node } from 'react';
import React from 'react';
import { escapeRegExp, castArray, entries } from 'lodash';

// Define some useful Unicode characters as constants
export const NBSP = '\u00a0';
export const BULLET = ' • ';

// Define media breakpoints
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

export function breakpointDown(size: Breakpoint): MediaQueryList {
  const nextSize = nextBreakpoint(size);
  if (nextSize == null) return window.matchMedia('all');
  return window.matchMedia(`(max-width: ${breakpoints[nextSize] - 1}px )`);
}

export function breakpointUp(size: Breakpoint): MediaQueryList {
  return window.matchMedia(`(min-width: ${breakpoints[size]}px)`);
}

export function supportsCSSVariables() {
  return window.CSS.supports && window.CSS.supports('--var', 'red');
}

/**
 * Replace substring matching the provided regex with React nodes. This is
 * basically the React version of replacing bits of strings with HTML tags,
 * except it is safer as the returned result is a React Node, so there's
 * no need to set innerHTML. This is useful for eg. highlighting search results
 * with <mark>
 *
 * @param str
 * @param regex
 * @param replacement
 * @returns {Node}
 */
export function replaceWithNode(
  str: string,
  regex: RegExp,
  replacement: (match: string, index: number) => Node,
): Node {
  const parts = str.split(regex);

  // We want to ensure the resulting array always have the matches at even position
  // eg. ['Some text ', 'CS1010S', ' more text ', 'CS3216', 'more text']
  // This allows us to replace the even position elements with components.
  // However, if the string starts with a match, then the first element will be a match
  // so we add in an empty string to pad matches to even positions
  if (parts.length && regex.test(parts[0])) parts.unshift('');

  return parts.map((part, i) => {
    if (i % 2 === 0) return part;
    return replacement(part, (i - 1) / 2);
  });
}

export function highlight(str: string, search: string | string[], Tag: string = 'mark'): Node {
  const terms = castArray(search).filter(Boolean);
  if (!terms.length) return str;
  const regex = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'ig');
  return replaceWithNode(str, regex, (match, i) => <Tag key={i}>{match}</Tag>);
}

/**
 * Replaces all spaces in a string with U+00A0 non-breaking spaces. This
 * avoids the browser inserting a page break between text that are part
 * of the same logical unit in the UI, such as 'Semester 1' or 'Week 13'.
 * Avoid using this for content.
 *
 * @param {string} text
 * @returns {string}
 */
export function noBreak(text: string): string {
  return text.replace(/ /g, NBSP);
}

export function defer(task: () => any) {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(task);
  });
}
