/* eslint-disable  @typescript-eslint/no-explicit-any */

import { expect, Page, test } from '@playwright/test';
import {
  mockUser,
  mockBasicForHakemus,
  mockHakemus,
  mockPerustelu,
} from '@/playwright/mocks';

const expectRequestData = async (
  page: Page,
  action: Promise<void>,
  data: any,
) => {
  const [request] = await Promise.all([
    page.waitForRequest(
      (req) => req.url().includes(`/perustelu/`) && req.method() === 'POST',
    ),
    action,
  ]);

  return expect(request.postDataJSON()).toMatchObject(data);
};

test.beforeEach(async ({ page }) => {
  await mockBasicForHakemus({ page });
  mockUser(page);
  await mockHakemus(page);
  await mockPerustelu(page);
});

test.describe('Yleiset perustelut', () => {
  test('Lomake näkyy kokonaisuudessaan', async ({ page }) => {
    await page.goto(
      '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustelu/yleiset/perustelut',
    );

    // Tuodaan piilotetut lomakkeen osat esiin
    const muuRadio = page.locator(
      '[data-testid="jatko-opintokelpoisuus-radio-group"] input[type="radio"][value="muu"]',
    );
    await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes('/perustelu/1.2.246.562.10.00000000001') &&
          r.request().method() === 'POST',
      ),
      muuRadio.click(),
    ]);

    const checks = [
      page.getByTestId('lahde__lahtomaan-kansallinen-lahde'),
      page.getByTestId('lahde__lahtomaan-virallinen-vastaus'),
      page.getByTestId('lahde__kansainvalinen-hakuteos-tai-verkkosivusto'),
      page.locator(
        '[data-testid="virallinen-tutkinnon-myontaja-radio-group"] input[type="radio"][value="true"]',
      ),
      page.locator(
        '[data-testid="virallinen-tutkinnon-myontaja-radio-group"] input[type="radio"][value="false"]',
      ),
      page.locator(
        '[data-testid="virallinen-tutkinto-radio-group"] input[type="radio"][value="true"]',
      ),
      page.locator(
        '[data-testid="virallinen-tutkinto-radio-group"] input[type="radio"][value="false"]',
      ),
      page.locator(
        '[data-testid="tutkinnon-asema-radio-group"] input[type="radio"][value="alempi_korkeakouluaste"]',
      ),
      page.locator(
        '[data-testid="tutkinnon-asema-radio-group"] input[type="radio"][value="ylempi_korkeakouluaste"]',
      ),
      page.locator(
        '[data-testid="tutkinnon-asema-radio-group"] input[type="radio"][value="alempi_ja_ylempi_korkeakouluaste"]',
      ),
      page.locator(
        '[data-testid="tutkinnon-asema-radio-group"] input[type="radio"][value="tutkijakoulutusaste"]',
      ),
      page.locator(
        '[data-testid="tutkinnon-asema-radio-group"] input[type="radio"][value="ei_korkeakouluaste"]',
      ),
      page.locator(
        '[data-testid="jatko-opintokelpoisuus-radio-group"] input[type="radio"][value="toisen_vaiheen_korkeakouluopintoihin"]',
      ),
      page.locator(
        '[data-testid="jatko-opintokelpoisuus-radio-group"] input[type="radio"][value="tieteellisiin_jatko-opintoihin"]',
      ),
      page.locator(
        '[data-testid="jatko-opintokelpoisuus-radio-group"] input[type="radio"][value="muu"]',
      ),
      page.getByTestId('jatko-opintokelpoisuus--lisatiedot'),
      page.getByTestId('yleiset-perustelut__tutkinto-1--ohjeellinen-laajuus'),
      page.getByTestId('yleiset-perustelut__tutkinto-1--suoritusvuodet-alku'),
      page.getByTestId('yleiset-perustelut__tutkinto-1--suoritusvuodet-loppu'),
      page.locator(
        '//*[@data-testid="yleiset-perustelut__tutkinto-1--opinnaytetyo"]//input[@value="true"]',
      ),
      page.locator(
        '//*[@data-testid="yleiset-perustelut__tutkinto-1--opinnaytetyo"]//input[@value="false"]',
      ),
      page.locator(
        '//*[@data-testid="yleiset-perustelut__tutkinto-1--harjoittelu"]//input[@value="true"]',
      ),
      page.locator(
        '//*[@data-testid="yleiset-perustelut__tutkinto-1--harjoittelu"]//input[@value="false"]',
      ),
      page.getByTestId('yleiset-perustelut__tutkinto-1--lisatietoja'),
      page.getByTestId('yleiset-perustelut__tutkinto-2--ohjeellinen-laajuus'),
      page.getByTestId('yleiset-perustelut__tutkinto-2--suoritusvuodet-alku'),
      page.getByTestId('yleiset-perustelut__tutkinto-2--suoritusvuodet-loppu'),
      page.locator(
        '//*[@data-testid="yleiset-perustelut__tutkinto-2--opinnaytetyo"]//input[@value="true"]',
      ),
      page.locator(
        '//*[@data-testid="yleiset-perustelut__tutkinto-2--opinnaytetyo"]//input[@value="false"]',
      ),
      page.locator(
        '//*[@data-testid="yleiset-perustelut__tutkinto-2--harjoittelu"]//input[@value="true"]',
      ),
      page.locator(
        '//*[@data-testid="yleiset-perustelut__tutkinto-2--harjoittelu"]//input[@value="false"]',
      ),
      page.getByTestId('yleiset-perustelut__tutkinto-2--lisatietoja'),
    ].map((locator) => {
      return expect(locator).toBeAttached();
    });

    await Promise.all(checks);
  });

  test('Valinnan poistotoiminto näytetään kun valinta on tehty', async ({
    page,
  }) => {
    await page.goto(
      '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustelu/yleiset/perustelut',
    );

    const myontajaOn = page.locator(
      '[data-testid="virallinen-tutkinnon-myontaja-radio-group"] input[type="radio"][value="true"]',
    );
    await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes('/perustelu/1.2.246.562.10.00000000001') &&
          r.request().method() === 'POST',
      ),
      myontajaOn.click(),
    ]);

    const tutkintoOff = page.locator(
      '[data-testid="virallinen-tutkinto-radio-group"] input[type="radio"][value="false"]',
    );
    await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes('/perustelu/1.2.246.562.10.00000000001') &&
          r.request().method() === 'POST',
      ),
      tutkintoOff.click(),
    ]);

    await expect(
      page.getByTestId(
        'virallinen-tutkinnon-myontaja-radio-group-clear-button',
      ),
    ).toBeAttached();

    await expect(
      page.getByTestId('virallinen-tutkinto-radio-group-clear-button'),
    ).toBeAttached();
  });

  test('Syötetyt tiedot välitetään updatePerustelu-funktiolle', async ({
    page,
  }) => {
    test.setTimeout(60000);

    // Stateful mock data for this test
    let testPerusteluData: Record<string, unknown> = {};

    // Unwrap nested wrapper structures like backend does
    const unwrapData = (
      data: Record<string, unknown>,
    ): Record<string, unknown> => {
      const unwrapped: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        if (
          value &&
          typeof value === 'object' &&
          !Array.isArray(value) &&
          key in (value as Record<string, unknown>)
        ) {
          unwrapped[key] = (value as Record<string, unknown>)[key];
        } else {
          unwrapped[key] = value;
        }
      }
      return unwrapped;
    };

    await page.route('**/tutu-backend/api/perustelu/*', async (route) => {
      if (route.request().method() === 'POST') {
        const postedData = route.request().postDataJSON() as Record<
          string,
          unknown
        >;
        const unwrappedData = unwrapData(postedData);
        testPerusteluData = { ...testPerusteluData, ...unwrappedData };

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(testPerusteluData),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(testPerusteluData),
        });
      }
    });

    await page.goto(
      '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustelu/yleiset/perustelut',
    );

    await expectRequestData(
      page,
      page
        .locator(
          '[data-testid="virallinen-tutkinnon-myontaja-radio-group"] input[type="radio"][value="false"]',
        )
        .click(),
      { virallinenTutkinnonMyontaja: { virallinenTutkinnonMyontaja: false } },
    );

    await expectRequestData(
      page,
      page
        .locator(
          '[data-testid="virallinen-tutkinnon-myontaja-radio-group"] input[type="radio"][value="true"]',
        )
        .click(),
      { virallinenTutkinnonMyontaja: { virallinenTutkinnonMyontaja: true } },
    );

    await expectRequestData(
      page,
      page
        .getByTestId('virallinen-tutkinnon-myontaja-radio-group-clear-button')
        .click(),
      {
        virallinenTutkinnonMyontaja: {
          virallinenTutkinnonMyontaja: null,
        },
      },
    );

    await expectRequestData(
      page,
      page
        .locator(
          '[data-testid="virallinen-tutkinto-radio-group"] input[type="radio"][value="false"]',
        )
        .click(),
      { virallinenTutkinto: { virallinenTutkinto: false } },
    );

    await expectRequestData(
      page,
      page
        .locator(
          '[data-testid="virallinen-tutkinto-radio-group"] input[type="radio"][value="true"]',
        )
        .click(),
      { virallinenTutkinto: { virallinenTutkinto: true } },
    );

    await expectRequestData(
      page,
      page.getByTestId('virallinen-tutkinto-radio-group-clear-button').click(),
      { virallinenTutkinto: { virallinenTutkinto: null } },
    );

    await expectRequestData(
      page,
      page.getByTestId('lahde__lahtomaan-kansallinen-lahde').click(),
      { lahdeLahtomaanKansallinenLahde: true },
    );

    await expectRequestData(
      page,
      page.getByTestId('lahde__lahtomaan-kansallinen-lahde').click(),
      { lahdeLahtomaanKansallinenLahde: false },
    );

    await expectRequestData(
      page,
      page.getByTestId('lahde__lahtomaan-virallinen-vastaus').click(),
      { lahdeLahtomaanVirallinenVastaus: true },
    );

    await expectRequestData(
      page,
      page.getByTestId('lahde__lahtomaan-virallinen-vastaus').click(),
      { lahdeLahtomaanVirallinenVastaus: false },
    );

    await expectRequestData(
      page,
      page
        .getByTestId('lahde__kansainvalinen-hakuteos-tai-verkkosivusto')
        .click(),
      { lahdeKansainvalinenHakuteosTaiVerkkosivusto: true },
    );

    await expectRequestData(
      page,
      page
        .getByTestId('lahde__kansainvalinen-hakuteos-tai-verkkosivusto')
        .click(),
      { lahdeKansainvalinenHakuteosTaiVerkkosivusto: false },
    );

    await [
      'alempi_korkeakouluaste',
      'ylempi_korkeakouluaste',
      'alempi_ja_ylempi_korkeakouluaste',
      'tutkijakoulutusaste',
      'ei_korkeakouluaste',
    ].reduce(async (acc, tutkintoaste) => {
      await acc;
      return expectRequestData(
        page,
        page
          .locator(
            `[data-testid="tutkinnon-asema-radio-group"] input[type="radio"][value="${tutkintoaste}"]`,
          )
          .click(),
        {
          ylimmanTutkinnonAsemaLahtomaanJarjestelmassa: {
            ylimmanTutkinnonAsemaLahtomaanJarjestelmassa: tutkintoaste,
          },
        },
      );
    }, Promise.resolve());

    await [
      'toisen_vaiheen_korkeakouluopintoihin',
      'tieteellisiin_jatko-opintoihin',
      'muu',
    ].reduce(async (acc, kelpoisuus) => {
      await acc;
      return expectRequestData(
        page,
        page
          .locator(
            `[data-testid="jatko-opintokelpoisuus-radio-group"] input[type="radio"][value="${kelpoisuus}"]`,
          )
          .click(),
        { jatkoOpintoKelpoisuus: { jatkoOpintoKelpoisuus: kelpoisuus } },
      );
    }, Promise.resolve());

    await expectRequestData(
      page,
      page
        .getByTestId('jatko-opintokelpoisuus--lisatiedot')
        .getByRole('textbox')
        .fill('Kelpoisuus jatkaa kandidaatinopintoihin'),
      {
        jatkoOpintoKelpoisuusLisatieto:
          'Kelpoisuus jatkaa kandidaatinopintoihin',
      },
    );

    await expectRequestData(
      page,
      page
        .locator(
          '[data-testid="aiemmat-paatokset-radio-group"] input[type="radio"][value="true"]',
        )
        .click(),
      { aikaisemmatPaatokset: { aikaisemmatPaatokset: true } },
    );

    await expectRequestData(
      page,
      page
        .locator(
          '[data-testid="aiemmat-paatokset-radio-group"] input[type="radio"][value="false"]',
        )
        .click(),
      { aikaisemmatPaatokset: { aikaisemmatPaatokset: false } },
    );
  });

  test('Syötetyt tutkintotiedot päivitetään hakemuksen kautta', async ({
    page,
  }) => {
    await page.goto(
      '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustelu/yleiset/perustelut',
    );
    page.on('console', (msg) => console.log(msg.text()));
    const tutkintoJarjestykset = ['1', '2'];

    const resultPromise = tutkintoJarjestykset.reduce(
      // @ts-expect-error TS does not understand Array.prototype.reduce
      async (acc, jarjestys) => {
        await acc;

        const requestPromise = page.waitForRequest(
          (req) => req.url().includes(`/hakemus/`) && req.method() === 'PATCH',
        );

        await page
          .getByTestId(
            `yleiset-perustelut__tutkinto-${jarjestys}--ohjeellinen-laajuus`,
          )
          .getByRole('textbox')
          .fill('120 op');

        await page
          .getByTestId(
            `yleiset-perustelut__tutkinto-${jarjestys}--suoritusvuodet-alku`,
          )
          .getByRole('textbox')
          .fill('2020');

        await page
          .getByTestId(
            `yleiset-perustelut__tutkinto-${jarjestys}--suoritusvuodet-loppu`,
          )
          .getByRole('textbox')
          .fill('2023');

        await page
          .locator(
            `//*[@data-testid="yleiset-perustelut__tutkinto-${jarjestys}--opinnaytetyo"]//input[@value="true"]`,
          )
          .click();

        await page
          .locator(
            `//*[@data-testid="yleiset-perustelut__tutkinto-${jarjestys}--harjoittelu"]//input[@value="false"]`,
          )
          .click();

        await page
          .getByTestId(`yleiset-perustelut__tutkinto-${jarjestys}--lisatietoja`)
          .getByRole('textbox')
          .fill('Vastaa kandidaatintutkinnon perus- ja aineopintoja');

        return requestPromise;
      },
      Promise.resolve(),
    );

    const results = await resultPromise;

    // @ts-expect-error TS does not understand results of Array.prototype.reduce
    expect(results?.postDataJSON()).toMatchObject({
      tutkinnot: [
        {
          id: '18732268-07ca-4898-a21f-e49b9dd68275',
          hakemusId: '3f140ba6-4018-402c-af32-5e5b802144fc',
          jarjestys: '1',
          nimi: 'Päälikkö',
          oppilaitos: 'Butan Amattikoulu',
          aloitusVuosi: 2020,
          paattymisVuosi: 2023,
          maakoodiUri: 'maatjavaltiot2_762',
          muuTutkintoTieto: null,
          todistuksenPaivamaara: null,
          koulutusalaKoodi: null,
          paaaaineTaiErikoisala: null,
          todistusOtsikko: 'tutkintotodistus',
          muuTutkintoMuistioId: null,
          ohjeellinenLaajuus: '120 op',
          opinnaytetyo: true,
          harjoittelu: false,
          perustelunLisatietoja:
            'Vastaa kandidaatintutkinnon perus- ja aineopintoja',
        },
        {
          id: '589038c5-00eb-465b-98bf-3b9ce62bb94d',
          hakemusId: '3f140ba6-4018-402c-af32-5e5b802144fc',
          jarjestys: '2',
          nimi: 'Apu poika',
          oppilaitos: 'Apu koulu',
          aloitusVuosi: 2020,
          paattymisVuosi: 2023,
          maakoodiUri: 'maatjavaltiot2_762',
          muuTutkintoTieto: null,
          todistuksenPaivamaara: null,
          koulutusalaKoodi: null,
          paaaaineTaiErikoisala: null,
          todistusOtsikko: 'muutodistus',
          muuTutkintoMuistioId: null,
          ohjeellinenLaajuus: '120 op',
          opinnaytetyo: true,
          harjoittelu: false,
          perustelunLisatietoja:
            'Vastaa kandidaatintutkinnon perus- ja aineopintoja',
        },
        {
          id: '07f503b7-7cf4-4437-b4c6-97512bd44450',
          hakemusId: '3f140ba6-4018-402c-af32-5e5b802144fc',
          jarjestys: 'MUU',
          nimi: null,
          oppilaitos: null,
          aloitusVuosi: null,
          paattymisVuosi: null,
          maakoodiUri: null,
          muuTutkintoTieto: 'En olekaan suorittanutkoulutusta',
          todistuksenPaivamaara: null,
          koulutusalaKoodi: null,
          paaaaineTaiErikoisala: null,
          todistusOtsikko: null,
          muuTutkintoMuistioId: null,
        },
      ],
    });
  });
});
