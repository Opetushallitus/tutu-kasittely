import { Route, Page } from '@playwright/test';
import { readFile } from 'fs/promises';
import path from 'path';

export async function mockRoute({ page }: { page: Page }) {
  await page.route('**/tutu-backend/api/csrf', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        parameterName: '_csrf',
        token:
          'Gbt6oz01mVW5QV7XQ-hz_5P6BKJ_qkPb0xhjx6ZiW8uYyAnhKotKklkFqjGUJz-0dMVHyqqZKZscnSL24SsBpMRQOvn-rTCF',
        headerName: 'X-CSRF-TOKEN',
      }),
    });
  });
  await page.route('**/tutu-backend/api/user', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          userOid: '1.2.246.562.24.999999999999',
          authorities: [
            'ROLE_APP_TUTU_ESITTELIJA',
            'ROLE_APP_TUTU_ESITTELIJA_1.2.246.562.10.00000000001',
          ],
          asiointikieli: 'fi',
        },
      }),
    });
  });
  await page.route('**/tutu-backend/api/session', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        empty: false,
        traversableAgain: true,
      }),
    });
  });
  await page.route('**/tutu-backend/api/esittelijat*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: await readFile(path.join(__dirname, './fixtures/esittelijat.json')),
    });
  });
  await page.route(
    '**/tutu-backend/api/hakemuslista*',
    async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: await readFile(
          path.join(__dirname, './fixtures/hakemukset.json'),
        ),
      });
    },
  );

  await page.route('**/tutu-backend/api/hakemus/*', async (route: Route) => {
    const url = route.request().url();
    const oid = url.split('/').pop();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        hakemusOid: oid,
        hakijanEtunimet: 'Heikki Hemuli',
        hakijanSukunimi: 'Heittotähti',
        hakijanHetu: '121280-123A',
        asiatunnus: 'OPH-111-2025',
        kirjausPvm: '2025-05-14T10:59:47.597',
        esittelyPvm: '2025-05-28T10:59:47.597',
        paatosPvm: '2025-05-28T10:59:47.597',
        esittelijaOid: '1.2.246.562.24.999999999999',
        ataruHakemuksenTila: 'kasittelymaksamatta',
        kasittelyVaihe: 'HakemustaTaydennetty',
        muokattu: '2025-06-28T10:59:47.597',
      }),
    });
  });
}
