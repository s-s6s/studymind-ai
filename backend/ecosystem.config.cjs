module.exports = {
  apps: [
    {
      name: 'studymind-backend',
      script: 'uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 8000 --reload',
      cwd: '/home/user/webapp/studymind-ai/backend',
      interpreter: 'python3',
      interpreter_args: '-m',
      env: {
        PYTHONPATH: '/home/user/webapp/studymind-ai/backend',
        NODE_ENV: 'production'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
