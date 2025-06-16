import { test, expect } from '@playwright/test';
import { mockRoute } from '@/playwright/mocks';

test.beforeEach(mockRoute);

test('Hakemusotsikko näyttää hakemuksen tiedot', async ({ page }) => {
  await page.route(
    '**/tutu-backend/api/hakemus/1.2.246.562.10.00000000001',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          hakemusOid: '1.2.246.562.10.00000000001',
          hakijanEtunimet: 'Heikki Hemuli',
          hakijanSukunimi: 'Heittotähti',
          hakijanHetu: '121280-123A',
          asiatunnus: 'OPH-111-2025',
          kirjausPvm: '2025-05-14T10:59:47.597',
          esittelyPvm: '2025-05-28T10:59:47.597',
          paatosPvm: '2025-05-28T10:59:47.597',
          esittelijaOid: '1.2.246.562.24.999999999999',
          ataruHakemuksenTila: 'kasittelymaksamatta',
        }),
      });
    },
  );

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustiedot',
  );

  const hakija = page.getByTestId('hakemusotsikko-hakija');
  await expect(hakija).toHaveText('Heittotähti, Heikki Hemuli - 121280-123A');

  const asiatunnus = page.getByTestId('hakemusotsikko-asiatunnus');
  await expect(asiatunnus).toHaveText('OPH-111-2025');

  const kirjausPvm = page.getByTestId('hakemusotsikko-kirjauspvm');
  await expect(kirjausPvm).toContainText('14.05.2025');

  const esittelyPvm = page.getByTestId('hakemusotsikko-esittelypvm');
  await expect(esittelyPvm).toContainText('28.05.2025');

  const paatosPvm = page.getByTestId('hakemusotsikko-lopullinenpaatospvm');
  await expect(paatosPvm).toContainText('28.05.2025');

  const esittelija = page
    .getByTestId('hakemusotsikko-esittelija')
    .locator('input');
  await expect(esittelija).toHaveValue('1.2.246.562.24.999999999999');
});
