import { test, expect } from '@playwright/test';
import { mockAll } from '@/playwright/mocks';

test.beforeEach(mockAll);

test('Hakemusotsikko näyttää hakemuksen tiedot', async ({ page }) => {
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
  await expect(esittelyPvm).toContainText(
    'Käsittelyvaihe: Hakemusta täydennetty 28.07.2025',
  );

  const esittelija = page
    .getByTestId('hakemusotsikko-esittelija')
    .locator('input');
  await expect(esittelija).toHaveValue('1.2.246.562.24.999999999999');
});
