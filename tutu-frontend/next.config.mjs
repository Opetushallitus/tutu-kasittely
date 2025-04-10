/** @type {import('next').NextConfig} */

const cspHeaders = {
  'default-src': "'self'",
  'connect-src': "'self' https://app.tolgee.io",
  'script-src':
    "'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net/npm/@tolgee/web@prerelease/dist/tolgee-in-context-tools.umd.min.js",
  'style-src': "'self' 'unsafe-inline'",
  'img-src': "'self' blob: data:",
  'font-src': "'self'",
  'object-src': "'none'",
  'base-uri': "'self'",
  'form-action': "'self'",
  'frame-ancestors': "'none'",
  'block-all-mixed-content': '',
  'upgrade-insecure-requests': '',
};

const isStandalone = process.env.STANDALONE === 'true';

const basePath = '/valintojen-toteuttaminen';

const nextConfig = {
  basePath,
  compress: false, // nginx hoitaa pakkauksen
  eslint: {
    ignoreDuringBuilds: true,
  },
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
  env: {},
  output: isStandalone ? 'standalone' : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
