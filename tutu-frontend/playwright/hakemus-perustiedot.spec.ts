import { expect, test } from '@playwright/test';
import { mockUser, mockBasicForHakemus, mockHakemus } from '@/playwright/mocks';

test.beforeEach(mockBasicForHakemus);

test('Henkilötiedot näkyvät oletuskielellä', async ({ page }) => {
  mockUser(page);
  mockHakemus(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustiedot',
  );
  await expect(page.getByTestId('etunimet')).toHaveText('Heikki Hemuli');
  await expect(page.getByTestId('kutsumanimi')).toHaveText('Hessu');
  await expect(page.getByTestId('sukunimi')).toHaveText('Heittotähti');
  await expect(page.getByTestId('kansalaisuus')).toHaveText('Suomi');
  await expect(page.getByTestId('hetu')).toHaveText('121280-123A');
  await expect(page.getByTestId('syntymaaika')).toHaveText('1980-01-01');
  await expect(page.getByTestId('matkapuhelin')).toHaveText('0401234567');
  await expect(page.getByTestId('asuinmaa')).toHaveText('Suomi');
  await expect(page.getByTestId('katuosoite')).toHaveText('Helsinginkatu 1');
  await expect(page.getByTestId('postinumero')).toHaveText('00100');
  await expect(page.getByTestId('postitoimipaikka')).toHaveText('Helsinki');
  await expect(page.getByTestId('kotikunta')).toHaveText('Helsinki');
  await expect(page.getByTestId('sahkopostiosoite')).toHaveValue(
    'hessu@hemuli.com',
  );
  await expect(page.getByTestId('paatoskieli')).toHaveText('suomeksi');
  await expect(page.getByTestId('asiointikieli')).toHaveText('suomeksi');
});

test('Henkilötiedot näkyvät vaihtoehtoisella kielellä', async ({ page }) => {
  mockUser(page, 'sv');
  mockHakemus(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustiedot',
  );
  await expect(page.getByTestId('kansalaisuus')).toHaveText('Finland');
  await expect(page.getByTestId('asuinmaa')).toHaveText('Finland');
  await expect(page.getByTestId('kotikunta')).toHaveText('Helsingfors');
  await expect(page.getByTestId('paatoskieli')).toHaveText('finska');
  await expect(page.getByTestId('asiointikieli')).toHaveText('finska');
});

test('Muutoshistoriassa näkyy oikeat tiedot', async ({ page }) => {
  mockUser(page);
  mockHakemus(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustiedot',
  );
  const tableRows = page
    .getByTestId('muutoshistoria-table')
    .locator('tbody tr');
  await expect(tableRows).toHaveCount(2);
  await expect(tableRows.first().locator('td').last()).toHaveText(
    'Esittelija Testi (esittelijä)',
  );
  await expect(tableRows.last().locator('td').last()).toHaveText(
    'Hakija Testi (hakija)',
  );
});

test('Muutoshistoriassa näkyy oikeat tiedot, sortattuna laskevassa järjestyksessä', async ({
  page,
}) => {
  mockUser(page);
  mockHakemus(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustiedot',
  );
  const sortableHeader = page
    .getByTestId('muutoshistoria-table')
    .locator('thead tr th')
    .first();
  await sortableHeader.click();
  await sortableHeader.click();
  const tableRows = page
    .getByTestId('muutoshistoria-table')
    .locator('tbody tr');
  await expect(tableRows).toHaveCount(2);
  await expect(tableRows.first().locator('td').last()).toHaveText(
    'Hakija Testi (hakija)',
  );
  await expect(tableRows.last().locator('td').last()).toHaveText(
    'Esittelija Testi (esittelijä)',
  );
});

test('Hakemuksen lataus epäonnistuu', async ({ page }) => {
  mockUser(page);
  page.route('**/tutu-backend/api/hakemus/*', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        origin: 'kayttooikeuspalvelu',
        message: 'virheilmoitus',
      }),
    });
  });
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustiedot',
  );

  // tarkistetaan että virheviesti näkyy
  await expect(page.getByTestId('toast-message')).toBeVisible();
});
// TODO Testejä ainakin hakemuksen sisällölle sen mukaan mitä hakemus koskee
