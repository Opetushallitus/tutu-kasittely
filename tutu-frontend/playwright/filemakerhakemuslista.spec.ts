import { test, expect } from '@playwright/test';
import {
  mockInit,
  mockFilemakerList,
  mockBasicForLista,
  mockSuccessfullLists,
} from '@/playwright/mocks';

test.beforeEach(({ page }) => {
  return Promise.all([
    mockBasicForLista({ page }),
    mockInit(page),
    mockFilemakerList(page),
    mockSuccessfullLists({ page }),
  ]);
});

test('Hakemuslistaus latautuu', async ({ page }) => {
  // Navigoi filemaker-hakemuksiin
  await page.goto('/tutu-frontend');
  await expect(
    page.getByTestId('hakemuslista-tab--filemakerHakemukset'),
  ).toBeVisible();
  await page.getByTestId('hakemuslista-tab--filemakerHakemukset').click();

  // odotetaan että hakemuslista on ladattu
  await expect(page.getByTestId('hakemus-list')).toBeVisible();
  const hakemusRow = page.getByTestId('hakemus-row');

  expect(await hakemusRow.count()).toBe(4);
});

test('Hakemuslistan filtteri ja sivutu saa oikeat arvot query-parametreista', async ({
  page,
}) => {
  // Navigoi filemaker-hakemuksiin
  await page.goto('/tutu-frontend?fm-page=5&fm-haku=hakufraasi');
  await expect(
    page.getByTestId('hakemuslista-tab--filemakerHakemukset'),
  ).toBeVisible();
  await page.getByTestId('hakemuslista-tab--filemakerHakemukset').click();

  const hakukentta = page.getByTestId('hakukentta').locator('input');
  const sivunumeroView = page.getByTestId('fm-page-view');

  await expect(hakukentta).toHaveValue('hakufraasi');
  await expect(sivunumeroView).toHaveText('5');
});

test('Hakemuslistan sivutuspainikkeet päivittävät hakuehdot', async ({
  page,
}) => {
  // Navigoi filemaker-hakemuksiin
  await page.goto('/tutu-frontend?fm-page=2');
  await expect(
    page.getByTestId('hakemuslista-tab--filemakerHakemukset'),
  ).toBeVisible();
  await page.getByTestId('hakemuslista-tab--filemakerHakemukset').click();

  const nextButton = await page.getByTestId('fm-next-page');
  const prevButton = await page.getByTestId('fm-prev-page');

  // Check that next button works
  const [nextPageRequest] = await Promise.all([
    page.waitForRequest((req) => req.url().includes(`/vanha-tutu/lista`)),
    nextButton.click(),
  ]);

  expect(nextPageRequest.url()).toEqual(expect.stringContaining('fm-page=3'));

  // Check that prev button works
  const [prevPageRequest] = await Promise.all([
    page.waitForRequest((req) => req.url().includes(`/vanha-tutu/lista`)),
    prevButton.click(),
  ]);

  expect(prevPageRequest.url()).toEqual(expect.stringContaining('fm-page=2'));
});
