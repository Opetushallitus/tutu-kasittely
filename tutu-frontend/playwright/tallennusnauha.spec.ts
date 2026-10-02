import { expect, Page, Route, test } from '@playwright/test';

import {
  getPaatos,
  getPaatosWithPaatosTiedot,
} from '@/playwright/fixtures/paatos1';
import { apSisalto } from '@/playwright/fixtures/perustelu1/_perusteluApSisalto';
import { getValitustiedot } from '@/playwright/fixtures/valitustiedot1';
import { selectOption } from '@/playwright/helpers/testUtils';
import { mockAll, mockGetAndPut } from '@/playwright/mocks';
import { emptyKielteisenPaatoksenPerustelut } from '@/src/app/hakemus/paatostiedot/paatostietoUtils';
import { Paatos, PaatosTieto } from '@/src/lib/types/paatos';
import { Valitustiedot } from '@/src/lib/types/valitustiedot';

const HAKEMUS_OID = '1.2.246.562.10.00000000001';

const saveButton = (page: Page) => page.getByTestId('save-ribbon-button');

const mockValitustiedot = (page: Page, valitustiedot: Valitustiedot) =>
  page.route(
    `**/tutu-backend/api/hakemus/*/valitustiedot**`,
    async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(valitustiedot),
      });
    },
  );

const valitustiedotHaOValitettu = (
  valitusHaO: Partial<Valitustiedot['valitusHaO']> = {},
): Valitustiedot => {
  const valitustiedot = getValitustiedot();
  return {
    ...valitustiedot,
    valitusHaO: { ...valitustiedot.valitusHaO, valitettu: true, ...valitusHaO },
  };
};

const gotoValitustiedot = async (page: Page, valitustiedot: Valitustiedot) => {
  await mockAll({ page });
  await mockValitustiedot(page, valitustiedot);
  await page.goto(`/tutu-frontend/hakemus/${HAKEMUS_OID}/valitustiedot`);
  await expect(page.getByTestId('valitushao-valitettu-checkbox')).toBeVisible();
};

const gotoPaatos = async (page: Page, paatos: Paatos) => {
  await mockAll({ page });
  await mockGetAndPut(page, `**/tutu-backend/api/paatos/*`, paatos);
  await page.goto(`/tutu-frontend/hakemus/${HAKEMUS_OID}/paatostiedot`);
  await expect(page.getByTestId('paatos-ratkaisutyyppi')).toBeVisible();
};

const tasoPaatos = (paatosTieto: Partial<PaatosTieto>): Paatos => {
  const paatos = getPaatosWithPaatosTiedot();
  return {
    ...paatos,
    paatosTiedot: [{ ...paatos.paatosTiedot![0], ...paatosTieto }],
  };
};

test.describe('Valitustiedot', () => {
  test('valittajan vaatimusten poistaminen ja takaisin valitseminen ei näytä tallennusnauhaa', async ({
    page,
  }) => {
    const valitustiedot = valitustiedotHaOValitettu();
    valitustiedot.valitusHaO.valittajanVaatimus = {
      ...valitustiedot.valitusHaO.valittajanVaatimus,
      taso: true,
      suuntautuminen: true,
    };
    await gotoValitustiedot(page, valitustiedot);

    const taso = page.getByTestId(
      'valitushao-valittajanvaatimus-taso-checkbox',
    );
    const suuntautuminen = page.getByTestId(
      'valitushao-valittajanvaatimus-suuntautuminen-checkbox',
    );

    await taso.click();
    await suuntautuminen.click();
    await expect(saveButton(page)).toBeVisible();

    await taso.click();
    await suuntautuminen.click();
    await expect(saveButton(page)).toBeHidden();
  });

  test('ASHA-tunnuksen kirjoittaminen ja tyhjentäminen ei näytä tallennusnauhaa', async ({
    page,
  }) => {
    await gotoValitustiedot(
      page,
      valitustiedotHaOValitettu({ lausuntopyyntoValittu: true }),
    );

    const ashaTunnus = page
      .getByTestId('valitushao-ashatunnus-input')
      .getByRole('textbox');

    await ashaTunnus.fill('ASHA-123');
    await expect(saveButton(page)).toBeVisible();

    await ashaTunnus.fill('');
    await expect(saveButton(page)).toBeHidden();
  });

  test('lausuntopyynnön valitseminen ja poistaminen ei näytä tallennusnauhaa', async ({
    page,
  }) => {
    await gotoValitustiedot(page, valitustiedotHaOValitettu());

    const lausuntopyynto = page.getByLabel(
      'hakemus.valitustiedot.valitushao.haoLausuntopyynto',
    );

    await lausuntopyynto.click();
    await expect(saveButton(page)).toBeVisible();

    await lausuntopyynto.click();
    await expect(saveButton(page)).toBeHidden();
  });

  test('valituksen valitseminen ja poistaminen ei näytä tallennusnauhaa', async ({
    page,
  }) => {
    await gotoValitustiedot(page, getValitustiedot());

    const valitettu = page.getByTestId('valitushao-valitettu-checkbox');

    await valitettu.click();
    await expect(saveButton(page)).toBeVisible();

    await valitettu.click();
    await expect(saveButton(page)).toBeHidden();
  });
});

