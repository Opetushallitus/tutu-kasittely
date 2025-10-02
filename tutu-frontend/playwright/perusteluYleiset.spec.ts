/* eslint-disable  @typescript-eslint/no-explicit-any */

import { expect, Page, test } from '@playwright/test';
import { mockUser, mockBasicForHakemus, mockHakemus } from '@/playwright/mocks';

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
});

test.describe('Yleiset perustelut', () => {
  test('Lomake näkyy kokonaisuudessaan', async ({ page }) => {
    await page.goto(
      '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustelu/yleiset/perustelut',
    );

    // Tuodaan piilotetut lomakkeen osat esiin
    await page.getByTestId('jatko-opintokelpoisuus--muu').click();

    const checks = [
      page.getByTestId('lahde__lahtomaan-kansallinen-lahde'),
      page.getByTestId('lahde__lahtomaan-virallinen-vastaus'),
      page.getByTestId('lahde__kansainvalinen-hakuteos-tai-verkkosivusto'),
      page.getByTestId('virallinen-tutkinnon-myontaja__on'),
      page.getByTestId('virallinen-tutkinnon-myontaja__off'),
      page.getByTestId('virallinen-tutkinto__on'),
      page.getByTestId('virallinen-tutkinto__off'),
      page.getByTestId('tutkinnon-asema--alempi_korkeakouluaste'),
      page.getByTestId('tutkinnon-asema--ylempi_korkeakouluaste'),
      page.getByTestId('tutkinnon-asema--alempi_ja_ylempi_korkeakouluaste'),
      page.getByTestId('tutkinnon-asema--tutkijakoulutusaste'),
      page.getByTestId('tutkinnon-asema--ei_korkeakouluaste'),
      page.getByTestId(
        'jatko-opintokelpoisuus--toisen_vaiheen_korkeakouluopintoihin',
      ),
      page.getByTestId(
        'jatko-opintokelpoisuus--tieteellisiin_jatko-opintoihin',
      ),
      page.getByTestId('jatko-opintokelpoisuus--muu'),
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

    await page.getByTestId('virallinen-tutkinnon-myontaja__on').click();
    await page.getByTestId('virallinen-tutkinto__off').click();

    await expect(
      page.getByTestId('virallinen-tutkinnon-myontaja__none'),
    ).toBeAttached();

    await expect(page.getByTestId('virallinen-tutkinto__none')).toBeAttached();
  });

  test('Syötetyt tiedot välitetään updatePerustelu-funktiolle', async ({
    page,
  }) => {
    test.setTimeout(60000);

    await page.route('**/tutu-backend/api/perustelu/*', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(route.request().postDataJSON()),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({}),
        });
      }
    });

    await page.goto(
      '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustelu/yleiset/perustelut',
    );

    await expectRequestData(
      page,
      page.getByTestId('virallinen-tutkinnon-myontaja__off').click(),
      { virallinenTutkinnonMyontaja: false },
    );

    await expectRequestData(
      page,
      page.getByTestId('virallinen-tutkinnon-myontaja__on').click(),
      { virallinenTutkinnonMyontaja: true },
    );

    await expectRequestData(
      page,
      page.getByTestId('virallinen-tutkinnon-myontaja__none').click(),
      { virallinenTutkinnonMyontaja: null },
    );

    await expectRequestData(
      page,
      page.getByTestId('virallinen-tutkinto__off').click(),
      { virallinenTutkinto: false },
    );

    await expectRequestData(
      page,
      page.getByTestId('virallinen-tutkinto__on').click(),
      { virallinenTutkinto: true },
    );

    await expectRequestData(
      page,
      page.getByTestId('virallinen-tutkinto__none').click(),
      { virallinenTutkinto: null },
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
        page.getByTestId(`tutkinnon-asema--${tutkintoaste}`).click(),
        { ylimmanTutkinnonAsemaLahtomaanJarjestelmassa: tutkintoaste },
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
        page.getByTestId(`jatko-opintokelpoisuus--${kelpoisuus}`).click(),
        { jatkoOpintoKelpoisuus: kelpoisuus },
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
      page.getByTestId('aiemmat-paatokset--kylla').click(),
      { aikaisemmatPaatokset: true },
    );

    await expectRequestData(
      page,
      page.getByTestId('aiemmat-paatokset--ei').click(),
      { aikaisemmatPaatokset: false },
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
          id: '$18732268-07ca-4898-a21f-e49b9dd68275',
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
