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
  let callCounter = 0;
  return page.route(
    '**/tutu-backend/api/viesti/tyoversio/*',
    async (route: Route) => {
      callCounter++;
      const response = callCounter === 1 ? viesti : uusiViesti;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    },
  );
};

const mockViesti = (page: Page, viesti: Viesti) => {
  return page.route(
    '**/tutu-backend/api/viesti/1.2.246.562.11.**',
    async (route: Route) => {
      if (route.request().method() === 'PUT') {
        const putData = route.request().postDataJSON() as Record<
          string,
          unknown
        >;
        viesti = { ...viesti, ...unwrapData(putData) };
        if (route.request().url().includes('/vahvista')) {
          viesti.vahvistaja = 'viljo vahvistaja';
        }
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

const expectViestiFormToBeEmpty = async (page: Page) => {
  await expect(page.getByTestId('viesti-kieli-select')).toHaveText('Englanti');
  await expect(
    page
      .getByTestId('viesti-tyyppi-radio-group')
      .getByRole('radio', { checked: true }),
  ).toHaveCount(0);
  await expect(
    page.getByTestId('viesti-otsikko-input').getByRole('textbox'),
  ).toBeEmpty();
  await expect(page.getByTestId('editor-content-editable')).toBeEmpty();

  await expect(page.getByTestId('viesti-tyhjenna-button')).toBeEnabled();
  await expect(page.getByTestId('viesti-kopioi-button')).toBeDisabled();
  await expect(page.getByTestId('viesti-vahvista-button')).toBeDisabled();
};

test('Uusi viesti näkyy oikein, hakemuksen kieli valittu automaattisesti', async ({
  page,
}) => {
  await mockViestiTyoversio(page, uusiViesti);
  const kieliSelect = page.getByTestId('viesti-kieli-select');
  await expect(kieliSelect).toBeVisible();
  await expectViestiFormToBeEmpty(page);
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
  await expect(page.getByTestId('viesti-kopioi-button')).toBeEnabled();
  await expect(page.getByTestId('viesti-vahvista-button')).toBeEnabled();
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
  await expect(
    page
      .getByTestId('viesti-tyyppi-radio-group')
      .getByRole('radio', { checked: true }),
  ).toHaveCount(1);
});

test('Viestin vahvistamisesta lähetetään PUT -kutsu backendille ja viestin kentät tyhjennetään', async ({
  page,
}) => {
  await mockViestiTyoversio(page, tyoversio);
  await mockViesti(page, tyoversio);

  await expect(page.getByTestId('viesti-vahvista-button')).toBeEnabled();
  await page.getByTestId('viesti-vahvista-button').click();
  await expect(page.getByTestId('modal-component')).toBeVisible();

  await Promise.all([
    page.waitForRequest(
      (req) => req.url().includes('/vahvista') && req.method() === 'PUT',
    ),
    page.getByTestId('modal-confirm-button').click(),
  ]);

  await expect(page.getByTestId('toast-alert')).toBeVisible();
  await expect(page.getByTestId('toast-alert')).toHaveAttribute(
    'data-severity',
    'success',
  );
  await expectViestiFormToBeEmpty(page);
});

test('Kenttien tyhjennyksestä lähetetään PUT -kutsu backendille', async ({
  page,
}) => {
  await mockViestiTyoversio(page, tyoversio);
  await mockViesti(page, tyoversio);

  await page.getByTestId('viesti-tyhjenna-button').click();
  await expect(page.getByTestId('modal-component')).toBeVisible();

  const [request] = await Promise.all([
    page.waitForRequest(
      (req) => req.url().includes('/viesti/') && req.method() === 'PUT',
    ),
    page.getByTestId('modal-confirm-button').click(),
  ]);
  expect(request.postDataJSON()).toMatchObject({
    tyyppi: null,
    otsikko: null,
    viesti: null,
  });

  await expect(
    page
      .getByTestId('viesti-tyyppi-radio-group')
      .getByRole('radio', { checked: true }),
  ).toHaveCount(0);
  await expect(
    page.getByTestId('viesti-otsikko-input').getByRole('textbox'),
  ).toBeEmpty();
  await expect(page.getByTestId('editor-content-editable')).toBeEmpty();
  await expect(page.getByTestId('toast-alert')).toBeVisible();
  await expect(page.getByTestId('toast-alert')).toHaveAttribute(
    'data-severity',
    'success',
  );
});

test('Viestin latauksen epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  page.route('**/tutu-backend/api/viesti/tyoversio/*', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'latausvirhe',
      }),
    });
  });
  await expect(page.getByTestId('toast-alert')).toBeVisible();
  await expect(page.getByTestId('toast-alert')).toHaveAttribute(
    'data-severity',
    'error',
  );
  await expect(page.getByTestId('viesti-otsikko')).toBeHidden();
  await expect(page.getByTestId('viesti-kieli-select')).toBeHidden();
});

test('Viestin tallennuksen epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await mockViestiTyoversio(page, tyoversio);
  page.route('**/tutu-backend/api/viesti/1.2.246.562.11.**', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'tallennusvirhe',
      }),
    });
  });
  await page
    .getByTestId('viesti-otsikko-input')
    .getByRole('textbox')
    .fill('Tämä on otsikko');
  const saveButton = page.getByTestId('save-ribbon-button');
  await expect(saveButton).toBeVisible();
  await saveButton.click();

  await expect(page.getByTestId('toast-alert')).toBeVisible();
  await expect(page.getByTestId('toast-alert')).toHaveAttribute(
    'data-severity',
    'error',
  );
});
