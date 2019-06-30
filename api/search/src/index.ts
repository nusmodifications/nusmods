import cron from 'node-cron';
import { Client } from '@elastic/elasticsearch';
import axios from 'axios';
import importData from './import';

let client: Client | null;

// Run scraper at 5:30, 6:30 and 7:30
// https://crontab.guru/#30_5,6,7_*_*_*
cron.schedule('30 5,6,7 * * *', () => {
  axios('https://api.nusmods.com/v2/2018-2019/moduleInfo.json')
    .then((data) => {
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
    });
});

process.on('SIGTERM', () => {
  if (client) {
    client.close();
  }
});
