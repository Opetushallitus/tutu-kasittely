/* eslint playwright/expect-expect: ["error", { "assertFunctionPatterns": ["^verify.*"] }] */

import { test, expect, Route, Page } from '@playwright/test';

import { translate } from './helpers/translate';
import { mockAll } from './mocks';

test.beforeEach(mockAll);

test('Yhteinen käsittely näkyy oikein', async ({ page }) => {
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/yhteinenkasittely',
  );

  const otsikkoTeksti = await translate(
    page,
    'hakemus.yhteinenkasittely.otsikko',
  );

  const otsikko = page.getByTestId('yhteinenkasittely-otsikko');
  await expect(otsikko).toHaveText(otsikkoTeksti);

  const uusiKasittely = await translate(
    page,
    'hakemus.yhteinenkasittely.uusiYhteinenKasittely',
  );

  await expect(page.getByTestId('uusi-yhteinen-kasittely-btn')).toHaveText(
    uusiKasittely,
  );

  await expect(page.getByTestId('kysymys-q1')).toBeVisible();

  await page.getByTestId('kysymys-q1').click();

  const textbox = page.getByTestId('kasittely-details-q1').getByRole('textbox');
  await expect(textbox).toBeVisible();
  await textbox.fill('Testivastaus');

  const lahetaVastaus = await translate(
    page,
    'hakemus.yhteinenkasittely.lahetaVastaus',
  );

  await page.getByRole('button', { name: lahetaVastaus }).click();

  await expect(textbox).toHaveValue('Testivastaus');
});

test('Yhteisen käsittelyn luominen', async ({ page }) => {
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/yhteinenkasittely',
  );

  const uusiKasittely = page.getByTestId('uusi-yhteinen-kasittely-btn');
  await uusiKasittely.click();

  const tyopariSelect = page.getByTestId(
    'yhteinenkasittely-uusiKasittely-tyopari',
  );
  await tyopariSelect.click();
  const tyopariOption = page.locator(
    "xpath=//li[@data-value='1.2.246.562.24.999999999999']",
  );
  await tyopariOption.click();

  const kysymysInput = page
    .getByTestId('yhteinenkasittely-uusiKasittely-kysymys')
    .locator('textarea')
    .first();
  await kysymysInput.fill('Kysymys content');

  const sendButton = page.getByTestId('yhteinenkasittely-uusiKasittely-laheta');
  await sendButton.click();

  // Verify
  const uusiKasittelyRivi = page
    .locator("xpath=//p[text()='Kysymys content']")
    .first();
  await expect(uusiKasittelyRivi).toBeVisible();
});

