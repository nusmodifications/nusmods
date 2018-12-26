const octokit = require('@octokit/rest')();
const { appVersion } = require('../webpack/webpack.parts');

const repo = {
  owner: 'nusmodifications',
  repo: 'nusmods',
};

async function createTag() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('No GitHub token');

  octokit.authenticate({
    type: 'token',
    token,
  });

  const { commitHash, versionStr } = appVersion();

  await octokit.git.createRef({
    ...repo,
    ref: `refs/tags/${versionStr}`,
    sha: commitHash,
  });

  await octokit.git.createTag({
    ...repo,
    tag: versionStr,
    message: `NUSMods version ${versionStr}`,
    object: commitHash,
    type: 'commit',
  });
}

module.exports = createTag;

if (require.main === module) {
  createTag().catch((e) => {
    console.error(e);
  });
}
