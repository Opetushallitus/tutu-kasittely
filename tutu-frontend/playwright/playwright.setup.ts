import { createServer } from 'http';

const port = 3104;

export default async function playwrightSetup() {
  const server = createServer((request, response) => {
    if (request.url?.endsWith('apply-raamit.js')) {
      response.writeHead(200, {
        'content-type': 'application/javascript; charset=utf-8',
      });
      response.end('// mocked by Playwright');
      return;
    }

    if (request.url?.endsWith('favicon.ico')) {
      response.writeHead(404);
      response.end();
      return;
    }

    console.log('(Backend) mock not implemented', request.url);
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('mock not implemented');
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, () => {
      console.log(`(Backend) Mock server listening on port ${port}`);
      resolve();
    });
  });

  return async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  };
}
