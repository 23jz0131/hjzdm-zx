const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // 固定代理到本地后端 9090，确保与后端端口保持一致
  const target = 'http://localhost:9090';

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
