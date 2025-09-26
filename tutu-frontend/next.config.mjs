/** @type {import('next').NextConfig} */

const cspHeaders = {
  'default-src': "'self'",
  'connect-src': `'self' https://app.tolgee.io ${process.env.TUTU_BACKEND} ${process.env.VIRKAILIJA_URL} ${process.env.NODE_ENV !== 'production' ? 'https://cdn.jsdelivr.net' : ''}`,
  'script-src': `'self' 'unsafe-eval' 'unsafe-inline' ${process.env.NODE_ENV !== 'production' ? 'https://cdn.jsdelivr.net' : ''}`,
  'script-src-elem': `'self' 'unsafe-inline' ${process.env.VIRKAILIJA_URL} ${process.env.NODE_ENV !== 'production' ? 'https://cdn.jsdelivr.net' : ''}`,
  'style-src': "'self' 'unsafe-inline' fonts.googleapis.com",
  'img-src': "'self' blob: data:",
  'font-src': "'self' data:",
  'object-src': "'none'",
  'base-uri': "'self'",
  'form-action': "'self'",
  'frame-ancestors': "'none'",
  'block-all-mixed-content': '',
  'upgrade-insecure-requests': '',
};

const isStandalone = process.env.STANDALONE === 'true';

const basePath = '/tutu-frontend';

const nextConfig = {
  basePath,
  compress: false, // nginx hoitaa pakkauksen
  eslint: {
    ignoreDuringBuilds: true,
  },
  allowedDevOrigins: ['host.docker.internal', '127.0.0.1'],
  typescript: {
    ignoreBuildErrors: Boolean(process.env.CI),
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: Object.entries(cspHeaders)
              .map(([k, v]) => `${k} ${v};`)
              .join(''),
          },
        ],
      },
    ];
  },
  env: {
    VIRKAILIJA_URL: process.env.VIRKAILIJA_URL,
    APP_URL: process.env.APP_URL,
    TUTU_BACKEND: process.env.TUTU_BACKEND,
    TEST: process.env.TEST,
    LOCAL_TRANSLATIONS: process.env.LOCAL_TRANSLATIONS,
  },
  output: isStandalone ? 'standalone' : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
