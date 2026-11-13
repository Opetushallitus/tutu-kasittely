import { expect, test } from '@playwright/test';

import { mockTekstipohjatKategorioittain } from '@/playwright/fixtures/tekstipohjat';
import {
  mockEsittelijat,
  mockHakemus,
  mockInit,
  mockUser,
  mockViestiLista,
  mockViestiOletussisalto,
  mockTekstipohjanValinta,
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
  await mockTekstipohjanValinta(page, 'viestipohja');
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
  await expect(kategoria1.nth(0)).toHaveText('1. Ennakkotiedot');
  await kategoria1.nth(0).click();
  await expect(kategoria1.nth(1)).toHaveText('Ennakkotieto1');
  await expect(kategoria1.nth(2)).toHaveText('Ennakkotieto2');
  await expect(kategoria1.nth(3)).toHaveText('Ennakkotieto3');
  await expect(kategoria1).toHaveCount(4);

  const kategoria2 = kategoriaContainers.nth(1).locator(':scope > *');
  await expect(kategoria2.nth(0)).toHaveText('2. Täydennyspyynnöt');
  await kategoria2.nth(0).click();
  await expect(kategoria2.nth(1)).toHaveText('Täydennyspyyntö1');
  await expect(kategoria2).toHaveCount(2);

  await suljeButton.click();
  await expect(page.getByTestId('tekstipohja-lista')).toBeHidden();
  await expect(addPohjaButton).toBeVisible();
});

test('Viestipohjan valinnan yhteydessä sisältö liitetään editorissa näkyvään tekstiin', async ({
  page,
}) => {
  await mockTekstipohjanValinta(page, 'viestipohja');
  await page.getByTestId('add-tekstipohja-button').click();
  await expect(page.getByTestId('tekstipohja-lista')).toBeVisible();

  const sisaltoContainer = page.getByTestId('tekstipohja-lista-sisalto');
  const firstKategoriaButton = sisaltoContainer.locator(':scope > *').nth(0);
  await firstKategoriaButton.click();

  const firstPohjaButton = firstKategoriaButton.locator(':scope > *').nth(1);
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

test('Kahden viestipohjan peräkkäinen valinta hakee ja liittää kummankin pohjan kerran', async ({
  page,
}) => {
  await mockTekstipohjanValinta(page, 'viestipohja');
  const [pohja1, pohja2] = mockTekstipohjatKategorioittain()[0].pohjat;
  const pohjaHaut: Array<string | undefined> = [];
  page.on('request', (request) => {
    const pathname = new URL(request.url()).pathname;
    if (
      pathname.startsWith('/tutu-backend/api/viestipohja/') &&
      !pathname.endsWith('kategorioittain')
    ) {
      pohjaHaut.push(pathname.split('/').pop());
    }
  });

  await page.getByTestId('add-tekstipohja-button').click();
  await page.getByRole('button', { name: '1. Ennakkotiedot' }).click();
  const editori = page.getByTestId('editor-content-editable');

  await page.getByRole('button', { name: pohja1.nimi, exact: true }).click();
  await expect(editori).toContainText(`Suomi pohjassa: ${pohja1.id}`);

  await page.getByRole('button', { name: pohja2.nimi, exact: true }).click();
  await expect(editori).toContainText(`Suomi pohjassa: ${pohja2.id}`);

  const teksti = (await editori.textContent()) ?? '';
  expect(teksti.split(`Suomi pohjassa: ${pohja1.id}`)).toHaveLength(2);
  expect(pohjaHaut).toEqual([pohja1.id, pohja2.id]);
});

test('Viestipohjalistan latauksen epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await mockTekstipohjanValinta(page, 'viestipohja', true);
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
  await mockTekstipohjanValinta(page, 'viestipohja', false, true);
  await page.getByTestId('add-tekstipohja-button').click();

  await expect(page.getByTestId('tekstipohja-lista')).toBeVisible();
  await expect(page.getByTestId('tekstipohja-lista-sisalto')).toBeVisible();

  const sisaltoContainer = page.getByTestId('tekstipohja-lista-sisalto');

  const firstKategoriaButton = sisaltoContainer.locator(':scope > *').nth(0);
  await firstKategoriaButton.click();

  const firstPohjaButton = firstKategoriaButton.locator(':scope > *').nth(1);
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
