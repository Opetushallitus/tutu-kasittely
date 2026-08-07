import { expect, test } from '@playwright/test';

import { mockAll } from '@/playwright/mocks';

test.beforeEach(mockAll);

test('Tab navigaation active tab näkyy oikein, myös reloadin jälkeen', async ({
  page,
}) => {
  test.slow();

  const hakemusOid = '1.2.246.562.10.00000000001';

  await page.goto(`/tutu-frontend/hakemus/${hakemusOid}/perustiedot`);
  await expect(
    page.getByRole('tab', { name: 'hakemusTabs.perustiedot' }),
  ).toHaveClass(/Mui-selected/);

  await page.reload();
  await expect(page).toHaveURL(
    `/tutu-frontend/hakemus/${hakemusOid}/perustiedot`,
  );
  await expect(
    page.getByRole('tab', { name: 'hakemusTabs.perustiedot' }),
  ).toHaveClass(/Mui-selected/);

  await page.goto(`/tutu-frontend/hakemus/${hakemusOid}/asiakirjat`);
  await expect(
    page.getByRole('tab', { name: 'hakemusTabs.asiakirjat' }),
  ).toHaveClass(/Mui-selected/);

  await page.reload();
  await expect(page).toHaveURL(
    `/tutu-frontend/hakemus/${hakemusOid}/asiakirjat`,
  );
  await expect(
    page.getByRole('tab', { name: 'hakemusTabs.asiakirjat' }),
  ).toHaveClass(/Mui-selected/);

  await page.goto(`/tutu-frontend/hakemus/${hakemusOid}/tutkinnot`);
  await expect(
    page.getByRole('tab', { name: 'hakemusTabs.tutkinnot' }),
  ).toHaveClass(/Mui-selected/);

  await page.reload();
  await expect(page).toHaveURL(
    `/tutu-frontend/hakemus/${hakemusOid}/tutkinnot`,
  );
  await expect(
    page.getByRole('tab', { name: 'hakemusTabs.tutkinnot' }),
  ).toHaveClass(/Mui-selected/);

  await page.goto(
    `/tutu-frontend/hakemus/${hakemusOid}/perustelu/yleiset/perustelut`,
  );
  await expect(
    page.getByRole('tab', { name: 'hakemusTabs.perustelu.yleiset' }),
  ).toHaveClass(/Mui-selected/);

  await page.reload();
  await expect(page).toHaveURL(
    `/tutu-frontend/hakemus/${hakemusOid}/perustelu/yleiset/perustelut`,
  );
  await expect(
    page.getByRole('tab', { name: 'hakemusTabs.perustelu.yleiset' }),
  ).toHaveClass(/Mui-selected/);
});
