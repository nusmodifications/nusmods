import produce from 'immer';

import { ElasticSearchResult, StringProperties } from 'types/vendor/elastic-search';
import { ModuleInformation } from 'types/modules';

const PRE_TAG = '<mark>';
const POST_TAG = '</mark>';

const PRE_TAG_REGEX = new RegExp(PRE_TAG, 'gi');
const POST_TAG_REGEX = new RegExp(POST_TAG, 'gi');

/* eslint-disable @typescript-eslint/camelcase, no-underscore-dangle */

export const HIGHLIGHT_OPTIONS = {
  pre_tags: [PRE_TAG],
  post_tags: [POST_TAG],
  fields: {
    moduleCode: {},
    title: {},
    description: {},
  },
};

function mergeModuleHighlight(
  field: StringProperties<ModuleInformation>,
  highlights: string[],
  module: ModuleInformation,
): ModuleInformation {
  if (!module[field]) return module;

  return produce(module, (draft) => {
    highlights.forEach((highlight) => {
      const original = highlight.replace(PRE_TAG_REGEX, '').replace(POST_TAG_REGEX, '');
      draft[field] = draft[field]!.replace(original, highlight); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    });
  });
}

/**
 * Injects highlights from Elastic Search results into the ES search hit
 */
export function mapElasticSearchResult(
  hit: ElasticSearchResult<ModuleInformation>,
): ModuleInformation {
  // Merge highlights into module
  let module = hit._source;

  if (hit.highlight) {
    if (hit.highlight.moduleCode) {
      module = mergeModuleHighlight('moduleCode', hit.highlight.moduleCode, module);
    }

    if (hit.highlight.title) {
      module = mergeModuleHighlight('title', hit.highlight.title, module);
    }

    if (hit.highlight.description) {
      module = mergeModuleHighlight('description', hit.highlight.description, module);
    }
  }

  return module;
}
