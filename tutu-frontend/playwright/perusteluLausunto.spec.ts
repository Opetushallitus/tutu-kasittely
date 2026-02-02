import { expect, test } from '@playwright/test';
import * as dateFns from 'date-fns';

import { getPerustelu } from '@/playwright/fixtures/perustelu1';
import { setupPerusteluRoute } from '@/playwright/helpers/routeHandlers';
import {
  clickSaveAndVerifyPayload,
  waitForSaveComplete,
} from '@/playwright/helpers/saveHelpers';
import { mockAll } from '@/playwright/mocks';
import { DATE_TIME_STANDARD_PLACEHOLDER } from '@/src/constants/constants';

import { translate } from './helpers/translate';

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
  const lausuntopyynnot = await translate(
    page,
    'hakemus.perustelu.lausuntotiedot.lausuntopyynnot',
  );
  const lausuntopyynto1 = await translate(
    page,
    'hakemus.perustelu.lausuntotiedot.lausuntopyynto',
    '',
    { numero: 1 },
  );
  const lausuntopyynto2 = await translate(
    page,
    'hakemus.perustelu.lausuntotiedot.lausuntopyynto',
    '',
    { numero: 2 },
  );
  await expect(page.getByTestId('perustelu-otsikko')).toHaveText(
    lausuntopyynnot,
  );

  await expect(page.getByTestId('lausuntopyynto-otsikko-1')).toBeVisible();

  const lausuntopyyntoLisatietoInput = page.getByTestId(
    'pyyntojenLisatiedot-input',
  );
  const lausuntoSisaltoInput = page.getByTestId('lausunnonSisalto-input');
  await expect(lausuntopyyntoLisatietoInput).toHaveValue(
    'Lisätietoja lausuntopyynnöistä',
  );
  await expect(lausuntoSisaltoInput).toHaveValue(
    'Lausunto on myönteinen. Tutkinto on rinnastettavissa suomalaiseen ylempään korkeakoulututkintoon.',
  );

  await expect(page.getByTestId('lausuntopyynto-otsikko-1')).toHaveText(
    lausuntopyynto1,
  );
  const lausunnonAntaja1 = page.getByTestId('lausunnon-antaja-1');
  const lahetetty1 = page.getByTestId('lausuntoPyyntoLahetetty-calendar-1');
  const vastattu1 = page.getByTestId('lausuntoPyyntoVastattu-calendar-1');

  await expect(lausunnonAntaja1).toBeVisible({ timeout: 15000 });
  await expect(lausunnonAntaja1).toContainText('Helsingin yliopisto');
  await expect(lahetetty1.locator('input')).toHaveValue('01.09.2025');
  await expect(vastattu1.locator('input')).toHaveValue('30.09.2025');

  await expect(page.getByTestId('lausuntopyynto-otsikko-2')).toHaveText(
    lausuntopyynto2,
  );
  const lausunnonAntaja2 = page.getByTestId('lausunnon-antaja-2');
  await expect(lausunnonAntaja2).toBeVisible({ timeout: 15000 });
  await expect(lausunnonAntaja2).toContainText('Aalto-yliopisto');
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
  await waitForSaveComplete(page);

  await lausuntoSisaltoInput.fill('sisältöä elämähän');

  await clickSaveAndVerifyPayload(page, '/perustelu/', {
    lausunnonSisalto: 'sisältöä elämähän',
  });
  await waitForSaveComplete(page);

  await lausunnonAntaja1.click();
  await page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator('text=Muu lausunnon antaja')
    .click();
  await page.getByTestId('muu-lausunnon-antaja-1').fill('Esko Mörkö');

  await clickSaveAndVerifyPayload(page, '/perustelu/', {
    lausuntopyynnot: [
      {
        lausunnonAntajaKoodiUri: null,
        lausunnonAntajaMuu: 'Esko Mörkö',
        lahetetty: '2025-09-01T00:00:00',
        saapunut: '2025-09-30T00:00:00',
      },
      {
        lausunnonAntajaKoodiUri: 'oppilaitosnumero_10076',
        lausunnonAntajaMuu: null,
        lahetetty: '2025-11-01T00:00:00',
        saapunut: '2025-11-30T00:00:00',
      },
    ],
  });
  await waitForSaveComplete(page);

  await lahetetty1.click();
  await page.locator('.react-datepicker__day--026').click();

  await clickSaveAndVerifyPayload(page, '/perustelu/', {
    lausuntopyynnot: [
      {
        lausunnonAntajaKoodiUri: null,
        lausunnonAntajaMuu: 'Esko Mörkö',
        lahetetty: matchingDate(),
        saapunut: '2025-09-30T00:00:00',
      },
      {
        lausunnonAntajaKoodiUri: 'oppilaitosnumero_10076',
        lausunnonAntajaMuu: null,
        lahetetty: '2025-11-01T00:00:00',
        saapunut: '2025-11-30T00:00:00',
      },
    ],
  });
  await waitForSaveComplete(page);

  await vastattu1.click();
  await page.locator('.react-datepicker__day--026').click();

  await clickSaveAndVerifyPayload(page, '/perustelu/', {
    lausuntopyynnot: [
      {
        lausunnonAntajaKoodiUri: null,
        lausunnonAntajaMuu: 'Esko Mörkö',
        lahetetty: matchingDate(),
        saapunut: matchingDate(),
      },
      {
        lausunnonAntajaKoodiUri: 'oppilaitosnumero_10076',
        lausunnonAntajaMuu: null,
        lahetetty: '2025-11-01T00:00:00',
        saapunut: '2025-11-30T00:00:00',
      },
    ],
  });
});

