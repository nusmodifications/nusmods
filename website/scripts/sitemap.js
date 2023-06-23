const _ = require('lodash');
const path = require('path');
const fs = require('graceful-fs');
const { URL } = require('url');
const axios = require('axios');
const api = require('../src/apis/nusmods');

// Generates a static sitemap of NUSMods.com

const baseUrl = process.env.BASE_URL || 'https://nusmods.com';

const relativeUrls = [
  '',

  // Basic pages
  'courses',
  'venues',

  // Static pages
  'about',
  'faq',
  'contact',
  'team',
  'contribute',
  'contributors',
  'apps',
];

const addDynamicPages = async (urls) => {
  const responses = await Promise.all([
    axios.get(api.moduleListUrl()),
    axios.get(api.venueListUrl(1)),
    axios.get(api.venueListUrl(2)),
  ]);

  const [modules, venues1, venues2] = responses.map((response) => response.data);
  const venues = _.uniq([...venues1, ...venues2]);

  modules.forEach((module) => {
    urls.push(`courses/${module.moduleCode}/${_.kebabCase(module.title)}`);
  });

  venues.forEach((venue) => {
    urls.push(`venues/${encodeURIComponent(venue)}`);
  });

  return urls;
};

addDynamicPages(relativeUrls).then((urls) => {
  const sitemap = urls.map((url) => new URL(url, baseUrl)).join('\n');
  const sitemapPath = path.resolve(__dirname, '../static/sitemap.txt');
  fs.writeFileSync(sitemapPath, sitemap);

  console.log(`${urls.length} entries written to ${sitemapPath}`);
});
