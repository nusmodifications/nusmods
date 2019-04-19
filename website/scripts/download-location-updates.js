const axios = require('axios');
const _ = require('lodash');

/**
 * Downloads location update issues from GitHub and allows for easy
 * copy pasting into venues.json
 */

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
  const url = 'https://api.github.com/repos/nusmodifications/nusmods/issues';

  const res = await axios.get(url, {
    params: {
      labels: 'venue data',
      state: 'open',
    },
    headers: {
      'user-agent': 'nusmodifications',
    },
  });

  const issues = res.data;

  const issuesFound = [];
  const codeBlocks = [];
  issues.forEach((issue) => {
    const codeBlock = getCodeBlock(issue.body);

    try {
      JSON.parse(`{${codeBlock}}`);
    } catch (e) {
      console.error(`Cannot parse\n${codeBlock}\nas JSON`);
      return;
    }

    issuesFound.push(issue.number);
    codeBlocks.push(codeBlock);
  });

  console.log(issuesFound.map((id) => `Closes #${id}`).join('\n'));
  console.log();
  console.log(codeBlocks.join(',\n'));
}

downloadIssues();
