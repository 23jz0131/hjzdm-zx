const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const target = process.env.BACKEND_ORIGIN || 'http://localhost:9090';

  app.use(
    [
      '/api/user',
      '/api/common',
      '/api/goods',
      '/api/disclosure',
      '/api/notification',
      '/api/comment',
      '/api/history',
      '/api/compare-history',
      '/api/collection',
      '/api/ai',
      '/api/category',
      // Old paths compatibility
      '/user',
      '/common',
      '/goods',
      '/disclosure',
      '/notification',
      '/comment',
      '/history',
      '/compare-history',
      '/collection',
      '/ai',
      '/category',
      // WebSocket endpoint
      '/ws',
    ],
    createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true,
      // Add pathRewrite if needed, but for now we keep it simple
      // pathRewrite: { '^/api': '' } 
    })
  );

  app.use(
    '/uploads',
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  );
};