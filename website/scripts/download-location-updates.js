const path = require('path');
const fs = require('fs');
const axios = require('axios');
const _ = require('lodash');

const VENUES_PATH = path.join(__dirname, '../src/data/venues.json');

/**
 * Downloads location update issues from GitHub and allows for easy
 * copy pasting into venues.json
 */

const ISSUES_URL = 'https://api.github.com/repos/nusmodifications/nusmods/issues';

/**
 * Returns the last code block from the issue
 */
function getCodeBlock(body) {
  const lines = body.trim().split('\n');

  const blocks = [];
  let currentBlock = '';
  let inCodeBlock = false;

  lines.forEach((line) => {
    if (line.indexOf('```') === 0) {
      if (inCodeBlock) {
        inCodeBlock = false;
        blocks.push(currentBlock.trim());
        currentBlock = '';
      } else {
        inCodeBlock = true;
      }

      return;
    }

    if (inCodeBlock) {
      currentBlock += `${line}\n`;
    }
  });

  return _.last(blocks);
}

async function downloadIssues() {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  let venues = require(VENUES_PATH);

  const res = await axios.get(ISSUES_URL, {
    params: {
      labels: 'venue data',
      state: 'open',
      // Apply earlier issues first
      direction: 'asc',
    },
    headers: {
      'user-agent': 'nusmodifications',
    },
  });

  const issues = res.data;

  const issuesFound = [];
  issues.forEach((issue) => {
    const codeBlock = getCodeBlock(issue.body);
    let data;

    try {
      data = JSON.parse(`{${codeBlock}}`);
    } catch (e) {
      console.error(`Cannot parse\n${codeBlock}\nas JSON`);
      return;
    }

    issuesFound.push([issue.number, Object.keys(data)[0]]);
    venues = { ...venues, ...data };
  });

  console.log(issuesFound.map(([id, venue]) => `Closes #${id} - ${venue}`).join('\n'));
  console.log();

  fs.writeFileSync(VENUES_PATH, JSON.stringify(venues, null, 2));
}

downloadIssues();
