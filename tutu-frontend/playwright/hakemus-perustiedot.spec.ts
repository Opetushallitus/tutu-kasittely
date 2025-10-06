import { expect, test } from '@playwright/test';
import { mockUser, mockBasicForHakemus, mockHakemus } from '@/playwright/mocks';
import { getHakemus } from '@/playwright/fixtures/hakemus1';
import _sisalto from './fixtures/hakemus1/_perustietoSisalto.json';

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
  await expect(page.getByTestId('kansalaisuus')).toHaveText('Suomi, Ruotsi');
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
  mockHakemus(page, 'sv');
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustiedot',
  );
  await expect(page.getByTestId('kansalaisuus')).toHaveText('Finland, Ruåtsi');
  await expect(page.getByTestId('asuinmaa')).toHaveText('Finland');
  await expect(page.getByTestId('kotikunta')).toHaveText('Helsingfors');
  await expect(page.getByTestId('paatoskieli')).toHaveText('finska');
  await expect(page.getByTestId('asiointikieli')).toHaveText('finska');
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

test('Hakemuksen perustiedot näkyvät sisällössä oikein', async ({ page }) => {
  await mockUser(page);

  await page.route('**/tutu-backend/api/hakemus/*', async (route) => {
    const hakemus = getHakemus();
    hakemus.sisalto = _sisalto;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(hakemus),
    });
  });

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustiedot',
  );
  await expect(page.getByTestId('hakemus-koskee')).toHaveText(
    'Kelpoisuus ammattiin',
  );
  await expect(
    page.getByTestId('sisalto-item-7d07bf15-79ab-4d2a-b1b9-63f03c1d0862'),
  ).toHaveText('jesari');
  await expect(
    page.getByTestId('sisalto-item-1d4bb273-0889-401e-aae1-5134a12cf238'),
  ).toHaveText('Kyllä');
});
