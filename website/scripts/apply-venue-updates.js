#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const last = require('lodash/last');

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

  return last(blocks);
}

async function downloadIssues() {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  let venues = require(VENUES_PATH);

  const url = new URL(ISSUES_URL);
  url.searchParams.append('labels', 'venue data');
  url.searchParams.append('state', 'open');
  url.searchParams.append('direction', 'asc');

  const res = await fetch(url, {
    headers: {
      'user-agent': 'nusmodifications',
    },
  });

  const issues = await res.json();

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
