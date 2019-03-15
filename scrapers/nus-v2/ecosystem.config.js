module.exports = {
  apps: [
    {
      name: 'NUS Scraper v2',
      script: 'build/index.js',

      args: 'all',
      instances: 1,
      // Set to false since this is a script and not a server, otherwise pm2 will keep trying
      // to restart this
      autorestart: false,
      watch: false,

      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