test.describe('Vastauksen lähettäminen mahdollista vain vastaanottajalle', () => {
  const mockData = (kysymysId: string, from: string, to: string) => {
    const meOid = '1.2.246.562.24.999999999999';
    const otherOid = '1.2.246.562.24.999999999998';
    const someoneOid = '1.2.246.562.24.999999999997';

    const names: { [key: string]: string } = {
      meOid: 'Minä',
      otherOid: 'Sinä',
      someoneOid: 'Hän',
    };

    const firstLahettajaOid =
      kysymysId === 'q-1' && from === 'me'
        ? meOid
        : kysymysId === 'q-1' && from === 'other'
          ? otherOid
          : someoneOid;

    const firstVastaanottajaOid =
      kysymysId === 'q-1' && to === 'me'
        ? meOid
        : kysymysId === 'q-1' && to === 'other'
          ? otherOid
          : someoneOid;

    const followupLahettajaOid =
      kysymysId === 'q-2' && from === 'me'
        ? meOid
        : kysymysId === 'q-2' && from === 'other'
          ? otherOid
          : someoneOid;

    const followupVastaanottajaOid =
      kysymysId === 'q-2' && to === 'me'
        ? meOid
        : kysymysId === 'q-2' && to === 'other'
          ? otherOid
          : someoneOid;

    return async (page: Page) => {
      await page.route(
        '**/tutu-backend/api/hakemus/*/yhteinenkasittely*',
        async (route: Route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              {
                id: 'q-1',
                lahettaja: names[firstLahettajaOid],
                lahettajaOid: firstLahettajaOid,
                vastaanottaja: names[firstVastaanottajaOid],
                vastaanottajaOid: firstVastaanottajaOid,
                kysymys: 'Ensimmäinen kysymys',
                luotu: '2026-02-01T08:05:00.000Z',
                jatkoKasittelyt: [
                  {
                    id: 'q-2',
                    lahettaja: names[followupLahettajaOid],
                    lahettajaOid: followupLahettajaOid,
                    vastaanottaja: names[followupVastaanottajaOid],
                    vastaanottajaOid: followupVastaanottajaOid,
                    kysymys: 'Jatkokysymys',
                    luotu: '2026-02-01T08:05:00.000Z',
                    jatkoKasittelyt: [],
                  },
                ],
              },
            ]),
          });
        },
      );
    };
  };

  const navigateToPage = async (page: Page) => {
    await page.goto(
      '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/yhteinenkasittely',
    );
    await expect(page.getByText('Uusi yhteinen käsittely')).toBeVisible();
  };

  const verifyQuestionVisible = async (page: Page) => {
    // Avaa kysymys
    await expect(page.getByTestId('kysymys-q-1')).toBeVisible();
    await page.getByTestId('kysymys-q-1').click();

    // Lue kysymykset
    await expect(
      page.getByTestId(`kysymys-details-q-1`).getByText('Ensimmäinen kysymys'),
    ).toBeVisible();
    await expect(page.getByText('Jatkokysymys')).toBeVisible();
  };

  const verifyAnswerEditable = (
    kysymysId: string,
    _from: string,
    to: string,
  ) => {
    if (to === 'me') {
      return async (page: Page) => {
        const locator = page.getByTestId(
          `kysymys-details-${kysymysId}__vastaus-field`,
        );

        await locator.scrollIntoViewIfNeeded();
        await expect(locator).toBeVisible();
      };
    } else {
      return async (page: Page) => {
        const locator = page.getByTestId(
          `kysymys-details-${kysymysId}__vastaus-field`,
        );
        await expect(locator).toBeHidden();
      };
    }
  };

  const verifySendButtonVisible = (
    kysymysId: string,
    _from: string,
    to: string,
  ) => {
    if (to === 'me') {
      return async (page: Page) => {
        const locator = page.getByTestId(
          `kysymys-details-${kysymysId}__vastaus-send`,
        );

        await locator.scrollIntoViewIfNeeded();
        await expect(locator).toBeVisible();
      };
    } else {
      return async (page: Page) => {
        const locator = page.getByTestId(
          `kysymys-details-${kysymysId}__vastaus-send`,
        );
        await expect(locator).toBeHidden();
      };
    }
  };

  // [testikuvaus, kysymyksen id, from, to]
  const cases = [
    ['Ensimmäinen kysymys minulta toiselle', 'q-1', 'me', 'other'],
    ['Ensimmäinen kysymys toiselta minulle', 'q-1', 'other', 'me'],
    ['Ensimmäinen kysymys toiselta toiselle', 'q-1', 'other', 'other'],
    ['Toinen kysymys minulta toiselle', 'q-2', 'me', 'other'],
    ['Toinen kysymys toiselta minulle', 'q-2', 'other', 'me'],
    ['Toinen kysymys toiselta toiselle', 'q-2', 'other', 'other'],
  ];

  cases.forEach(([kuvaus, kysymysId, from, to]) => {
    const doMock = mockData(kysymysId, from, to);
    const doVerifyAnswerEditable = verifyAnswerEditable(kysymysId, from, to);
    const doVerifySendButtonVisible = verifySendButtonVisible(
      kysymysId,
      from,
      to,
    );

    test(`${kuvaus}`, async ({ page }) => {
      await doMock(page);
      await navigateToPage(page);
      await verifyQuestionVisible(page);
      await doVerifyAnswerEditable(page);
      await doVerifySendButtonVisible(page);
    });
  });
});
