import fs from 'fs';
import path, { resolve } from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const portStr = env.PORT || '3123';

  const configJs = `
    window.configuration = {
      IS_DEV: ${mode === 'development'},
      IS_PROD: ${mode === 'production'},
      IS_TEST: ${mode === 'test'},
      VIRKAILIJA_URL: "${env.VIRKAILIJA_URL}",
      TUTU_BACKEND: "${env.TUTU_BACKEND}",
      PUBLIC_TOLGEE_API_URL: "${env.PUBLIC_TOLGEE_API_URL}",
      PUBLIC_TOLGEE_API_KEY: "${env.PUBLIC_TOLGEE_API_KEY}",
    };
  `;
  fs.writeFileSync(path.resolve(__dirname, 'public/config.js'), configJs);

  const cspHeaders = [
    "default-src 'self'",
    `connect-src 'self' app.tolgee.io ${env.TUTU_BACKEND} ${env.VIRKAILIJA_URL} https://cdn.jsdelivr.net`,
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    `script-src-elem 'self' 'unsafe-inline' ${env.VIRKAILIJA_URL} https://cdn.jsdelivr.net/npm/@tolgee/web@prerelease/dist/tolgee-in-context-tools.umd.min.js`,
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "img-src 'self' blob: data:",
    "font-src 'self' fonts.gstatic.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, '.'),
      },
    },
    server: {
      headers: {
        'Content-Security-Policy': cspHeaders,
        //"default-src 'self'; connect-src 'self' app.tolgee.io ${env.TUTU_BACKEND} ${env.VIRKAILIJA_URL} https://cdn.jsdelivr.net; script-src 'self' 'unsafe-eval' 'unsafe-inline'; script-src-elem 'self' 'unsafe-inline' `${env.VIRKAILIJA_URL}` https://cdn.jsdelivr.net/npm/@tolgee/web@prerelease/dist/tolgee-in-context-tools.umd.min.js; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' blob: data:; font-src 'self' fonts.gstatic.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';",
      },
      https: {
        key: fs.readFileSync('./certificates/localhost-key.pem'),
        cert: fs.readFileSync('./certificates/localhost.pem'),
      },
      host: `${env.HOST || 'localhost'}`,
      port: parseInt(portStr, 10),
      proxy: {
        '/tutu-backend/api': {
          target: `${env.TUTU_BACKEND}/tutu-backend/api`,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
