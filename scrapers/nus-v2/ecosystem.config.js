/* eslint-disable camelcase */

module.exports = {
  apps: [
    {
      name: 'NUS Scraper v2',
      script: 'scripts/run.sh',

      instances: 1,
      // Can't get pm2 cron or system cron to work, and since the API is so unpredictably bad,
      // we just restart the script every hour regardless of whether it is successful or not
      autorestart: true,
      restart_delay: 60 * 60 * 1000,

      watch: false,

      env: {
        NODE_ENV: 'production',
        _: '/home/ubuntu/.nvm/versions/node/v18.14.2/bin/pm2',
      },
    },
  ],
};
