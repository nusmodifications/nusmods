import { Client } from '@elastic/elasticsearch';

import { Persist } from '../../types/persist';
import { ModuleCode, ModuleInformation } from '../../types/modules';
import config from '../../config';
import logger from '../logger';

// Typings for the result from the all modules search. This is a partial typing
type ModuleSearchBody = {
  hits: {
    hits: Array<{
      _id: string;
      _score: number;
      _source: {
        moduleCode: ModuleCode;
      };
    }>;
    total: number;
  };
};

const INDEX_NAME = 'modules_v2';

// Tokenizes a string into an array of digits
const first_digit_tokenizer = {
  pattern: '[1-9]{1}',
  type: 'simple_pattern',
};

// Only pick the first token
const first_token_limit_filter = {
  max_token_count: 1,
  type: 'limit',
};

// Add 3 '0's to a number token
const thousandizer_filter = {
  pattern: '(\\d+)',
  replacement: '$1000',
  type: 'pattern_replace',
};

async function createIndex(client: Client): Promise<Client> {
  try {
    await client.indices.create({
      body: {
        settings: {
          analysis: {
            analyzer: {
              // An analyzer that produces a level string from a modcode, i.e.
              // "CNS1010SX" => "1000", "CS2030" => "2000", etc.
              level_analyzer: {
                filter: ['first_token_limit_filter', 'thousandizer_filter'],
                tokenizer: 'first_digit_tokenizer',
                type: 'custom',
              },
            },
            filter: { first_token_limit_filter, thousandizer_filter },
            tokenizer: { first_digit_tokenizer },
          },
          index: {
            max_result_window: 20_000, // Default limit is 10k, but we have >11k mods
          },
        },
      },
      index: INDEX_NAME,
    });
  } catch (error) {
    // Ignore resource exist exception as we will handle cases where the index
    // already exists.
    if (
      error.name !== 'ResponseError' ||
      error.meta.body.error.type !== 'resource_already_exists_exception'
    ) {
      throw error;
    }
  }

  await client.indices.putMapping({
    body: {
      properties: {
        moduleCode: {
          fields: {
            keyword: {
              ignore_above: 10,
              type: 'keyword',
            },
            level: {
              analyzer: 'level_analyzer',
              fielddata: true, // To allow usage in MultiList on the frontend
              type: 'text',
            },
          },
          type: 'text',
        },
        moduleCredit: { type: 'short' },
        semesterData: {
          type: 'nested',
        },
        workload: { type: 'text' },
      },
    },
    index: INDEX_NAME,
  });

  return client;
}

export default class ElasticPersist implements Persist {
  private readonly client: Promise<Client>;

  constructor() {
    if (!config.elasticConfig) {
      throw new Error('elasticConfig in config.json is not set');
    }

    const client = new Client(config.elasticConfig);

    this.client = createIndex(client);
  }

  deleteModule = async (moduleCode: ModuleCode) => {
    const client = await this.client;
    try {
      await client.delete({
        id: moduleCode,
        index: INDEX_NAME,
      });
    } catch (error) {
      if (error.name !== 'ResponseError' || error.meta?.body?.result !== 'not_found') {
        throw error;
      }
      logger.info(`Module ${moduleCode} not found in Elasticsearch index, skipping delete`);
    }
  };

  moduleInfo = async (moduleInfo: Array<ModuleInformation>) => {
    const bulkBody: Array<any> = [];

    for (const module of moduleInfo) {
      bulkBody.push({
        index: { _id: module.moduleCode },
      });

      if (module.attributes) {
        bulkBody.push({
          ...module,
          moduleAttributes: Object.keys(module.attributes),
        });
      } else {
        bulkBody.push(module);
      }
    }

    if (bulkBody.length === 0) {
      return;
    }

    const client = await this.client;
    const res = await client.bulk({
      body: bulkBody,
      index: INDEX_NAME,
    });

    const { items } = res.body;

    // Log errors
    const erroredItems = items.filter((i: any) => {
      const { status } = i.index;
      // Filter out status code 2xx
      return status < 200 || status >= 300;
    });
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

  async getModuleCodes() {
    const client = await this.client;
    const { body } = await client.search({
      body: {
        _source: 'moduleCode',
        query: {
          match_all: {},
        },
        size: 20_000, // Arbitrarily large number to force ES to return all results. Must be <= index.max_result_window
      },
      index: INDEX_NAME,
    });

    return (body as ModuleSearchBody).hits.hits.map((hit) => hit._source.moduleCode);
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

  mpeModules() {
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
