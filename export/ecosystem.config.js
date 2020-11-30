module.exports = {
  apps: [
    {
      name: 'Export (Staging)',
      script: 'build/index.js',

      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3301,
      },
    },
    {
      name: 'Export',
      script: '../../nusmods-export/build/index.js',
      cwd: '../../nusmods-export',

      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3300,
      },
    },
  ],
};
