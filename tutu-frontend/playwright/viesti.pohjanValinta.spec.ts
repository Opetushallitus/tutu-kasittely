import { expect, test } from '@playwright/test';

import {
  mockEsittelijat,
  mockHakemus,
  mockInit,
  mockUser,
  mockViestiLista,
  mockViestiOletussisalto,
  mockViestipohjanValinta,
  mockViestiTyoversio,
  viestiTyoversio,
} from '@/playwright/mocks';

test.beforeEach(async ({ page }) => {
  await mockInit(page);
  await mockEsittelijat(page);
  await mockUser(page);
  await mockHakemus(page);
  await mockViestiTyoversio(page, viestiTyoversio);
  await mockViestiLista(page);
  await mockViestiOletussisalto(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.11.00000000001/editori/viesti',
  );
});

test('Viestipohjalista avautuu ja sulkeutuu onnistuneesti, olemassaolevat pohjat näkyvät listalla', async ({
  page,
}) => {
  await mockViestipohjanValinta(page);
  const addPohjaButton = page.getByTestId('add-tekstipohja-button');
  await expect(addPohjaButton).toBeVisible();
  await addPohjaButton.click();

  const sisaltoContainer = page.getByTestId('tekstipohja-lista-sisalto');
  const suljeButton = page.getByTestId('close-lista-button');
  await expect(page.getByTestId('tekstipohja-lista')).toBeVisible();
  await expect(suljeButton).toBeVisible();
  await expect(addPohjaButton).toBeHidden();

  const kategoriaContainers = sisaltoContainer.locator(':scope > *');
  await expect(kategoriaContainers).toHaveCount(2);

  const kategoria1 = kategoriaContainers.nth(0).locator(':scope > *');
  await expect(kategoria1).toHaveCount(4);
  await expect(kategoria1.nth(0)).toHaveText('1. Ennakkotiedot');
  await expect(kategoria1.nth(1)).toHaveText('Ennakkotieto1');
  await expect(kategoria1.nth(2)).toHaveText('Ennakkotieto2');
  await expect(kategoria1.nth(3)).toHaveText('Ennakkotieto3');

  const kategoria2 = kategoriaContainers.nth(1).locator(':scope > *');
  await expect(kategoria2).toHaveCount(2);
  await expect(kategoria2.nth(0)).toHaveText('2. Täydennyspyynnöt');
  await expect(kategoria2.nth(1)).toHaveText('Täydennyspyyntö1');

  await suljeButton.click();
  await expect(page.getByTestId('tekstipohja-lista')).toBeHidden();
  await expect(addPohjaButton).toBeVisible();
});

test('Viestipohjan valinnan yhteydessä sisältö liitetään editorissa näkyvään tekstiin', async ({
  page,
}) => {
  await mockViestipohjanValinta(page);
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

test('Viestipohjalistan latauksen epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await mockViestipohjanValinta(page, true);
  await page.getByTestId('add-tekstipohja-button').click();

  await expect(page.getByTestId('tekstipohja-lista')).toBeVisible();
  await expect(page.getByTestId('tekstipohja-lista-sisalto')).toBeHidden();
  await expect(page.getByTestId('toast-alert')).toBeVisible();
  await expect(page.getByTestId('toast-alert')).toHaveAttribute(
    'data-severity',
    'error',
  );
});

test('Viestipohjan latauksen epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await mockViestipohjanValinta(page, false, true);
  await page.getByTestId('add-tekstipohja-button').click();

  await expect(page.getByTestId('tekstipohja-lista')).toBeVisible();
  await expect(page.getByTestId('tekstipohja-lista-sisalto')).toBeVisible();

  const sisaltoContainer = page.getByTestId('tekstipohja-lista-sisalto');
  const firstPohjaButton = sisaltoContainer
    .locator(':scope > *')
    .nth(0)
    .locator(':scope > *')
    .nth(1);
  await firstPohjaButton.click();

  await expect(page.getByTestId('toast-alert')).toBeVisible();
  await expect(page.getByTestId('toast-alert')).toHaveAttribute(
    'data-severity',
    'error',
  );
  await expect(page.getByTestId('editor-content-editable')).toContainText(
    'Tämä on työversio',
  );
});
