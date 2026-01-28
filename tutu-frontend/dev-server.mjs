import fs from 'fs';
import { createServer } from 'https';
import { parse } from 'url';

import { createProxyMiddleware } from 'http-proxy-middleware';
import next from 'next';

import nextConfig from './next.config.mjs';

const basePath = nextConfig.basePath;
const port = parseInt(process.env.PORT, 10) || 3123;

const virkailijaOrigin = process.env.VIRKAILIJA_URL;
const tutuBackendOrigin = process.env.TUTU_BACKEND;
const isProd = process.env.NODE_ENV === 'production';

const app = next({
  conf: nextConfig,
  dev: !isProd,
  hostname: 'localhost',
  port: port,
  env: process.env,
  experimentalHttpsServer: true,
});

const handle = app.getRequestHandler();

const proxy = (origin) =>
  createProxyMiddleware({
    autoRewrite: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    changeOrigin: true,
    cookieDomainRewrite: 'localhost',
    secure: false,
    target: origin,
  });

const tutuBackendProxy = proxy(tutuBackendOrigin);
const virkailijaProxy = proxy(virkailijaOrigin);

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem'),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;
    if (!pathname || pathname === '' || pathname === '/') {
      res.writeHead(302, { Location: basePath });
      res.end();
    } else if (tutuBackendOrigin && pathname.startsWith('/tutu-backend')) {
      tutuBackendProxy(req, res);
    } else if (pathname.startsWith(basePath)) {
      handle(req, res, parsedUrl);
    } else {
      virkailijaProxy(req, res);
    }
  })
    .listen(port, () => {
      console.log('ready - started server on url: https://localhost:' + port);
    })
    .on('error', (e) => {
      console.error(e);
    });
});
