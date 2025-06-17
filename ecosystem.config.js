// ecosystem.config.js
module.exports = {
    apps: [
      {
        name: 'runner-backend-node',
        script: 'npm',
        args: 'start',
        interpreter: 'none',
        env: {
          NODE_ENV: 'production'
        }
      }
    ]
  };
  