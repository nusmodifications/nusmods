import { Client } from '@elastic/elasticsearch';

import { Persist } from '../../types/persist';
import { ModuleCode, ModuleInformation } from '../../types/modules';
import logger from '../logger';

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

async function createIndex(client: Client): Promise<Client> {
  try {
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
  } catch (e) {
    // Ignore resource exist exception as we will handle cases where the index
    // already exists.
    if (
      e.name !== 'ResponseError' ||
      e.meta.body.error.type !== 'resource_already_exists_exception'
    ) {
      throw e;
    }
  }

  return client;
}

/* eslint-disable class-methods-use-this */
export default class ElasticPersist implements Persist {
  private readonly client: Promise<Client>;

  constructor() {
    const client = new Client({
      // TODO: INSERT cloud: CREDENTIALS HERE
    });

    this.client = createIndex(client);
  }

  deleteModule = async (moduleCode: ModuleCode) => {
    const client = await this.client;
    await client.delete({
      id: moduleCode,
      index: INDEX_NAME,
      type: '_doc',
    });
  };

  moduleInfo = async (moduleInfo: ModuleInformation[]) => {
    const bulkBody: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

    for (const module of moduleInfo) {
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

    const client = await this.client;
    const res = await client.bulk({
      index: 'modules',
      type: '_doc', // TODO: Remove when upgrading to Elasticsearch 7
      body: bulkBody,
    });

    const { items } = res.body;

    // Log errors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const erroredItems = items.filter((i: any) => i.index.status !== 201);
    if (erroredItems.length) {
      logger.error(`Insertion errors encountered`, {
        erroredLength: erroredItems.length,
        totalLength: res.body.items.length,
      });

      for (const item of erroredItems) {
        logger.error('Error importing item', item.index.error);
      }
    }
  };

  facultyDepartments() {
    return Promise.resolve();
  }

  getModuleCodes() {
    return Promise.resolve([]);
  }

  module() {
    return Promise.resolve();
  }

  moduleAliases() {
    return Promise.resolve();
  }

  moduleInformation() {
    return Promise.resolve();
  }

  moduleList() {
    return Promise.resolve();
  }

  semesterData() {
    return Promise.resolve();
  }

  timetable() {
    return Promise.resolve();
  }

  venueInformation() {
    return Promise.resolve();
  }

  venueList() {
    return Promise.resolve();
  }
}
