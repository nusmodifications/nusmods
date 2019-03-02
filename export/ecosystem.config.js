module.exports = {
  apps : [{
    name: 'Export',
    script: 'app.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3300,
    },
    env_staging: {
      NODE_ENV: 'production',
      PORT: 3301,
    }
  }],
};
