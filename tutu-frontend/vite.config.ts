import fs from 'fs';
import path, { resolve } from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const portStr = env.PORT || '3123';

  if (mode !== 'production') {
    const apiUrl = env.PUBLIC_TOLGEE_API_URL ?? '';
    const apiKey = env.PUBLIC_TOLGEE_API_KEY ?? '';

    const configJs = `
      window.configuration = {
        IS_DEV: ${mode === 'development'},
        IS_PROD: ${mode === 'production'},
        IS_TEST: ${mode === 'test'},
        VIRKAILIJA_URL: "${env.VIRKAILIJA_URL}",
        TUTU_BACKEND: "${env.TUTU_BACKEND}",
        PUBLIC_TOLGEE_API_URL: "${apiUrl}",
        PUBLIC_TOLGEE_API_KEY: "${apiKey}",
      };
    `;
    fs.writeFileSync(
      path.resolve(__dirname, 'public/tutu-frontend/config.js'),
      configJs,
    );
  } else {
    const configPath = path.resolve(
      __dirname,
      'public/tutu-frontend/config.js',
    );
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  }

  const cspHeaders = [
    "default-src 'self'",
    `connect-src 'self' app.tolgee.io ${env.TUTU_BACKEND} ${env.VIRKAILIJA_URL} https://cdn.jsdelivr.net`,
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    `script-src-elem 'self' 'unsafe-inline' ${env.VIRKAILIJA_URL} https://cdn.jsdelivr.net/npm/@tolgee/web@prerelease/dist/tolgee-in-context-tools.umd.min.js`,
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "img-src 'self' blob: data:",
    "font-src 'self' fonts.gstatic.com data:",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  const stripExternalFontsInTest = {
    name: 'strip-external-fonts-in-test',
    transformIndexHtml(html: string) {
      return html.replace(/[ \t]*<link\b[^>]*fonts\.g[^>]*>\n?/gi, '');
    },
  };

  const host = `${env.HOST || 'localhost'}`;
  const port = parseInt(portStr, 10);
  const httpsOptions =
    mode === 'production'
      ? {}
      : {
          key: fs.readFileSync('./certificates/localhost-key.pem'),
          cert: fs.readFileSync('./certificates/localhost.pem'),
        };
  const headers = {
    'Content-Security-Policy': cspHeaders,
  };
  const proxy = {
    '/tutu-backend/api': {
      target: `${env.TUTU_BACKEND}/tutu-backend/api`,
      changeOrigin: true,
      secure: false,
    },
    '/lokalisointi': {
      target: env.VIRKAILIJA_URL,
      changeOrigin: true,
      secure: false,
    },
    '/virkailija-raamit': {
      target: env.VIRKAILIJA_URL,
      changeOrigin: true,
      secure: false,
      cookieDomainRewrite: 'localhost',
    },
  };

  return {
    base: '/',
    plugins: [react(), ...(mode === 'test' ? [stripExternalFontsInTest] : [])],
    build: {
      assetsDir: 'tutu-frontend/assets',
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, '.'),
      },
    },
    server: {
      strictPort: true,
      headers,
      https: httpsOptions,
      host,
      port,
      proxy,
    },
    preview: {
      strictPort: true,
      headers,
      https: httpsOptions,
      host,
      port,
      proxy,
    },
  };
});
