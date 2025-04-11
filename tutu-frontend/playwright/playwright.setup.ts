import { ServerResponse, createServer } from 'http';

const port = 3104;

const modifyResponse = (response: ServerResponse, body: unknown) => {
  response.setHeader('content-type', 'application/json');
  response.write(JSON.stringify(body));
  response.end();
};

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
    } else if (
      request.url?.includes(`kayttooikeus-service/henkilo/current/omattiedot`)
    ) {
      return modifyResponse(response, {
        organisaatiot: [
          {
            organisaatioOid: 'OPH_ORGANIZATION_OID',
            kayttooikeudet: [{ palvelu: 'SERVICE_KEY', oikeus: 'CRUD' }],
          },
        ],
      });
    } else if (request.url?.endsWith('/parentoids')) {
      return modifyResponse(response, ['OPH_ORGANIZATION_OID']);
    } else if (request.url?.includes(`henkilo/current/asiointiKieli`)) {
      response.setHeader('content-type', 'text/plain');
      response.write('fi');
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
