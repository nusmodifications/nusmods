// @flow

import type { Node } from 'react';

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
export function replace( // eslint-disable-line import/prefer-default-export
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

/**
 * Replaces all spaces in a string with U+00A0 non-breaking spaces
 * @param text
 * @returns {string}
 */
export function noBreak(text: string): string {
  return text.replace(/ /g, '\u00a0');
}
