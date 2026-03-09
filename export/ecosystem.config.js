module.exports = {
  apps: [
    {
      name: 'Export (Staging)',
      script: 'build/src/index.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        PORT: 3301,
      },
      max_memory_restart: '500M',
      watch: false,
    },
    {
      cwd: '../../nusmods-export',
      name: 'Export',
      script: '../../nusmods-export/build/src/index.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        PORT: 3300,
      },
      max_memory_restart: '500M',
      watch: false,
    },
  ],
};
