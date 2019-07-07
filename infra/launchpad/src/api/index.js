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

router.get('/commits', async (req, res) => {
  res.send('Commits endpoint');
});

module.exports = exp;
