const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    const backendTarget = process.env.REACT_APP_API_URL || 'http://localhost:8000';

    console.log(`[Proxy] Initializing: /api -> ${backendTarget}`);

    app.use(
        '/api',
        createProxyMiddleware({
            target: backendTarget,
            changeOrigin: true,
            secure: false, // Useful for local dev with self-signed certs
            pathRewrite: (path, req) => {
                const newPath = path.replace(/^\/api/, '');
                console.log(`[Proxy] Routing: ${path} -> ${newPath}`);
                return newPath;
            },
            onProxyReq: (proxyReq, req, res) => {
                console.log(`[Proxy] ${req.method} Request: ${req.url}`);
            },
            onProxyRes: (proxyRes, req, res) => {
                console.log(`[Proxy] Response status: ${proxyRes.statusCode} from ${req.url}`);
            },
            onError: (err, req, res) => {
                console.error('[Proxy] Error:', err.message);
                res.writeHead(500, {
                    'Content-Type': 'application/json',
                });
                res.end(JSON.stringify({
                    error: 'Proxy Error',
                    message: `Cannot connect to backend at ${backendTarget}`,
                    details: err.message
                }));
            },
        })
    );
};
