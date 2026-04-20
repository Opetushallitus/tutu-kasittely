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
  await expect(page.getByTestId('filemaker-hakemus-list')).toBeVisible();
  const hakemusRow = page.getByTestId('filemaker-hakemus-row');

  await expect(hakemusRow).toHaveCount(20);
});

test('Hakemuslistan filtteri ja sivutus saa oikeat arvot query-parametreista', async ({
  page,
}) => {
  // Navigoi suoraan filemaker-hakemuksiin
  await page.goto('/tutu-frontend/filemaker?page=5&haku=hakufraasi');

  const hakukentta = page.getByTestId('hakukentta').locator('input');
  const sivunumeroView = page.getByTestId('page-view');

  await expect(hakukentta).toHaveValue('hakufraasi');
  await expect(sivunumeroView).toHaveText('5');
});

test('Hakemuslistan sivutuspainikkeet päivittävät hakuehdot', async ({
  page,
}) => {
  // Navigoi filemaker-hakemuksiin
  await page.goto('/tutu-frontend/filemaker?page=2');

  const nextButton = page.getByTestId('next-page');
  const prevButton = page.getByTestId('prev-page');

  // odotetaan että hakemuslista on ladattu
  await expect(page.getByTestId('filemaker-hakemus-list')).toBeVisible();

  // Check that next button works
  const [nextPageRequest] = await Promise.all([
    page.waitForRequest((req) => req.url().includes(`/vanha-tutu/lista`)),
    nextButton.click(),
  ]);

  expect(nextPageRequest.url()).toContain('page=3');

  // Check that prev button works
  const [prevPageRequest] = await Promise.all([
    page.waitForRequest((req) => req.url().includes(`/vanha-tutu/lista`)),
    prevButton.click(),
  ]);

  expect(prevPageRequest.url()).toContain('page=2');
});
