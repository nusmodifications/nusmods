import * as React from 'react';
import { escapeRegExp, castArray } from 'lodash';

// Define some useful Unicode characters as constants
export const NBSP = '\u00a0';
export const ZWSP = '\u200b';
export const BULLET = ' • ';
export const BULLET_NBSP = '\u00a0•\u00a0';

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
  replacement: (match: string, index: number) => React.ReactNode,
): React.ReactElement {
  const parts = str.split(regex);

  // We want to ensure the resulting array always have the matches at even position
  // eg. ['Some text ', 'CS1010S', ' more text ', 'CS3216', 'more text']
  // This allows us to replace the even position elements with components.
  // However, if the string starts with a match, then the first element will be a match
  // so we add in an empty string to pad matches to even positions
  if (parts.length && regex.test(parts[0])) parts.unshift('');

  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) return part;
        return replacement(part, (i - 1) / 2);
      })}
    </>
  );
}

export function highlight(str: string, search: string | string[], Tag = 'mark'): React.ReactNode {
  const terms = castArray(search).filter(Boolean);
  if (!terms.length) return str;
  const regex = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'ig');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore This does not type check correctly
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

export function defer(task: () => unknown) {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(task);
  });
}

// We really don't care about the props here
export function wrapComponentName<T>(Component: React.ComponentType<T>, wrapper: string): string {
  return `${wrapper}(${Component.displayName || Component.name || 'Component'})`;
}

/**
 * Small utility function to scroll to an element with ID matching the URL hash if
 * both are present.
 *
 * This mimics traditional webpage behavior and should be used in componentDidMount() when
 * the component is not loaded on initial page load (ie. the element is not in the DOM when
 * the page is initially loaded), but has content that can be linked to via hashes.
 */
export function scrollToHash() {
  const { hash } = window.location;
  if (hash) {
    const ele = document.getElementById(hash.slice(1)); // Hash string contains the '#' character
    if (ele) {
      ele.scrollIntoView(true);
    }
  }
}

/**
 * Utility class that encapsulates an auto-incrementing counter. Useful for
 * keeping track of Downshift item indices
 */
export class Counter {
  count = -1;

  index() {
    this.count += 1;
    return this.count;
  }

  matches(index: number | null | undefined) {
    this.count += 1;
    return this.count === index;
  }
}

/**
 * Reset scroll position to (0, 0)
 */
export function resetScrollPosition() {
  window.scrollTo(0, 0);
}
