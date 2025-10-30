import { expect, test } from '@playwright/test';
import { mockAll } from '@/playwright/mocks';
import { getPerustelu } from '@/playwright/fixtures/perustelu1';
import * as dateFns from 'date-fns';
import { DATE_TIME_STANDARD_PLACEHOLDER } from '@/src/constants/constants';
import { setupPerusteluRoute } from '@/playwright/helpers/routeHandlers';
import { clickSaveAndVerifyPayload } from '@/playwright/helpers/saveHelpers';

const matchingDate = () => {
  const testDate = new Date(2025, 8, 26, 0, 0, 0, 0);
  return dateFns.format(testDate, DATE_TIME_STANDARD_PLACEHOLDER);
};

test.beforeEach(async ({ page }) => {
  await mockAll({ page });
  const perustelu = getPerustelu();
  await setupPerusteluRoute(page, perustelu);
});

test('Lausuntokentät näkyvät oikein ja kenttien muutos lähettää POST-kutsun backendille', async ({
  page,
}) => {
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustelu/yleiset/lausunto/',
  );
  await expect(page.getByTestId('perustelu-layout-otsikko')).toHaveText(
    'Lausuntopyynnöt',
  );
  const lausuntopyyntoLisatietoInput = page.getByTestId(
    'pyyntojenLisatiedot-input',
  );
  const lausuntoSisaltoInput = page.getByTestId('lausunnonSisalto-input');
  await expect(lausuntopyyntoLisatietoInput).toHaveValue('pyynö');
  await expect(lausuntoSisaltoInput).toHaveValue('sisältö');

  await expect(page.getByTestId('lausuntopyynto-otsikko-1')).toHaveText(
    'Lausuntopyyntö 1',
  );
  const lausunnonAntaja1 = page.getByTestId('lausunnon-antaja-1');
  const lahetetty1 = page.getByTestId('lausuntoPyyntoLahetetty-calendar-1');
  const vastattu1 = page.getByTestId('lausuntoPyyntoVastattu-calendar-1');

  await expect(lausunnonAntaja1).toHaveValue('Kostaja');
  await expect(lahetetty1.locator('input')).toHaveValue('01.09.2025');
  await expect(vastattu1.locator('input')).toHaveValue('30.09.2025');

  await expect(page.getByTestId('lausuntopyynto-otsikko-2')).toHaveText(
    'Lausuntopyyntö 2',
  );
  await expect(page.getByTestId('lausunnon-antaja-2')).toHaveValue(
    'Aas Weckström',
  );
  await expect(
    page.getByTestId('lausuntoPyyntoLahetetty-calendar-2').locator('input'),
  ).toHaveValue('01.11.2025');
  await expect(
    page.getByTestId('lausuntoPyyntoVastattu-calendar-2').locator('input'),
  ).toHaveValue('30.11.2025');

  await lausuntopyyntoLisatietoInput.fill('lisääää');

  await clickSaveAndVerifyPayload(page, '/perustelu/', {
    lausuntoPyyntojenLisatiedot: 'lisääää',
  });

  await lausuntoSisaltoInput.fill('sisältöä elämähän');

  await clickSaveAndVerifyPayload(page, '/perustelu/', {
    lausunnonSisalto: 'sisältöä elämähän',
  });

  await lausunnonAntaja1.fill('Esko Mörkö');

  await clickSaveAndVerifyPayload(page, '/perustelu/', {
    lausuntopyynnot: [{ lausunnonAntaja: 'Esko Mörkö' }],
  });

  await lahetetty1.click();
  await page.locator('.react-datepicker__day--026').click();

  await clickSaveAndVerifyPayload(page, '/perustelu/', {
    lausuntopyynnot: [{ lahetetty: matchingDate() }],
  });

  await vastattu1.click();
  await page.locator('.react-datepicker__day--026').click();

  await clickSaveAndVerifyPayload(page, '/perustelu/', {
    lausuntopyynnot: [{ saapunut: matchingDate() }],
  });
});

test('Lausuntopyyntöjen lisäys ja poisto toimivat oikein', async ({ page }) => {
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustelu/yleiset/lausunto/',
  );
  await page.getByTestId('lisaa-lausuntopyynto-button').click();
  await expect(page.getByTestId('lausuntopyynto-otsikko-3')).toHaveText(
    'Lausuntopyyntö 3',
  );

  await page.getByTestId('lausunnon-antaja-3').fill('Pertti Keinonen');

  await clickSaveAndVerifyPayload(page, '/perustelu/', {
    lausuntopyynnot: [
      { lausunnonAntaja: 'Kostaja' },
      { lausunnonAntaja: 'Aas Weckström' },
      { lausunnonAntaja: 'Pertti Keinonen' },
    ],
  });

  await page.getByTestId('poista-lausuntopyynto-button-2').click();
  await expect(page.getByTestId('modal-component')).toBeVisible();

  await page.getByTestId('modal-confirm-button').click();

  await clickSaveAndVerifyPayload(page, '/perustelu/', {
    lausuntopyynnot: [
      { lausunnonAntaja: 'Kostaja' },
      { lausunnonAntaja: 'Pertti Keinonen' },
    ],
  });
});
