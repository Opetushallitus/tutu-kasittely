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

  return expect(request.postDataJSON()).toEqual(data);
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

    const checks = [
      'lahde__lahtomaan-kansallinen-lahde',
      'lahde__lahtomaan-virallinen-vastaus',
      'lahde__kansainvalinen-hakuteos-tai-verkkosivusto',
      'virallinen-tutkinnon-myontaja__on',
      'virallinen-tutkinnon-myontaja__off',
      'virallinen-tutkinto__on',
      'virallinen-tutkinto__off',
      'tutkinnon-asema--alempi_korkeakouluaste',
      'tutkinnon-asema--ylempi_korkeakouluaste',
      'tutkinnon-asema--alempi_ja_ylempi_korkeakouluaste',
      'tutkinnon-asema--tutkijakoulutusaste',
      'tutkinnon-asema--ei_korkeakouluaste',
    ].map((testId) => {
      return expect(page.getByTestId(testId)).toBeAttached();
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
      { virallinenTutkinnonMyontaja: undefined },
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
      { virallinenTutkinto: undefined },
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
  });
});
