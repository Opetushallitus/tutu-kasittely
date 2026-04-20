import { expect, test } from '@playwright/test';

import { clickSaveAndVerifyPayload } from '@/playwright/helpers/saveHelpers';
import { mockAll } from '@/playwright/mocks';

test.beforeEach(mockAll);

test('UO/RO-perustelun kentät näkyvät oikein ja kenttien muutos lähettää POST-kutsun backendille', async ({
  page,
}) => {
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustelu/uoro/',
  );
  await expect(page.getByTestId('perustelu-otsikko')).toHaveText(
    'Tiettyä kelpoisuutta koskevan UO/RO -päätöksen perustelut',
  );

  const koulutuksenSisaltoField = page.getByTestId('koulutuksenSisalto');

  await koulutuksenSisaltoField.scrollIntoViewIfNeeded();
  await expect(koulutuksenSisaltoField).toBeVisible();

  await koulutuksenSisaltoField.fill('Härköneeeeeen');

  await clickSaveAndVerifyPayload(page, '/perustelu/', {
    uoRoSisalto: {
      koulutuksenSisalto: 'Härköneeeeeen',
    },
  });
});
