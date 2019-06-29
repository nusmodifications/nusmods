import { Client } from '@elastic/elasticsearch';

import config from '../config';
import { Persist } from '../types/persist';
import { ModuleCode, ModuleInformation } from '../types/modules';

/* eslint-disable @typescript-eslint/camelcase */

const INDEX_NAME = 'modules';

// Tokenizes a string into an array of digits
const first_digit_tokenizer = {
  type: 'simple_pattern',
  pattern: '[1-9]{1}',
};

// Only pick the first token
const first_token_limit_filter = {
  type: 'limit',
  max_token_count: 1,
};

// Add 3 '0's to a number token
const thousandizer_filter = {
  type: 'pattern_replace',
  pattern: '(\\d+)',
  replacement: '$1000',
};

export default async function getElasticPersist(): Promise<Persist> {
  // Construct the ElasticSearch client
  const client = new Client({ node: config.elasticUrl });

  await client.indices.create({
    index: INDEX_NAME,
    include_type_name: false, // TODO: Remove when upgrading to Elasticsearch 7
    body: {
      settings: {
        analysis: {
          analyzer: {
            // An analyzer that produces a level string from a modcode, i.e.
            // "CNS1010SX" => "1000", "CS2030" => "2000", etc.
            level_analyzer: {
              type: 'custom',
              tokenizer: 'first_digit_tokenizer',
              filter: ['first_token_limit_filter', 'thousandizer_filter'],
            },
          },
          tokenizer: { first_digit_tokenizer },
          filter: { first_token_limit_filter, thousandizer_filter },
        },
        index: {
          max_result_window: 20000, // Default limit is 10k, but we have >11k mods
        },
      },
      mappings: {
        properties: {
          workload: { type: 'text' },
          moduleCredit: { type: 'short' },
          moduleCode: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
                ignore_above: 10,
              },
              level: {
                type: 'text',
                analyzer: 'level_analyzer',
                fielddata: true, // To allow usage in MultiList on the frontend
              },
            },
          },
        },
      },
    },
  });

  return {
    deleteModule: async (moduleCode: ModuleCode) => {
      await client.delete({
        id: moduleCode,
        index: INDEX_NAME,
        type: '_doc',
      });
    },

    moduleInformation: async (moduleInformation: ModuleInformation[]) => {
      const bulkBody: any[] = [];

      for (const module of moduleInformation) {
        bulkBody.push({
          index: { _id: module.moduleCode },
        });

        if (module.attributes) {
          bulkBody.push({
            ...module,
            moduleAttributesList: Object.keys(module.attributes),
          });
        } else {
          bulkBody.push(module);
        }
      }

      const res = await client.bulk({
        index: 'modules',
        type: '_doc', // TODO: Remove when upgrading to Elasticsearch 7
        body: bulkBody,
      });

      const { items } = res.body;
      const erroredItems = items.filter((i: any) => i.index.status !== 201);
      console.log(`${erroredItems.length} insertion errors of ${res.body.items.length} items.`);
      for (const item of erroredItems) {
        console.log('ERROR importing item', item.index.error);
      }
    },

    facultyDepartments() {
      throw new Error('not implemented');
    },
    getModuleCodes() {
      throw new Error('not implemented');
    },
    module() {
      throw new Error('not implemented');
    },
    moduleAliases() {
      throw new Error('not implemented');
    },
    moduleList() {
      throw new Error('not implemented');
    },
    semesterData() {
      throw new Error('not implemented');
    },
    timetable() {
      throw new Error('not implemented');
    },
    venueInformation() {
      throw new Error('not implemented');
    },
    venueList() {
      throw new Error('not implemented');
    },
  };
}
