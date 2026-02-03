import { expect, test } from '@playwright/test';

import { getHakemus } from '@/playwright/fixtures/hakemus1';
import {
  expectDataFromDropdownSelection,
  expectRequestData,
} from '@/playwright/helpers/testUtils';
import {
  mockUser,
  mockBasicForHakemus,
  mockHakemus,
  mockLopullisenPaatoksenHakemus,
  mockKoodistot,
} from '@/playwright/mocks';

import { _perustietoSisalto } from './fixtures/hakemus1/_perustietoSisalto';

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
    hakemus.sisalto = _perustietoSisalto;
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

test('Lopullisen päätöksen hakemuksen perustiedot näkyvät oikein, ja muutoksista lähetetään PUT -kutsut backendille', async ({
  page,
}) => {
  await mockUser(page);
  await mockKoodistot(page);
  await mockLopullisenPaatoksenHakemus(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.11.00000000002/perustiedot',
  );

  const vastaavaEhdollinen = page.getByTestId('vastaavaEhdollinenPaatos-input');
  const suoritusmaa = page.getByTestId('suoritusmaa-select');
  await expect(vastaavaEhdollinen).toBeVisible();
  await expect(vastaavaEhdollinen).toHaveValue('OPH-11-2025');

  await expect(suoritusmaa).toBeVisible();
  await expect(suoritusmaa).toHaveText('Tadžikistan');
  await expect(
    page.getByTestId('sisalto-item-917a7238-e839-4e0c-912f-05a8bd734042'),
  ).toHaveText('Säätäjä');
  await expect(
    page.getByTestId('sisalto-item-8d416b6e-1739-4c67-a098-86f1106fd239'),
  ).toHaveText('Oy Ab');
  await expect(
    page.getByTestId('sisalto-item-3af23df4-7255-445e-8c31-fa4f04ffab32'),
  ).toHaveText('Elämän koulu');

  await expectRequestData(
    page,
    '/hakemus/',
    vastaavaEhdollinen.fill('OPH-15-2025'),
    {
      lopullinenPaatosVastaavaEhdollinenAsiatunnus: 'OPH-15-2025',
    },
  );

  await expectDataFromDropdownSelection(
    page,
    suoritusmaa,
    'Bahama',
    '/hakemus/',
    {
      lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri:
        'maatjavaltiot2_044',
    },
  );
});

test('Hakemuksen peruutustiedot näkyvät oikein, ja muutoksista lähetetään PUT -kutsut backendille', async ({
  page,
}) => {
  await mockUser(page);
  await mockKoodistot(page);
  await mockLopullisenPaatoksenHakemus(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.11.00000000002/perustiedot',
  );

  const peruutusCheckbox = page.getByTestId('peruutus-checkbox');
  const peruutuspPvm = page.getByTestId('peruutus-calendar').locator('input');
  const peruutusLisatieto = page.getByTestId('peruutus-lisatieto');

  await expect(peruutusCheckbox).toBeVisible();
  await expect(peruutuspPvm).toBeVisible();
  await expect(peruutusLisatieto).toBeHidden();

  await expectRequestData(page, '/hakemus/', peruutusCheckbox.click(), {
    onkoPeruutettu: true,
  });
  await expect(peruutusLisatieto).toBeVisible();

  await peruutuspPvm.click();
  await page.locator('.react-datepicker__day--026').click();
  await page.locator('body').click({ position: { x: 1, y: 1 } });
  await expect(peruutuspPvm).toHaveValue(/^26\.\d{2}\.\d{4}$/);

  await expectRequestData(
    page,
    '/hakemus/',
    peruutusLisatieto.fill('Lisää tietoa'),
    {
      peruutusLisatieto: 'Lisää tietoa',
    },
  );
});
