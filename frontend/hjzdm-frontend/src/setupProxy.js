const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const target = process.env.BACKEND_ORIGIN || 'http://localhost:9090';

  app.use(
    [
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
    ],
    createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true,
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
