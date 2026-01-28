import { expect, test } from '@playwright/test';

import { mockAll } from '@/playwright/mocks';

test.beforeEach(mockAll);

test('Tab navigaation active tab näkyy oikein, myös reloadin jälkeen', async ({
  page,
}) => {
  const hakemusOid = '1.2.246.562.10.00000000001';

  await page.goto(`/tutu-frontend/hakemus/${hakemusOid}/perustiedot`);
  await expect(
    page.getByRole('tab', { name: 'Hakijan ja hakemuksen tiedot' }),
  ).toHaveClass(/Mui-selected/);

  await page.reload();
  await expect(page).toHaveURL(
    `/tutu-frontend/hakemus/${hakemusOid}/perustiedot`,
  );
  await expect(
    page.getByRole('tab', { name: 'Hakijan ja hakemuksen tiedot' }),
  ).toHaveClass(/Mui-selected/);

  await page.goto(`/tutu-frontend/hakemus/${hakemusOid}/asiakirjat`);
  await expect(page.getByRole('tab', { name: 'Asiakirjat' })).toHaveClass(
    /Mui-selected/,
  );

  await page.reload();
  await expect(page).toHaveURL(
    `/tutu-frontend/hakemus/${hakemusOid}/asiakirjat`,
  );
  await expect(page.getByRole('tab', { name: 'Asiakirjat' })).toHaveClass(
    /Mui-selected/,
  );

  await page.goto(`/tutu-frontend/hakemus/${hakemusOid}/tutkinnot`);
  await expect(page.getByRole('tab', { name: 'Tutkinnot' })).toHaveClass(
    /Mui-selected/,
  );

  await page.reload();
  await expect(page).toHaveURL(
    `/tutu-frontend/hakemus/${hakemusOid}/tutkinnot`,
  );
  await expect(page.getByRole('tab', { name: 'Tutkinnot' })).toHaveClass(
    /Mui-selected/,
  );

  await page.goto(
    `/tutu-frontend/hakemus/${hakemusOid}/perustelu/yleiset/perustelut`,
  );
  await expect(
    page.getByRole('tab', { name: 'Yleiset perustelut / Lausuntotiedot' }),
  ).toHaveClass(/Mui-selected/);

  await page.reload();
  await expect(page).toHaveURL(
    `/tutu-frontend/hakemus/${hakemusOid}/perustelu/yleiset/perustelut`,
  );
  await expect(
    page.getByRole('tab', { name: 'Yleiset perustelut / Lausuntotiedot' }),
  ).toHaveClass(/Mui-selected/);
});
