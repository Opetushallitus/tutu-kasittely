import { createServer } from 'http';

const port = 3104;

export default async function playwrightSetup() {
  const server = createServer(async (request, response) => {
    if (request.url?.endsWith('apply-raamit.js')) {
      response.write('');
      response.end();
      return;
    } else if (request.url?.endsWith(`favicon.ico`)) {
      response.writeHead(404);
      response.end();
      return;
    } else {
      console.log('(Backend) mock not implemented', request.url);
      return;
    }
  });
  server.listen(port, () => {
    console.log(`(Backend) Mock server listening on port ${port}`);
  });
  server.once('error', (err) => {
    console.error(err);
  });
}
