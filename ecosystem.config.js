module.exports = {
  apps: [
    {
      name: 'api-middleware',
      script: 'src/server.js',
      instances: 'max', // Usar todos os cores disponíveis
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Configurações de monitoramento
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git'],
      
      // Configurações de log
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Configurações de restart
      autorestart: true,
      max_memory_restart: '1G',
      
      // Configurações de cluster
      min_uptime: '10s',
      max_restarts: 10,
      
      // Configurações de performance
      node_args: '--max-old-space-size=1024',
      
      // Configurações de health check
      health_check_grace_period: 3000,
      
      // Configurações de cron
      cron_restart: '0 2 * * *', // Restart diário às 2h da manhã
      
      // Variáveis de ambiente específicas
      env_file: '.env'
    }
  ],

  // Configurações de deploy
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/api-middleware.git',
      path: '/var/www/api-middleware',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
