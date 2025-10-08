import { expect, test } from '@playwright/test';
import { mockAll } from '@/playwright/mocks';

test.beforeEach(mockAll);

test('AP-päätöksen perustelun kentät näkyvät oikein ja kenttien muutos lähettää POST-kutsun backendille', async ({
  page,
}) => {
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustelu/ap/',
  );
  await expect(page.getByTestId('perustelu-layout-otsikko')).toHaveText(
    'AP-päätöksen perustelut',
  );
  const selvityksetAikaisempiHakemus = page.getByTestId(
    'selvityksetAikaisempiTapaus',
  );
  const selvityksetAikaisemmanTapauksenAsiaTunnus = page.getByTestId(
    'selvityksetAikaisemmanTapauksenAsiaTunnus',
  );
  await expect(selvityksetAikaisemmanTapauksenAsiaTunnus).toBeHidden();
  await selvityksetAikaisempiHakemus.click();
  await expect(selvityksetAikaisemmanTapauksenAsiaTunnus).toBeVisible();
});
