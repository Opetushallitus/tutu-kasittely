import { expect, test } from '@playwright/test';
import {
  mockBasicForHakemus,
  mockLiitteet,
  mockUser,
} from '@/playwright/mocks';
import { getHakemus } from '@/playwright/fixtures/hakemus1';
import * as dateFns from 'date-fns';
import { ImiPyynto } from '@/src/lib/types/hakemus';

test.beforeEach(mockBasicForHakemus);

test('IMI-Pyynnön kentät toimivat oikein Kelpoisuus ammattiin -hakemukselle', async ({
  page,
}) => {
  let callCount = 0;

  await mockUser(page);
  await mockLiitteet(page);

  const hakemus = getHakemus();

  await page.route('**/tutu-backend/api/hakemus/*', async (route) => {
    callCount++;
    const imiPyynto: ImiPyynto = {
      imiPyynto: null,
      imiPyyntoNumero: null,
      imiPyyntoLahetetty: null,
      imiPyyntoVastattu: null,
    };

    const body = {
      ...hakemus,
      asiakirja: {
        ...hakemus.asiakirja,
        imiPyynto: imiPyynto,
      },
    };

    if (callCount === 2) {
      body.asiakirja.imiPyynto.imiPyynto = false;
    }
    if (callCount === 3) {
      body.asiakirja.imiPyynto = imiPyynto;
    }
    if (callCount >= 4) {
      body.asiakirja.imiPyynto.imiPyynto = true;
    }
    if (callCount >= 5) {
      body.asiakirja.imiPyynto.imiPyyntoNumero = '123456';
    }
    if (callCount >= 6) {
      body.asiakirja.imiPyynto.imiPyyntoLahetetty = dateFns.format(
        new Date().setDate(26),
        "yyyy-MM-dd'T'HH:mm:ss.SSS",
      );
    }
    if (callCount >= 7) {
      body.asiakirja.imiPyynto.imiPyyntoVastattu = dateFns.format(
        new Date().setDate(26),
        "yyyy-MM-dd'T'HH:mm:ss.SSS",
      );
    }

    if (callCount < 8) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    } else {
      await route.continue();
    }
  });

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/asiakirjat',
  );

  await expect(page.getByTestId('imiPyynto-otsikko')).toBeVisible();

  await expect(page.getByTestId('imiPyynto-radio-group')).toBeVisible();
  const falseRadio = page.locator(
    '[data-testid="imiPyynto-radio-group"] input[type="radio"][value="false"]',
  );
  await falseRadio.click();
  await expect(falseRadio).toBeChecked();

  await page.getByTestId('imiPyynto-radio-group-clear-button').click();
  await expect(falseRadio).not.toBeChecked();
  const trueRadio = page.locator(
    '[data-testid="imiPyynto-radio-group"] input[type="radio"][value="true"]',
  );
  await trueRadio.click();
  await expect(trueRadio).toBeChecked();

  await expect(page.getByTestId('imiPyyntoNumero-input')).toBeVisible();
  await expect(trueRadio).toBeChecked();
  await expect(page.getByTestId('imiPyyntoLahetetty-calendar')).toBeVisible();
  await expect(page.getByTestId('imiPyyntoVastattu-calendar')).toBeVisible();

  const numeroInput = page
    .getByTestId('imiPyyntoNumero-input')
    .locator('input');
  await expect(numeroInput).toBeVisible();
  await numeroInput.fill('123456');

  const lahetettyCalendar = page
    .getByTestId('imiPyyntoLahetetty-calendar')
    .locator('input');
  await expect(lahetettyCalendar).toBeVisible();
  await lahetettyCalendar.click();
  const prevLahetetty = await lahetettyCalendar.inputValue();
  const day26CurrentMonth =
    '.react-datepicker__day--026:not(.react-datepicker__day--outside-month)';
  await page.locator(day26CurrentMonth).click();
  await expect(page.locator('.react-datepicker')).toBeHidden();
  await expect
    .poll(async () => lahetettyCalendar.inputValue())
    .not.toBe(prevLahetetty);
  await expect(lahetettyCalendar).toHaveValue(/^26\.\d{2}\.\d{4}$/);

  const vastattyCalendar = page
    .getByTestId('imiPyyntoVastattu-calendar')
    .locator('input');
  await expect(vastattyCalendar).toBeVisible();
  await vastattyCalendar.click();
  const prevVastattu = await vastattyCalendar.inputValue();
  await page.locator(day26CurrentMonth).click();
  await expect(page.locator('.react-datepicker')).toBeHidden();
  await expect
    .poll(async () => vastattyCalendar.inputValue())
    .not.toBe(prevVastattu);
  await expect(vastattyCalendar).toHaveValue(/^26\.\d{2}\.\d{4}$/);

  await expect(numeroInput).toHaveValue('123456');

  // hyväksytään mikä tahansa päivämäärä, joten tarkistetaan vain formaatti
  await expect(lahetettyCalendar).toHaveValue(/^\d{2}\.\d{2}\.\d{4}$/);
  await expect(vastattyCalendar).toHaveValue(/^\d{2}\.\d{2}\.\d{4}$/);
});

test('IMI-Pyynnön kentät eivät ole näkyvissä Tutkinnon tason rinnastaminen -hakemukselle', async ({
  page,
}) => {
  mockUser(page);
  await mockLiitteet(page);
  const hakemus = getHakemus();

  await page.route('**/tutu-backend/api/hakemus/*', async (route) => {
    const body = {
      ...hakemus,
      hakemusKoskee: 0,
    };

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/asiakirjat',
  );

  await expect(page.getByTestId('imiPyynto-otsikko')).not.toBeVisible();
  await expect(page.getByTestId('imiPyynto-radio-group')).not.toBeVisible();
});
