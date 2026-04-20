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
  mockViestiTyoversio,
  uusiViesti,
  mockViestiLista,
  viestiTyoversio,
  mockViesti,
  mockViestiOletussisalto,
  tallennettuTyoversio,
} from '@/playwright/mocks';

test.beforeEach(async ({ page }) => {
  await mockInit(page);
  await mockEsittelijat(page);
  await mockUser(page);
  await mockHakemus(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.11.00000000001/editori/viesti',
  );
});

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

test('Olemassaoleva työversio ja vahvistettujen lista näkyvät oikein', async ({
  page,
}) => {
  await mockViestiTyoversio(page, viestiTyoversio);
  await mockViestiLista(page);
  await mockViestiOletussisalto(page);
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
  await expect(page.getByTestId('viesti-vahvista-button')).toBeEnabled();

  const viestiTable = page.getByTestId('vahvistettu-viesti-table');
  await expect(viestiTable).toBeVisible();
  await expect(viestiTable.locator('tbody tr')).toHaveCount(3);
});

test('Muokkauksesta lähetetään PUT -kutsu backendille', async ({ page }) => {
  await mockViestiTyoversio(page, uusiViesti);
  await mockViesti(page, uusiViesti);
  await mockViestiLista(page);
  await mockViestiOletussisalto(page);

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
    },
  );
  await expectRequestData(
    page,
    '/viesti/',
    page
      .getByTestId('editor-content-editable')
      .fill('Tämä on varsinainen viesti'),
    {
      kieli: 'sv',
      tyyppi: 'muu',
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
  await mockViestiTyoversio(page, viestiTyoversio);
  await mockViesti(page, viestiTyoversio);
  await mockViestiLista(page);
  await mockViestiOletussisalto(page);

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

test('Kenttien tyhjennyksessä tyhjennetään muut kentät paitsi kielivalinta', async ({
  page,
}) => {
  await mockViestiTyoversio(page, uusiViesti);
  await mockViestiLista(page);
  await mockViestiOletussisalto(page);
  const kieliSelect = page.getByTestId('viesti-kieli-select');
  const otsikko = page.getByTestId('viesti-otsikko-input').getByRole('textbox');
  const sisalto = page.getByTestId('editor-content-editable');
  await page
    .getByTestId('viesti-tyyppi-radio-group')
    .locator('input[type="radio"][value="ennakkotieto"]')
    .click();
  await otsikko.fill('Tämä on otsikko');
  await sisalto.fill('Tämä on varsinainen viesti');

  await expect(
    page.locator('input[type="radio"][value="ennakkotieto"]'),
  ).toBeChecked();
  await expect(otsikko).toHaveValue('Tämä on otsikko');
  await expect(sisalto).toHaveText('Tämä on varsinainen viesti');
  await expect(page.getByTestId('viesti-vahvista-button')).toBeEnabled();

  await page.getByTestId('viesti-tyhjenna-button').click();
  await expect(page.getByTestId('modal-component')).toBeVisible();
  await page.getByTestId('modal-confirm-button').click();

  await expectViestiFormToBeEmpty(page);
  await expect(kieliSelect).toHaveText('Englanti');

  await expect(page.getByTestId('toast-alert')).toBeVisible();
  await expect(page.getByTestId('toast-alert')).toHaveAttribute(
    'data-severity',
    'success',
  );
});

test('Tallennetun viestin tyhjennyksestä lähetetään PUT -kutsu backendille', async ({
  page,
}) => {
  await mockViestiTyoversio(page, tallennettuTyoversio);
  await mockViesti(page, tallennettuTyoversio);
  await mockViestiLista(page);
  await mockViestiOletussisalto(page);

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
  await expect(page.getByTestId('viesti-vahvista-button')).toBeDisabled();
  await expect(page.getByTestId('toast-alert')).toBeVisible();
  await expect(page.getByTestId('toast-alert')).toHaveAttribute(
    'data-severity',
    'success',
  );
});

test('Viestityypin oletussisältö latautuu automaattisesti', async ({
  page,
}) => {
  await mockViestiTyoversio(page, uusiViesti);
  await mockViestiLista(page);
  await mockViestiOletussisalto(page);
  const sisalto = page.getByTestId('editor-content-editable');
  await page
    .getByTestId('viesti-tyyppi-radio-group')
    .locator('input[type="radio"][value="taydennyspyynto"]')
    .click();

  await expect(
    page.locator('input[type="radio"][value="taydennyspyynto"]'),
  ).toBeChecked();
  await expect(sisalto).toHaveText('Oletussisältö');
  await expect(page.getByTestId('viesti-vahvista-button')).toBeEnabled();
});

test('Viestin latauksen epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await page.route('**/tutu-backend/api/viesti/tyoversio/*', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'latausvirhe',
      }),
    });
  });
  await mockViestiLista(page);
  await expect(page.getByTestId('toast-alert')).toBeVisible();
  await expect(page.getByTestId('toast-alert')).toHaveAttribute(
    'data-severity',
    'error',
  );
  await expect(page.getByTestId('viesti-otsikko')).toBeHidden();
  await expect(page.getByTestId('viesti-kieli-select')).toBeHidden();
});

test('Viestilistan latauksen epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await mockViestiTyoversio(page, viestiTyoversio);
  await page.route(
    '**/tutu-backend/api/viestilista/1.2.246.562.11.00000000001',
    async (route: Route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'latausvirhe',
        }),
      });
    },
  );
  await expect(page.getByTestId('toast-alert')).toBeVisible();
  await expect(page.getByTestId('toast-alert')).toHaveAttribute(
    'data-severity',
    'error',
  );
  const viestiTable = page.getByTestId('vahvistettu-viesti-table');
  await expect(viestiTable).toBeVisible();
  await expect(viestiTable.locator('tbody tr')).toHaveCount(0);
});

test('Viestin tallennuksen epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await mockViestiTyoversio(page, viestiTyoversio);
  await mockViestiLista(page);
  await mockViestiOletussisalto(page);
  await page.route(
    '**/tutu-backend/api/viesti/1.2.246.562.11.**',
    async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'tallennusvirhe',
        }),
      });
    },
  );
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

test('Oletussisällön latauksen epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await mockViestiTyoversio(page, uusiViesti);
  await mockViestiLista(page);
  await page.route(
    '**/tutu-backend/api/viesti/oletussisalto/1.2.246.562.11.00000000001/**',
    async (route: Route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Ei kovin kiva',
        }),
      });
    },
  );
  await page
    .getByTestId('viesti-tyyppi-radio-group')
    .locator('input[type="radio"][value="taydennyspyynto"]')
    .click();

  await expect(
    page.locator('input[type="radio"][value="taydennyspyynto"]'),
  ).toBeChecked();
  await expect(page.getByTestId('editor-content-editable')).toBeEmpty();
  await expect(page.getByTestId('toast-alert')).toBeVisible();
  await expect(page.getByTestId('toast-alert')).toHaveAttribute(
    'data-severity',
    'error',
  );
});
