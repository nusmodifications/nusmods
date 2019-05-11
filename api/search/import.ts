import { Client } from '@elastic/elasticsearch';
import { flatMap } from 'lodash';
import data from '../../scrapers/nus-v2/data/2018-2019/moduleInformation.json';

// Source: https://github.com/lodash/lodash/issues/2339#issuecomment-319536784
const intersperse = <T>(arr: Array<T>, inter: T) => flatMap(arr, (a) => [inter, a]);

const client = new Client({ node: 'http://localhost:9200' });

const bulkBody = intersperse(data, { index: {} });

async function setup() {
  await client.indices.delete({
    index: 'modules',
  });

  await client.indices.create({
    index: 'modules',
  });

  await client.bulk({
    index: 'modules',
    body: bulkBody,
  });
}

setup();
