import { expect, Page, Route, test } from '@playwright/test';

import {
  expectDataFromDropdownSelection,
  expectRequestData,
} from '@/playwright/helpers/testUtils';
import {
  mockEsittelijat,
  mockInit,
  mockUser,
  mockHakemus,
  unwrapData,
} from '@/playwright/mocks';
import { Viesti } from '@/src/lib/types/viesti';

test.beforeEach(async ({ page }) => {
  await mockInit(page);
  await mockEsittelijat(page);
  await mockUser(page);
  await mockHakemus(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.11.00000000001/editori/viesti',
  );
});

const uusiViesti: Viesti = { kieli: 'en' };
const tyoversio: Viesti = {
  kieli: 'fi',
  tyyppi: 'ennakkotieto',
  otsikko: 'Työversio',
  viesti: 'Tämä on työversio',
};

const mockViestiTyoversio = (page: Page, viesti: Viesti) => {
  return page.route(
    '**/tutu-backend/api/viesti/tyoversio/*',
    async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(viesti),
      });
    },
  );
};

const mockViesti = (page: Page, viesti: Viesti) => {
  return page.route(
    '**/tutu-backend/api/viesti/1.2.246.562.11.*',
    async (route: Route) => {
      if (route.request().method() === 'PUT') {
        const putData = route.request().postDataJSON() as Record<
          string,
          unknown
        >;
        viesti = { ...viesti, ...unwrapData(putData) };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(viesti),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(viesti),
        });
      }
    },
  );
};

test('Uusi viesti näkyy oikein, hakemuksen kieli valittu automaattisesti', async ({
  page,
}) => {
  await mockViestiTyoversio(page, uusiViesti);
  const kieliSelect = page.getByTestId('viesti-kieli-select');
  await expect(kieliSelect).toBeVisible();
  await expect(kieliSelect).toHaveText('Englanti');
});

test('Olemassaoleva työversio näkyy oikein', async ({ page }) => {
  await mockViestiTyoversio(page, tyoversio);
  await expect(page.getByTestId('viesti-kieli-select')).toHaveText('Suomi');
  await expect(
    page.locator('input[type="radio"][value="ennakkotieto"]'),
  ).toBeChecked();
  await expect(
    page.getByTestId('viesti-otsikko-input').getByRole('textbox'),
  ).toHaveValue('Työversio');
  await expect(page.getByTestId('editor-content-editable')).toHaveText(
    'Tämä on työversio',
  );
});

test('Muokkauksesta lähetetään PUT -kutsu backendille', async ({ page }) => {
  await mockViestiTyoversio(page, uusiViesti);
  await mockViesti(page, uusiViesti);

  await expectDataFromDropdownSelection(
    page,
    page.getByTestId('viesti-kieli-select'),
    'Ruotsi',
    '/viesti/',
    {
      kieli: 'sv',
    },
  );

  await expectRequestData(
    page,
    '/viesti/',
    page
      .getByTestId('viesti-tyyppi-radio-group')
      .locator('input[type="radio"][value="muu"]')
      .click(),
    {
      kieli: 'sv',
      tyyppi: 'muu',
    },
  );

  // @TODO Tähän oma tallennus-tarkistus kun editorin hasChanges -logiikka on valmis
  await page
    .getByTestId('editor-content-editable')
    .fill('Tämä on varsinainen viesti');
  await expectRequestData(
    page,
    '/viesti/',
    page
      .getByTestId('viesti-otsikko-input')
      .getByRole('textbox')
      .fill('Tämä on otsikko'),
    {
      kieli: 'sv',
      tyyppi: 'muu',
      otsikko: 'Tämä on otsikko',
      viesti:
        '<p><span style="white-space: pre-wrap;">Tämä on varsinainen viesti</span></p>',
    },
  );
});