test.describe('AP-perustelu', () => {
  test('valintaruudun poistaminen ja takaisin valitseminen ei näytä tallennusnauhaa', async ({
    page,
  }) => {
    await mockAll({ page });
    await page.route(
      '**/tutu-backend/api/perustelu/ap-perustelu-oid',
      async (route: Route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'mock-perustelu-id',
            hakemusId: 'mock-hakemus-id',
            uoRoSisalto: {},
            apSisalto: apSisalto,
          }),
        });
      },
    );
    await page.goto('/tutu-frontend/hakemus/ap-perustelu-oid/perustelu/ap/');

    const checkbox = page.getByTestId('IMIHalytysTarkastettu');
    await expect(checkbox).toBeVisible();

    await checkbox.click();
    await expect(saveButton(page)).toBeVisible();

    await checkbox.click();
    await expect(saveButton(page)).toBeHidden();
  });
});

test.describe('Päätöstiedot', () => {
  test('peruutuksen syyn valitseminen ja poistaminen ei näytä tallennusnauhaa', async ({
    page,
  }) => {
    await gotoPaatos(page, {
      ...getPaatos(),
      ratkaisutyyppi: 'PeruutusTaiRaukeaminen',
    });

    const syy = page.getByTestId('muutenTyytymatonRatkaisuun');

    await syy.click();
    await expect(saveButton(page)).toBeVisible();

    await syy.click();
    await expect(saveButton(page)).toBeHidden();
  });

  test('kielteisen päätöksen perustelun valitseminen ja poistaminen ei näytä tallennusnauhaa', async ({
    page,
  }) => {
    await gotoPaatos(page, tasoPaatos({ myonteinenPaatos: false }));

    const perustelu = page.getByTestId(
      'kielteinenPaatos-epavirallinenKorkeakoulu',
    );

    await perustelu.click();
    await expect(saveButton(page)).toBeVisible();

    await perustelu.click();
    await expect(saveButton(page)).toBeHidden();
  });

  test('myönteisen päätöksen valitseminen ja tyhjentäminen ei näytä tallennusnauhaa', async ({
    page,
  }) => {
    await gotoPaatos(
      page,
      tasoPaatos({ myonteinenPaatos: null, tutkintoTaso: null }),
    );

    const radioGroup = page.getByTestId('myonteinenPaatos-radio-group');

    await radioGroup.locator('input[type="radio"][value="true"]').click();
    await expect(saveButton(page)).toBeVisible();

    await page.getByTestId('myonteinenPaatos-radio-group-clear-button').click();
    await expect(saveButton(page)).toBeHidden();
  });

  test('kelpoisuuden myönteisen päätöksen ja direktiivitason valitseminen ja päätöksen tyhjentäminen ei näytä tallennusnauhaa', async ({
    page,
  }) => {
    await gotoPaatos(
      page,
      tasoPaatos({
        paatosTyyppi: 'Kelpoisuus',
        sovellettuLaki: 'ap_seut',
        myonteinenPaatos: null,
        tutkintoTaso: null,
        kelpoisuudet: [
          {
            kelpoisuus: 'Opetusalan ammatit_Aineenopettaja lukiossa',
            opetettavaAine:
              'Opetusalan ammatit_Aineenopettaja lukiossa_biologia',
            direktiivitaso: null,
            kansallisestiVaadittavaDirektiivitaso: null,
            direktiivitasoLisatiedot: null,
            myonteinenPaatos: null,
            myonteisenPaatoksenLisavaatimukset: null,
            kielteisenPaatoksenPerustelut: emptyKielteisenPaatoksenPerustelut(),
          },
        ],
      }),
    );

    const radioGroup = page.getByTestId('myonteinenPaatos-radio-group');

    await radioGroup.locator('input[type="radio"][value="true"]').click();
    await selectOption(
      page,
      page.getByTestId('direktiivitaso-select'),
      'hakemus.paatos.direktiivitaso.b_1384_2015_patevyystaso_2',
    );
    await expect(saveButton(page)).toBeVisible();

    await page.getByTestId('myonteinenPaatos-radio-group-clear-button').click();
    await expect(page.getByTestId('direktiivitaso-select')).toBeHidden();
    await expect(saveButton(page)).toBeHidden();
  });

  test('kolmitilaisen valinnan muuttaminen tyhjästä kielteiseksi näyttää tallennusnauhan', async ({
    page,
  }) => {
    await gotoPaatos(
      page,
      tasoPaatos({ myonteinenPaatos: null, tutkintoTaso: null }),
    );

    await page
      .getByTestId('myonteinenPaatos-radio-group')
      .locator('input[type="radio"][value="false"]')
      .click();
    await expect(saveButton(page)).toBeVisible();
  });
});
