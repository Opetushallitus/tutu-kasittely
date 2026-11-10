/* eslint playwright/expect-expect: ["error", { "assertFunctionPatterns": ["^verify.*"] }] */

import { test, expect, Route, Page } from '@playwright/test';

import { mockAll } from './mocks';

import { YkViestiTyyppi } from '@/src/lib/types/yhteinenkasittely';

test.beforeEach(mockAll);

test('Yhteinen käsittely näkyy oikein', async ({ page }) => {
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/yhteinenkasittely',
  );

  const otsikkoTeksti = 'hakemus.yhteinenkasittely.otsikko';

  const otsikko = page.getByTestId('yhteinenkasittely-otsikko');
  await expect(otsikko).toHaveText(otsikkoTeksti);

  const uusiKasittely = 'hakemus.yhteinenkasittely.uusiYhteinenKasittely';

  await expect(page.getByTestId('uusi-yhteinen-kasittely-btn')).toHaveText(
    uusiKasittely,
  );

  await expect(page.getByTestId('kysymys-q1')).toBeVisible();

  const readRequest = page.waitForResponse(
    (response) =>
      response.request().method() === 'PATCH' &&
      response.url().includes('/yhteinenkasittely/q1/luettu'),
  );
  const refetch = page.waitForResponse(
    (response) =>
      response.request().method() === 'GET' &&
      response.url().includes('/yhteinenkasittely'),
  );

  await page.getByTestId('kysymys-q1').click();
  await Promise.all([readRequest, refetch]);

  const textbox = page.getByTestId('kasittely-details-q1').getByRole('textbox');
  await expect(textbox).toBeVisible();
  await textbox.fill('Testivastaus');

  const lahetaVastaus = 'hakemus.yhteinenkasittely.lahetaVastaus';

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

  // Varmistetaan että esittäjät on sukunimen mukaan järjestettynä
  const options = page.locator(
    'ul[role="listbox"]:visible li[role="option"]:visible',
  );
  await expect(options).toHaveCount(2);
  await expect(options.first()).toHaveText('Janne Jamaika');
  await expect(options.nth(1)).toHaveText('Kari Karibia');

  const tyopariOption = page.locator(
    "xpath=//li[@data-value='1.2.246.562.24.999999999999']",
  );
  await tyopariOption.click();

  const aiheSelect = page.getByTestId('yhteinenkasittely-uusiKasittely-aihe');
  await aiheSelect.click();

  await page
    .getByRole('option', { name: 'hakemus.yhteinenkasittely.aihe.kelpoisuus' })
    .click();

  const kysymysInput = page
    .getByTestId('yhteinenkasittely-uusiKasittely-kysymys')
    .locator('textarea')
    .first();
  await kysymysInput.fill('Kysymys content');

  const sendButton = page.getByTestId('yhteinenkasittely-uusiKasittely-laheta');
  await sendButton.click();

  // Verify
  const uusiKasittelyRivi = page
    .locator("xpath=//p[text()='hakemus.yhteinenkasittely.aihe.kelpoisuus']")
    .first();
  await expect(uusiKasittelyRivi).toBeVisible();
});

test.describe('Vastauksen lähettäminen mahdollista vain vastaanottajalle', () => {
  const participants = {
    me: { oid: '1.2.246.562.24.999999999999', name: 'Minä' },
    other: { oid: '1.2.246.562.24.999999999998', name: 'Sinä' },
    someone: { oid: '1.2.246.562.24.999999999997', name: 'Hän' },
  };

  type Participant = keyof typeof participants;
  type MessageParties = { from: Participant; to: Participant };

  const mockData = (initial: MessageParties, followUp?: MessageParties) => {
    const makeMessage = (
      id: string,
      parties: MessageParties,
      viesti: string,
      tyyppi: YkViestiTyyppi,
    ) => ({
      id,
      lahettaja: participants[parties.from].name,
      lahettajaOid: participants[parties.from].oid,
      vastaanottaja: participants[parties.to].name,
      vastaanottajaOid: participants[parties.to].oid,
      viesti,
      luotu: '2026-02-01T08:05:00.000Z',
      aihe: 'kelpoisuus',
      tyyppi,
    });

    return async (page: Page) => {
      await page.route(
        '**/tutu-backend/api/hakemus/*/yhteinenkasittely*',
        async (route: Route) => {
          if (route.request().method() !== 'GET') {
            await route.fallback();
            return;
          }

          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              {
                aloitusViesti: makeMessage(
                  'q-1',
                  initial,
                  'Ensimmäinen kysymys',
                  YkViestiTyyppi.kysymys,
                ),
                jatkoKasittelyt: followUp
                  ? [
                      makeMessage(
                        'q-2',
                        followUp,
                        'Jatkokysymys',
                        YkViestiTyyppi.jatkokysymys,
                      ),
                    ]
                  : [],
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
    await expect(
      page.getByText('hakemus.yhteinenkasittely.uusiYhteinenKasittely'),
    ).toBeVisible();
  };

  const verifyQuestionVisible = async (page: Page, hasFollowUp: boolean) => {
    await expect(page.getByTestId('kysymys-q-1')).toBeVisible();
    await page.getByTestId('kysymys-q-1').click();

    const details = page.getByTestId('kasittely-details-q-1');
    await expect(
      details.getByText('Ensimmäinen kysymys').first(),
    ).toBeVisible();

    if (hasFollowUp) {
      await expect(details.getByText('Jatkokysymys')).toBeVisible();
    } else {
      await expect(details.getByText('Jatkokysymys')).toHaveCount(0);
    }
  };

  const verifyAnswerAvailability = async (page: Page, canAnswer: boolean) => {
    const field = page.getByTestId('kysymys-details-q-1__vastaus-field');
    const sendButton = page.getByTestId('kysymys-details-q-1__vastaus-send');

    if (canAnswer) {
      await field.scrollIntoViewIfNeeded();
      await expect(field).toBeVisible();
      await expect(sendButton).toBeVisible();
    } else {
      await expect(field).toBeHidden();
      await expect(sendButton).toBeHidden();
    }
  };

  const cases: {
    description: string;
    initial: MessageParties;
    followUp?: MessageParties;
  }[] = [
    {
      description: 'Aloituskysymys minulta toiselle',
      initial: { from: 'me', to: 'other' },
    },
    {
      description: 'Aloituskysymys toiselta minulle',
      initial: { from: 'other', to: 'me' },
    },
    {
      description: 'Aloituskysymys toiselta kolmannelle',
      initial: { from: 'other', to: 'someone' },
    },
    {
      description: 'Jatkokysymys minulta toiselle',
      initial: { from: 'someone', to: 'other' },
      followUp: { from: 'me', to: 'other' },
    },
    {
      description: 'Jatkokysymys toiselta minulle',
      initial: { from: 'someone', to: 'other' },
      followUp: { from: 'other', to: 'me' },
    },
    {
      description: 'Jatkokysymys toiselta kolmannelle',
      initial: { from: 'someone', to: 'other' },
      followUp: { from: 'other', to: 'someone' },
    },
  ];

  cases.forEach(({ description, initial, followUp }) => {
    test(description, async ({ page }) => {
      await mockData(initial, followUp)(page);
      await navigateToPage(page);
      await verifyQuestionVisible(page, !!followUp);
      await verifyAnswerAvailability(
        page,
        (followUp?.to ?? initial.to) === 'me',
      );
    });
  });
});
