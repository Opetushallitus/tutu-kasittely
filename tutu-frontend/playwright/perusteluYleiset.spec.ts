import { expect, Page, test } from '@playwright/test';

import {
  clickSaveAndWaitForPUT,
  waitForSaveComplete,
} from '@/playwright/helpers/saveHelpers';
import {
  mockUser,
  mockBasicForHakemus,
  mockHakemus,
  mockPerustelu,
  mockTutkinnot,
} from '@/playwright/mocks';
import { Perustelu } from '@/src/lib/types/perustelu';
import { Tutkinto } from '@/src/lib/types/tutkinto';

const expectRequestData = async (
  page: Page,
  action: Promise<void>,
  data: unknown,
) => {
  await action;

  const saveButton = page.getByTestId('save-ribbon-button');
  await expect(saveButton).toBeVisible();

  const [request] = await Promise.all([
    page.waitForRequest(
      (req) => req.url().includes(`/perustelu/`) && req.method() === 'PUT',
    ),
    saveButton.click(),
  ]);

  await waitForSaveComplete(page);

  return expect(request.postDataJSON()).toMatchObject(data as Perustelu);
};

test.beforeEach(async ({ page }) => {
  await mockBasicForHakemus({ page });
  await mockUser(page);
  await mockHakemus(page);
  await mockPerustelu(page);
  await mockTutkinnot(page);
});

test.describe('Yleiset perustelut', () => {
  test('Lomake näkyy kokonaisuudessaan', async ({ page }) => {
    await page.goto(
      '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustelu/yleiset/perustelut',
    );

    const muuRadio = page.locator(
      '[data-testid="jatko-opintokelpoisuus-radio-group"] input[type="radio"][value="muu"]',
    );
    await muuRadio.click();

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
    await myontajaOn.click();

    const tutkintoOff = page.locator(
      '[data-testid="virallinen-tutkinto-radio-group"] input[type="radio"][value="false"]',
    );
    await tutkintoOff.click();

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
    test.setTimeout(30000);

    let testPerusteluData: Record<string, unknown> = {
      id: 'test-perustelu-id',
      hakemusId: 'test-hakemus-id',
    };

    await page.route('**/tutu-backend/api/perustelu/*', async (route) => {
      if (route.request().method() === 'PUT') {
        const putData = route.request().postDataJSON() as Record<
          string,
          unknown
        >;
        testPerusteluData = { ...testPerusteluData, ...putData };

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
      { virallinenTutkinnonMyontaja: false },
    );

    await expectRequestData(
      page,
      page
        .locator(
          '[data-testid="virallinen-tutkinnon-myontaja-radio-group"] input[type="radio"][value="true"]',
        )
        .click(),
      { virallinenTutkinnonMyontaja: true },
    );

    await expectRequestData(
      page,
      page
        .getByTestId('virallinen-tutkinnon-myontaja-radio-group-clear-button')
        .click(),
      { virallinenTutkinnonMyontaja: null },
    );

    await expectRequestData(
      page,
      page
        .locator(
          '[data-testid="virallinen-tutkinto-radio-group"] input[type="radio"][value="false"]',
        )
        .click(),
      { virallinenTutkinto: false },
    );

    await expectRequestData(
      page,
      page
        .locator(
          '[data-testid="virallinen-tutkinto-radio-group"] input[type="radio"][value="true"]',
        )
        .click(),
      { virallinenTutkinto: true },
    );

    await expectRequestData(
      page,
      page.getByTestId('virallinen-tutkinto-radio-group-clear-button').click(),
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
        page
          .locator(
            `[data-testid="tutkinnon-asema-radio-group"] input[type="radio"][value="${tutkintoaste}"]`,
          )
          .click(),
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
        page
          .locator(
            `[data-testid="jatko-opintokelpoisuus-radio-group"] input[type="radio"][value="${kelpoisuus}"]`,
          )
          .click(),
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
      page
        .locator(
          '[data-testid="aiemmat-paatokset-radio-group"] input[type="radio"][value="true"]',
        )
        .click(),
      { aikaisemmatPaatokset: true },
    );

    await expectRequestData(
      page,
      page
        .locator(
          '[data-testid="aiemmat-paatokset-radio-group"] input[type="radio"][value="false"]',
        )
        .click(),
      { aikaisemmatPaatokset: false },
    );
  });

  test('Syötetyt tutkintotiedot päivitetään hakemuksen kanssa', async ({
    page,
  }) => {
    await page.goto(
      '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustelu/yleiset/perustelut',
    );

    await page
      .getByTestId('yleiset-perustelut__tutkinto-1--ohjeellinen-laajuus')
      .getByRole('textbox')
      .fill('120 op');

    await page
      .getByTestId('yleiset-perustelut__tutkinto-1--suoritusvuodet-alku')
      .getByRole('textbox')
      .fill('2020');

    await page
      .getByTestId('yleiset-perustelut__tutkinto-1--suoritusvuodet-loppu')
      .getByRole('textbox')
      .fill('2023');

    await page
      .locator(
        `//*[@data-testid="yleiset-perustelut__tutkinto-1--opinnaytetyo"]//input[@value="true"]`,
      )
      .click();

    await page
      .locator(
        `//*[@data-testid="yleiset-perustelut__tutkinto-1--harjoittelu"]//input[@value="false"]`,
      )
      .click();

    await page
      .getByTestId('yleiset-perustelut__tutkinto-1--lisatietoja')
      .getByRole('textbox')
      .fill('Vastaa kandidaatintutkinnon perus- ja aineopintoja');

    const request = await clickSaveAndWaitForPUT(page, '/tutkinto/');

    const tutkinnot = request.postDataJSON();
    const tutkinto1 = tutkinnot.find((t: Tutkinto) => t.jarjestys === '1');

    expect(tutkinto1).toMatchObject({
      jarjestys: '1',
      aloitusVuosi: 2020,
      paattymisVuosi: 2023,
      ohjeellinenLaajuus: '120 op',
      opinnaytetyo: true,
      harjoittelu: false,
      perustelunLisatietoja:
        'Vastaa kandidaatintutkinnon perus- ja aineopintoja',
    });
  });
});
