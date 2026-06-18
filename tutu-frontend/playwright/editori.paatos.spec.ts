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
  mockTekstipohjanValinta,
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
    '/paatosteksti',
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
  const vahvistettuAikaleima = page.getByTestId('vahvistettu-aikaleima');
  const vahvistaButton = page.getByTestId('vahvista-kopioi-painike');
  await expect(vahvistaButton).toHaveText(
    await translate(page, 'hakemus.editori.paatos.vahvista'),
  );

  await expect(vahvistettuAikaleima).toBeHidden();

  await page
    .getByTestId('editor-content-editable')
    .fill('Muokattu vahvistettava päätösteksti');

  await vahvistaButton.click();

  const [request] = await Promise.all([
    page.waitForRequest(
      (req) =>
        req.url().includes('/paatosteksti/vahvista') && req.method() === 'PUT',
    ),
    page.getByTestId('modal-confirm-button').click(),
  ]);

  expect(request.postDataJSON()).toMatchObject({
    sisalto:
      '<p><span style="white-space: pre-wrap;">Muokattu vahvistettava päätösteksti</span></p>',
  });

  await expect(vahvistettuAikaleima).toBeVisible();
  await expect(vahvistaButton).toHaveText(
    await translate(page, 'hakemus.editori.paatos.kopioi'),
  );
});

test('Vahvistetun päätöstekstin tallennus palauttaa tekstin vahvistamattomaksi', async ({
  page,
}) => {
  const saveButton = page.getByTestId('save-ribbon-button');
  const editori = page.getByTestId('editor-content-editable');
  await expect(saveButton).toBeHidden();
  const vahvistettuAikaleima = page.getByTestId('vahvistettu-aikaleima');
  const vahvistaButton = page.getByTestId('vahvista-kopioi-painike');
  await expect(vahvistaButton).toHaveText(
    await translate(page, 'hakemus.editori.paatos.vahvista'),
  );
  await expect(vahvistettuAikaleima).toBeHidden();

  await editori.fill('Vahvistettava päätösteksti');
  await vahvistaButton.click();
  await page.getByTestId('modal-confirm-button').click();
  await expect(vahvistettuAikaleima).toBeVisible();
  await expect(vahvistaButton).toHaveText(
    await translate(page, 'hakemus.editori.paatos.kopioi'),
  );

  await editori.fill('Muokattu päätösteksti');
  await saveButton.click();
  await expect(vahvistaButton).toHaveText(
    await translate(page, 'hakemus.editori.paatos.vahvista'),
  );
  await expect(vahvistettuAikaleima).toBeHidden();
});

test('Päätöspohjan valinnan yhteydessä sisältö liitetään editorissa näkyvään tekstiin', async ({
  page,
}) => {
  await mockTekstipohjanValinta(page, 'paatospohja');
  await page.getByTestId('add-tekstipohja-button').click();
  await expect(page.getByTestId('tekstipohja-lista')).toBeVisible();

  const sisaltoContainer = page.getByTestId('tekstipohja-lista-sisalto');
  const firstPohjaButton = sisaltoContainer
    .locator(':scope > *')
    .nth(0)
    .locator(':scope > *')
    .nth(1);
  await firstPohjaButton.click();
  await expect(page.getByTestId('editor-content-editable')).toContainText(
    'Suomi pohjassa',
  );
  await expect(page.getByTestId('toast-alert')).toBeVisible();
  await expect(page.getByTestId('toast-alert')).toHaveAttribute(
    'data-severity',
    'success',
  );
});

test('Päätöstekstin tallennuksen epäonnistuessa näytetään virhetoast', async ({
  page,
}) => {
  await mockPaatosteksti(page, undefined, true);
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
