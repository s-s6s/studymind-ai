module.exports = {
  apps: [
    {
      name: 'studymind-frontend',
      script: 'node',
      args: '.next/standalone/server.js',
      cwd: '/home/user/webapp/studymind-ai/frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
    }
  ]
}
