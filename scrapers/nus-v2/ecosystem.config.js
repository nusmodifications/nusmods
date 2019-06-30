module.exports = {
  apps: [
    {
      name: 'NUS Scraper v2',
      script: 'scripts/run.sh',

      instances: 1,
      // Set to false since this is a script and not a server, otherwise pm2 will keep trying
      // to restart this
      autorestart: false,
      watch: false,

      cron_restart: '0 10 4,5 * *',

      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
