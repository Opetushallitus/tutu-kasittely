import { expect, test } from '@playwright/test';

import { expectRequestData } from '@/playwright/helpers/testUtils';
import { translate } from '@/playwright/helpers/translate';
import {
  mockEsittelijat,
  mockInit,
  mockUser,
  mockHakemus,
  mockPaatos,
  mockPaatosteksti,
} from '@/playwright/mocks';

test.beforeEach(async ({ page }) => {
  await mockInit(page);
  await mockEsittelijat(page);
  await mockUser(page);
  await mockHakemus(page);
  await mockPaatos(page);
  await mockPaatosteksti(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.11.00000000001/editori/paatos',
  );
});

test('Olemassaoleva työversio näkyy oikein', async ({ page }) => {
  await expect(page.getByTestId('editor-content-editable')).toHaveText(
    'Päätosteksti sisältö',
  );
  await expect(
    page.getByText(await translate(page, 'hakemus.editori.paatos.vahvista')),
  ).toBeEnabled();
  await expect(page.getByTestId('save-ribbon-button')).toBeHidden();
});

test('Muokkauksesta lähetetään PUT -kutsu backendille', async ({ page }) => {
  const saveButton = page.getByTestId('save-ribbon-button');
  await expect(saveButton).toBeHidden();

  await expectRequestData(
    page,
    '/paatosteksti/paatosteksti-id',
    page.getByTestId('editor-content-editable').fill('Muokattu päätösteksti'),
    {
      sisalto:
        '<p><span style="white-space: pre-wrap;">Muokattu päätösteksti</span></p>',
    },
  );
  await expect(saveButton).toBeHidden();
});

test('Päätöstekstin vahvistamisesta lähetetään PUT -kutsu backendille', async ({
  page,
}) => {
  const saveButton = page.getByTestId('save-ribbon-button');
  await expect(saveButton).toBeHidden();

  await page
    .getByTestId('editor-content-editable')
    .fill('Muokattu vahvistettava päätösteksti');

  await page
    .getByText(await translate(page, 'hakemus.editori.paatos.vahvista'))
    .click();

  const [request] = await Promise.all([
    page.waitForRequest(
      (req) =>
        req.url().includes('/paatosteksti/paatosteksti-id/vahvista') &&
        req.method() === 'PUT',
    ),
    page.getByTestId('modal-confirm-button').click(),
  ]);

  expect(request.postDataJSON()).toMatchObject({
    sisalto:
      '<p><span style="white-space: pre-wrap;">Muokattu vahvistettava päätösteksti</span></p>',
  });
});

test('Päätöstekstin tallennuksen epäonnistuessa näytetään virhetoast', async ({
  page,
}) => {
  await page.route(
    '**/tutu-backend/api/paatos/1.2.246.562.11.00000000001/paatosteksti/paatosteksti-id**',
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
    .getByTestId('editor-content-editable')
    .fill('Muokattu paatosteksti');

  const saveButton = page.getByTestId('save-ribbon-button');
  await expect(saveButton).toBeVisible();
  await saveButton.click();

  await expect(
    page.getByText(await translate(page, 'virhe.paatostekstiTallennus')),
  ).toBeVisible();
  await expect(page.getByTestId('toast-alert')).toHaveAttribute(
    'data-severity',
    'error',
  );
});
