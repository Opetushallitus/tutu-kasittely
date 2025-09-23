import { expect, Page, Route, test } from '@playwright/test';
import {
  mockBasicForHakemus,
  mockLiitteet,
  mockUser,
} from '@/playwright/mocks';
import { getHakemus } from '@/playwright/fixtures/hakemus1';
import * as dateFns from 'date-fns';
import { ValmistumisenVahvistus } from '@/src/lib/types/hakemus';

test.beforeEach(mockBasicForHakemus);

export const mockHakemus = (page: Page) => {
  return page.route('**/tutu-backend/api/hakemus/*', async (route: Route) => {
    const hakemus = getHakemus();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(hakemus),
    });
  });
};

test('Todistusten aitoustarkistuksen lupa-vastaus näkyy sivulla', async ({
  page,
}) => {
  await mockUser(page);
  await mockHakemus(page);
  await mockLiitteet(page);

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/asiakirjat',
  );
  await expect(
    page.getByTestId('todistus-tarkistus-lupa-label'),
  ).not.toBeEmpty();
  await expect(page.getByTestId('todistus-tarkistus-lupa-value')).toHaveText(
    /kyllä/i,
  );
});

test('Suostumus asiakirjojen vahvistamiselle -valinta näkyy sivulla', async ({
  page,
}) => {
  await mockUser(page);
  await mockHakemus(page);
  await mockLiitteet(page);

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/asiakirjat',
  );
  await expect(
    page.getByTestId('suostumus-vahvistamiselle-saatu-checkbox'),
  ).toBeVisible();
});

const defaultValmistumisenVahvistus: ValmistumisenVahvistus = {
  valmistumisenVahvistus: false,
  valmistumisenVahvistusPyyntoLahetetty: null,
  valmistumisenVahvistusSaatu: null,
  valmistumisenVahvistusVastaus: null,
  valmistumisenVahvistusLisatieto: null,
};

test('Valmistumisen vahvistus -komponentit toimivat oikein', async ({
  page,
}) => {
  let callCount = 0;

  await mockUser(page);
  await mockLiitteet(page);

  const hakemus = getHakemus();

  await page.route('**/tutu-backend/api/hakemus/*', async (route) => {
    callCount++;
    const body = {
      ...hakemus,
      asiakirja: {
        ...hakemus.asiakirja,
        valmistumisenVahvistus: defaultValmistumisenVahvistus,
      },
    };
    if (callCount == 1) {
      body.asiakirja.valmistumisenVahvistus.valmistumisenVahvistus = false;
    }
    if (callCount >= 2) {
      body.asiakirja.valmistumisenVahvistus.valmistumisenVahvistus = true;
    }
    if (callCount >= 3) {
      body.asiakirja.valmistumisenVahvistus.valmistumisenVahvistusPyyntoLahetetty =
        dateFns.format(new Date().setDate(26), "yyyy-MM-dd'T'HH:mm:ss.SSS");
    }

    if (callCount >= 4) {
      body.asiakirja.valmistumisenVahvistus.valmistumisenVahvistusSaatu =
        dateFns.format(new Date().setDate(26), "yyyy-MM-dd'T'HH:mm:ss.SSS");
    }

    if (callCount >= 5) {
      body.asiakirja.valmistumisenVahvistus.valmistumisenVahvistusVastaus =
        'Myonteinen';
    }

    if (callCount >= 6) {
      body.asiakirja.valmistumisenVahvistus.valmistumisenVahvistusLisatieto =
        'Hyvinhän se meni';
    }
    if (callCount < 7)
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    else await route.continue();
  });

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/asiakirjat',
  );

  const checkbox = page.getByTestId('valmistumisen-vahvistus-checkbox');
  const lahetetty = page.getByTestId('vahvistusPyyntoLahetetty-calendar');
  const vastattu = page.getByTestId('vahvistusPyyntoVastattu-calendar');
  const radio = page.getByTestId('valmistumisenVahvistus-radio-group');
  const lisatieto = page.getByTestId('valmistumisenVahvistus-lisatieto-input');
  await expect(checkbox).toBeVisible();
  await expect(lahetetty).not.toBeVisible();
  await expect(vastattu).not.toBeVisible();
  await expect(radio).not.toBeVisible();
  await expect(lisatieto).not.toBeVisible();

  checkbox.check();
  await expect(lahetetty).toBeVisible();
  await expect(vastattu).toBeVisible();
  await expect(radio).toBeVisible();
  await expect(lisatieto).not.toBeVisible();

  const lahetettyInput = lahetetty.locator('input');
  await lahetetty.click();
  await page.locator('.react-datepicker__day--026').click();
  await expect(lahetettyInput).toHaveValue(
    dateFns.format(new Date().setDate(26), 'dd.MM.yyyy'),
  );

  const vastattuInput = vastattu.locator('input');
  await vastattu.click();
  await page.locator('.react-datepicker__day--026').click();
  await expect(vastattuInput).toHaveValue(
    dateFns.format(new Date().setDate(26), 'dd.MM.yyyy'),
  );

  const myonteinenRadio = page.locator(
    '[data-testid="valmistumisenVahvistus-radio-group"] input[type="radio"][value="Myonteinen"]',
  );
  await myonteinenRadio.check();
  await expect(lisatieto).toBeVisible();

  const lisatietoInput = lisatieto.locator('input');
  await lisatietoInput.fill('Hyvin meni');

  await expect(lahetettyInput).toHaveValue(
    dateFns.format(new Date().setDate(26), 'dd.MM.yyyy'),
  );
  await expect(vastattuInput).toHaveValue(
    dateFns.format(new Date().setDate(26), 'dd.MM.yyyy'),
  );
  await expect(myonteinenRadio).toBeChecked();
  await expect(lisatietoInput).toHaveValue('Hyvinhän se meni');
});
