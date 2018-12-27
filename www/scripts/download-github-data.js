const path = require('path');
const _ = require('lodash');
const fs = require('fs-extra');
const remark = require('remark');
const html = require('remark-html');
const github = require('remark-github');
const octokit = require('@octokit/rest')();

const repo = {
  owner: 'nusmodifications',
  repo: 'nusmods',
};

/* eslint-disable camelcase, no-await-in-loop */
const USER_TYPE = 'User';
const USER_BLACKLIST = new Set([
  // Renovate used to report outdated dependencies as a user via the GitHub API,
  // hence we need to filter it out by its GitHub user ID.
  25180681,
]);

async function getAllPages(callApi) {
  let page = 1;
  let data = [];
  let result;

  do {
    result = await callApi(page);
    data = data.concat(result.data);
    page += 1;
  } while (result.data.length > 0);

  return data;
}

async function downloadData() {
  const [releaseResults, contributorResults] = await Promise.all([
    getAllPages((page) =>
      octokit.repos.listReleases({
        ...repo,
        per_page: 100,
        page,
      }),
    ),
    getAllPages((page) =>
      octokit.repos.listContributors({
        ...repo,
        per_page: 100,
        page,
      }),
    ),
  ]);

  const releases = {};
  const releasePromises = releaseResults.map(
    ({ tag_name, name, body }) =>
      new Promise((resolve, reject) => {
        // Release note body comes in Markdown - we need to turn it into HTML
        remark()
          .use(html)
          .use(github, { repository: `${repo.owner}/${repo.repo}` })
          .process(body, (e, file) => {
            if (e) reject(e);

            releases[tag_name] = {
              name,
              body: file.toString(),
            };
            resolve();
          });
      }),
  );

  const contributors = contributorResults
    // Filter out bots
    .filter(({ type, id }) => type === USER_TYPE && !USER_BLACKLIST.has(id))
    .map(({ id, login, html_url, avatar_url, contributions }) => ({
      id,
      name: login,
      url: html_url,
      avatar: avatar_url,
      contributions,
    }));

  await Promise.all(releasePromises);

  const contributorPath = path.resolve(__dirname, '../dist/contributors.json');
  const releasePath = path.resolve(__dirname, '../dist/releases.json');

  console.log(`Writing ${_.size(releases)} releases to ${releasePath}`);
  console.log(`Writing ${contributors.length} contributors to ${contributorPath}`);

  await Promise.all([
    fs.outputJson(contributorPath, contributors),
    fs.outputJson(releasePath, releases),
  ]);
}

/* eslint-enable */

if (require.main === module) {
  downloadData().catch((e) => {
    console.error(e);
  });
}
