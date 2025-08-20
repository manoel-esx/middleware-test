const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log do erro
  logger.error('Erro capturado:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    query: req.query,
    params: req.params
  });

  // Se o erro já tem status, use-o
  const status = err.status || err.statusCode || 500;
  
  // Se o erro já tem mensagem, use-a
  const message = err.message || 'Erro interno do servidor';

  // Em desenvolvimento, inclua o stack trace
  const response = {
    error: message,
    status,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};

module.exports = { errorHandler };