test('Lausuntopyyntöjen lisäys ja poisto toimivat oikein', async ({ page }) => {
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustelu/yleiset/lausunto/',
  );

  await expect(page.getByTestId('lausuntopyynto-otsikko-1')).toBeVisible();

  await page.getByTestId('lisaa-lausuntopyynto-button').click();
  const lausuntopyynto3 = await translate(
    page,
    'hakemus.perustelu.lausuntotiedot.lausuntopyynto',
    '',
    { numero: 3 },
  );
  await expect(page.getByTestId('lausuntopyynto-otsikko-3')).toHaveText(
    lausuntopyynto3,
  );

  const lausunnonAntaja3 = page.getByTestId('lausunnon-antaja-3');
  await expect(lausunnonAntaja3).toBeVisible({ timeout: 15000 });
  await lausunnonAntaja3.click();
  await page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator('text=Muu lausunnon antaja')
    .click();
  await page.getByTestId('muu-lausunnon-antaja-3').fill('Pertti Keinonen');

  await clickSaveAndVerifyPayload(page, '/perustelu/', {
    lausuntopyynnot: [
      {
        lausunnonAntajaKoodiUri: 'oppilaitosnumero_01901',
        lausunnonAntajaMuu: null,
        lahetetty: '2025-09-01T00:00:00',
        saapunut: '2025-09-30T00:00:00',
      },
      {
        lausunnonAntajaKoodiUri: 'oppilaitosnumero_10076',
        lausunnonAntajaMuu: null,
        lahetetty: '2025-11-01T00:00:00',
        saapunut: '2025-11-30T00:00:00',
      },
      {
        lausunnonAntajaKoodiUri: null,
        lausunnonAntajaMuu: 'Pertti Keinonen',
        lahetetty: null,
        saapunut: null,
      },
    ],
  });
  await waitForSaveComplete(page);

  await page.getByTestId('poista-lausuntopyynto-button-2').click();
  await expect(page.getByTestId('modal-component')).toBeVisible();

  await clickSaveAndVerifyPayload(
    page,
    '/perustelu/',
    {
      lausuntopyynnot: [
        {
          lausunnonAntajaKoodiUri: 'oppilaitosnumero_01901',
          lausunnonAntajaMuu: null,
          lahetetty: '2025-09-01T00:00:00',
          saapunut: '2025-09-30T00:00:00',
        },
        {
          lausunnonAntajaKoodiUri: null,
          lausunnonAntajaMuu: 'Pertti Keinonen',
          lahetetty: null,
          saapunut: null,
        },
      ],
    },
    page.getByTestId('modal-confirm-button'),
  );
});
