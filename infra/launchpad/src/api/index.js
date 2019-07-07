const path = require('path');
const nodegit = require('nodegit');

const promisify = require('util').promisify;
const execPromise = promisify(require('child_process').exec);

const express = require('express');
const router = express.Router();

const config = require('../../config');
const sendMessage = require('./utils/slackbot');

const exp = {
  router,
  ongoingBuild: null,
};

const NUM_LATEST_COMMITS = 200;

router.get('/commits/all', async (req, res, next) => {
  const repo = await nodegit.Repository.open(path.resolve(config.primaryWorktree));
  const masterCommit = await repo.getMasterCommit();
  const history = masterCommit.history(nodegit.Revwalk.SORT.Time);

  history.on('end', function(commitMessages) {
    const commitObjs = commitMessages.slice(0, NUM_LATEST_COMMITS).map((commit) => {
      const author = commit.author();
      const messageLines = commit
        .message()
        .trim()
        .split('\n');
      const shortMessage = messageLines[0];
      const extendedMessage = messageLines.length > 1 ? messageLines.slice(1).join('\n') : '';
      return {
        sha: commit.sha().substring(0, 7),
        author: {
          name: author.name(),
          email: author.email(),
        },
        date: commit.date(),
        shortMessage,
        extendedMessage,
      };
    });

    res.send(commitObjs);
  });

  // Don't forget to call `start()`!
  history.start();
});

router.get('/branches/all', async (req, res, next) => {
  try {
    const repo = await nodegit.Repository.open(path.resolve(config.primaryWorktree));
    const references = await repo.getReferences(nodegit.Reference.TYPE.LISTALL);
    const branchNames = references
      .filter((r) => !r.isTag())
      .map((r) => ({
        shorthand: r.shorthand(),
        name: r.name(),
        isRemote: r.isRemote(),
        hash: r.target().tostrS(),
      }));
    res.send(branchNames);
  } catch (e) {
    console.error('Could not get branches', e);
    sendMessage(`Could not get branches due to error: ${e}`);
    return next(e);
  }
});

router.post('/fetchall', async (req, res, next) => {
  sendMessage('Running `git fetch --all`');
  try {
    const cmd = `cd ${config.primaryWorktree} && git fetch --all`;
    await execPromise(cmd);
    res.sendStatus(200);
  } catch (e) {
    console.error('Could not fetch all', e);
    sendMessage(`Could not fetch all due to error: ${e}`);
    return next(e);
  }
  sendMessage('Fetched');
});

module.exports = exp;
