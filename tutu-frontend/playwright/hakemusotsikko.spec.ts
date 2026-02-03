import { test, expect, Route } from '@playwright/test';

import { getHakemus } from '@/playwright/fixtures/hakemus1';
import { mockAll, mockBasicForHakemus } from '@/playwright/mocks';

test('Hakemusotsikko näyttää hakemuksen tiedot', async ({ page }) => {
  mockAll({ page });
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustiedot',
  );

  const hakija = page.getByTestId('hakemusotsikko-hakija');
  await expect(hakija).toHaveText('Heittotähti, Heikki Hemuli');

  const asiatunnus = page.getByTestId('hakemusotsikko-asiatunnus');
  await expect(asiatunnus).toHaveText('OPH-111-2025');

  const kirjausPvm = page.getByTestId('hakemusotsikko-kirjauspvm');
  await expect(kirjausPvm).toContainText('14.05.2025');

  const esittelyPvm = page.getByTestId('hakemusotsikko-kasittelyvaihe');
  await expect(esittelyPvm).toContainText('Hakemusta täydennetty 28.07.2025');

  const esittelija = page
    .getByTestId('hakemusotsikko-esittelija')
    .locator('input');
  await expect(esittelija).toHaveValue('1.2.246.562.24.999999999999');
});

test('Hakemusotsikko näyttää peruutetun hakemuksen tiedot', async ({
  page,
}) => {
  mockBasicForHakemus({ page });
  page.route('**/tutu-backend/api/hakemus/*', async (route: Route) => {
    const hakemus = getHakemus();
    hakemus.onkoPeruutettu = true;
    hakemus.ataruHakemustaMuokattu = '2025-07-28T10:59:47.597';

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(hakemus),
    });
  });
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustiedot',
  );

  const hakija = page.getByTestId('hakemusotsikko-hakija');
  await expect(hakija).toHaveText('Heittotähti, Heikki Hemuli');

  const kirjausPvm = page.getByTestId('hakemusotsikko-kirjauspvm');
  await expect(kirjausPvm).toContainText('14.05.2025');

  const esittelyPvm = page.getByTestId('hakemusotsikko-kasittelyvaihe');
  await expect(esittelyPvm).toContainText('Hakemusta täydennetty 28.07.2025');
});
