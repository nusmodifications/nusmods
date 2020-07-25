import { escapeRegExp, escape } from 'lodash';

const PRE_TAG = '<mark>';
const POST_TAG = '</mark>';

const PRE_TAG_REGEX = new RegExp(escapeRegExp(PRE_TAG), 'gi');
const POST_TAG_REGEX = new RegExp(escapeRegExp(POST_TAG), 'gi');

// For options, see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-highlighting.html#highlighting-settings
export const HIGHLIGHT_OPTIONS = {
  // eslint-disable-next-line camelcase
  pre_tags: [PRE_TAG],
  // eslint-disable-next-line camelcase
  post_tags: [POST_TAG],
  fields: {
    moduleCode: {},
    title: {},
    description: {},
  },
  encoder: 'html',
};

export function mergeModuleHighlight(
  source: string,
  highlights: string[] | undefined,
): {
  __html: string;
} {
  // Always escape the source since these fields are displayed using dangerously set HTML
  let escapedSource = escape(source);
  if (highlights) {
    highlights.forEach((highlight) => {
      const original = highlight.replace(PRE_TAG_REGEX, '').replace(POST_TAG_REGEX, '');
      escapedSource = escapedSource.replace(original, highlight);
    });
  }

  return { __html: escapedSource };
}
