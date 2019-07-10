import cron from 'node-cron';
import { Client } from '@elastic/elasticsearch';
import axios from 'axios';
import importData from './import';

let client: Client | null;

async function runImport() {
  await axios
    .get('https://api.nusmods.com/v2/2019-2020/moduleInfo.json')
    .then(({ data, status }) => {
      if (status !== 200) {
        console.error('Could not get moduleInfo.json with HTTP status', status);
        process.exit(3);
        return;
      }
      if (!client) {
        client = new Client({ node: 'http://elasticsearch:9200' });
      }
      return importData(client, data);
    })
    .then(() => {
      if (!client) return;
      return client.close();
    })
    .then(() => {
      client = null;
    })
    .catch((e) => {
      console.error('Exiting due to caught exception', e);
      process.exit(10);
    });
}

// Run importer at 5:30, 6:30 and 7:30
// https://crontab.guru/#30_5,6,7_*_*_*
cron.schedule('30 5,6,7 * * *', () => runImport());

runImport();

process.on('SIGTERM', (code) => {
  console.log('SIGTERM with exit code', code);
  if (client) {
    client.close();
  }
});
