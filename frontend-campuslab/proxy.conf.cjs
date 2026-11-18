// Desarrollo local: el navegador mantiene /api en el mismo origen.
// Configuración de nube conservada para volver a EC2/API Gateway más adelante:
// const cloudApiTarget = 'https://vz4o7zp3gf.execute-api.us-east-1.amazonaws.com';
module.exports = {
  '/api/**': {
    target: process.env.API_PROXY_TARGET || 'http://localhost:8080',
    secure: true,
    changeOrigin: true,
    configure(proxy) {
      proxy.on('proxyReq', (request) => {
        // This server-to-server request retains Authorization, but has no browser origin.
        request.removeHeader('origin');
      });
    },
  },
};
