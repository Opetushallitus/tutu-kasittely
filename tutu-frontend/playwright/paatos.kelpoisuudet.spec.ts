import { test, expect, Page } from '@playwright/test';

import {
  expectDataFromDropdownSelection,
  expectHiddenOrDetached,
  expectRequestData,
  selectOption,
  selectOptionByValue,
} from '@/playwright/helpers/testUtils';
import { mockAll, mockPaatos } from '@/playwright/mocks';
import {
  KelpoisuudenLisavaatimukset,
  KielteisenPaatoksenPerustelut,
} from '@/src/lib/types/paatos';

test.beforeEach(async ({ page }) => {
  await mockAll({ page });
  await mockPaatos(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/paatostiedot',
  );
});

test('Valittaessa 2 Kelpoisuus, ja muutettaessa jatkovalintoja, näytetään käyttäjälle oikea otsikko ja valittavat kentät, ja lähetetään PUT -kutsut backendille', async ({
  page,
}) => {
  const paatostyyppiInput = page.getByTestId('paatos-paatostyyppi-dropdown');
  const sovellettuLakiSelect = page.getByTestId(
    'paatos-sovellettulaki-dropdown',
  );
  const kelpoisuusSelect = page.getByTestId('kelpoisuus-select');
  const opetettavaAineSelect = page.getByTestId('opetettavaAine-select');
  const muuAmmattiInput = page.getByTestId('muuAmmattikuvaus-input');
  const paatosText = 'hakemus.paatos.ratkaisutyyppi.paatos';
  const kelpoisuusText = 'hakemus.paatos.paatostyyppi.kelpoisuus.otsikko';
  await expect(page.getByTestId('paatos-ratkaisutyyppi')).toHaveText(
    paatosText,
  );

  await selectOption(
    page,
    paatostyyppiInput,
    '2 hakemus.paatos.paatostyyppi.options.kelpoisuus',
  );

  await expect(kelpoisuusSelect).toBeHidden();
  await expect(opetettavaAineSelect).toBeHidden();

  await selectOption(
    page,
    sovellettuLakiSelect,
    'hakemus.paatos.sovellettuLaki.uo',
  );
  await expect(page.locator('h3').last()).toHaveText(kelpoisuusText + ' 1');
  await expect(kelpoisuusSelect).toBeVisible();
  await expect(opetettavaAineSelect).toBeHidden();

  await expectDataFromDropdownSelection(
    page,
    kelpoisuusSelect,
    'Aineenopettaja perusopetuksessa',
    '/paatos/',
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'Kelpoisuus',
          kelpoisuudet: [
            {
              kelpoisuus: 'Opetusalan ammatit_Aineenopettaja perusopetuksessa',
            },
          ],
        },
      ],
    },
  );

  await selectOption(
    page,
    sovellettuLakiSelect,
    'hakemus.paatos.sovellettuLaki.ap_seut',
  );
  await selectOption(page, kelpoisuusSelect, 'Aineenopettaja lukiossa');
  await expect(opetettavaAineSelect).toBeVisible();
  await expect(muuAmmattiInput).toBeHidden();

  await expectDataFromDropdownSelection(
    page,
    opetettavaAineSelect,
    'biologia',
    '/paatos/',
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'Kelpoisuus',
          kelpoisuudet: [
            {
              kelpoisuus: 'Opetusalan ammatit_Aineenopettaja lukiossa',
              opetettavaAine: [
                'Opetusalan ammatit_Aineenopettaja lukiossa_biologia',
              ],
            },
          ],
        },
      ],
    },
  );

  await expectDataFromDropdownSelection(
    page,
    page.getByTestId('direktiivitaso-select'),
    'hakemus.paatos.direktiivitaso.b_1384_2015_patevyystaso_2',
    '/paatos/',
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'Kelpoisuus',
          kelpoisuudet: [
            {
              kelpoisuus: 'Opetusalan ammatit_Aineenopettaja lukiossa',
              opetettavaAine: [
                'Opetusalan ammatit_Aineenopettaja lukiossa_biologia',
              ],
              direktiivitaso: 'b_1384_2015_patevyystaso_2',
            },
          ],
        },
      ],
    },
  );

  await expectDataFromDropdownSelection(
    page,
    page.getByTestId('kansallisestiVaadittavaDirektiivitaso-select'),
    'hakemus.paatos.direktiivitaso.c_1384_2015_patevyystaso_3',
    '/paatos/',
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'Kelpoisuus',
          kelpoisuudet: [
            {
              kelpoisuus: 'Opetusalan ammatit_Aineenopettaja lukiossa',
              opetettavaAine: [
                'Opetusalan ammatit_Aineenopettaja lukiossa_biologia',
              ],
              direktiivitaso: 'b_1384_2015_patevyystaso_2',
              kansallisestiVaadittavaDirektiivitaso:
                'c_1384_2015_patevyystaso_3',
            },
          ],
        },
      ],
    },
  );

  await expectRequestData(
    page,
    '/paatos/',
    page
      .getByTestId('direktiivitasoLisatieto-input')
      .getByRole('textbox')
      .fill('Tämä on lisätieto'),
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'Kelpoisuus',
          kelpoisuudet: [
            {
              direktiivitasoLisatiedot: 'Tämä on lisätieto',
            },
          ],
        },
      ],
    },
  );

  await selectOption(
    page,
    kelpoisuusSelect,
    'hakemus.paatos.paatostyyppi.kelpoisuus.additionalKelpoisuudet.muuAmmatti',
  );
  await expect(opetettavaAineSelect).toBeHidden();
  await expect(muuAmmattiInput).toBeVisible();

  await expectRequestData(
    page,
    '/paatos/',
    muuAmmattiInput.getByRole('textbox').fill('Muu ammatti lisätieto'),
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'Kelpoisuus',
          kelpoisuudet: [
            {
              kelpoisuus: 'Muu ammatti',
              muuAmmattiKuvaus: 'Muu ammatti lisätieto',
            },
          ],
        },
      ],
    },
  );
});

const makeInitialKelpoisuusSelections = async (page: Page) => {
  await selectOption(
    page,
    page.getByTestId('paatos-paatostyyppi-dropdown'),
    '2 hakemus.paatos.paatostyyppi.options.kelpoisuus',
  );
  await selectOption(
    page,
    page.getByTestId('paatos-sovellettulaki-dropdown'),
    'hakemus.paatos.sovellettuLaki.ap_seut',
  );
  await selectOption(
    page,
    page.getByTestId('kelpoisuus-select'),
    'Aineenopettaja perusopetuksessa',
  );
};

test('Kelpoisuuksien lisääminen ja poistaminen toimivat odotetusti, ja lähettävät PUT -kutsut backendille', async ({
  page,
}) => {
  await makeInitialKelpoisuusSelections(page);
  const kelpoisuusText = 'hakemus.paatos.paatostyyppi.kelpoisuus.otsikko';
  await expect(page.locator('h3').last()).toHaveText(kelpoisuusText + ' 1');

  const lisaaKelpoisuusButton = page.getByTestId('lisaa-kelpoisuus-button');
  await expect(lisaaKelpoisuusButton).toBeVisible();
  await lisaaKelpoisuusButton.scrollIntoViewIfNeeded();

  await expectRequestData(page, '/paatos/', lisaaKelpoisuusButton.click(), {
    paatosTiedot: [
      {
        paatosTyyppi: 'Kelpoisuus',
        kelpoisuudet: [{}, {}],
      },
    ],
  });

  await page.getByTestId('poista-kelpoisuus-button-1').click();
  await expect(page.getByTestId('modal-component')).toBeVisible();

  const [request] = await Promise.all([
    page.waitForRequest(
      (req) => req.url().includes('/paatos/') && req.method() === 'PUT',
    ),
    await page.getByTestId('modal-confirm-button').click(),
  ]);
  expect(request.postDataJSON()).toMatchObject({
    paatosTiedot: [
      {
        paatosTyyppi: 'Kelpoisuus',
        kelpoisuudet: [{}],
      },
    ],
  });
});

const backendRequestMyonteinenPaatos = (
  lisavaatimukset?: KelpoisuudenLisavaatimukset,
): Record<string, unknown> => {
  const obj = {
    paatosTiedot: [
      {
        paatosTyyppi: 'Kelpoisuus',
        kelpoisuudet: [
          lisavaatimukset
            ? {
                myonteisenPaatoksenLisavaatimukset: {},
                myonteinenPaatos: true,
              }
            : {
                myonteinenPaatos: true,
              },
        ],
      },
    ],
  };
  const paatosTieto = obj.paatosTiedot[0];
  if (typeof paatosTieto === 'object' && lisavaatimukset) {
    const kelpoisuus = paatosTieto.kelpoisuudet[0];
    if (typeof kelpoisuus === 'object') {
      kelpoisuus.myonteisenPaatoksenLisavaatimukset = lisavaatimukset;
    }
  }
  return obj;
};

test('Myönteisen päätöksen jatkovalinnat näytetään oikein, ja vastaavat PUT -kutsut lähetetään backendille', async ({
  page,
}) => {
  test.slow();

  await makeInitialKelpoisuusSelections(page);
  const myonteinenPaatosRadiogroup = page.getByTestId(
    'myonteinenPaatos-radio-group',
  );
  const olennaisiaErojaRadiogroup = page.getByTestId(
    'kelpoisuus-myonteinenPaatos-olennaisiaEroja-radio-group',
  );
  const erotKoulutuksessaButton1 = page.getByTestId('erotKoulutuksessa-ero1');
  const erotKoulutuksessaButton2 = page.getByTestId('erotKoulutuksessa-ero2');
  const erotKoulutuksessaButton3 = page.getByTestId('erotKoulutuksessa-ero3');
  const erotKoulutuksessaButton4 = page.getByTestId(
    'erotKoulutuksessa-eriIkaryhma',
  );
  const muuEroButton = page.getByTestId('erotKoulutuksessa-muuEro');
  const muuEroInput = page.getByTestId('erotKoulutuksessa-muuEroKuvaus');
  const kelpoisuuskoeButton = page.getByTestId(
    'lahtokohtainen-korvaavaToimenpide-kelpoisuuskoe',
  );
  const sopeutumisaikaButton = page.getByTestId(
    'lahtokohtainen-korvaavaToimenpide-sopeutumisaika',
  );
  const dualButton = page.getByTestId(
    'lahtokohtainen-korvaavaToimenpide-kelpoisuuskoeJaSopeutumisaika',
  );
  const aihealue1Button = page.getByTestId(
    'lahtokohtainen-singleChoice-kelpoisuuskoe-sisalto-aihealue1',
  );
  const aihealue1ButtonDual = page.getByTestId(
    'lahtokohtainen-dualChoice-kelpoisuuskoe-sisalto-aihealue1',
  );
  const sopeutumisaikaInput = page.getByTestId(
    'lahtokohtainen-singleChoice-korvaavaToimenpide-sopeutumisaika-input',
  );
  const sopeutumisaikaInputDual = page.getByTestId(
    'lahtokohtainen-dualChoice-korvaavaToimenpide-sopeutumisaika-input',
  );
  const kokemusJaOppiminenKelpoisuuskoeButton = page.getByTestId(
    'ammattikokemusElinikainenOppiminen-korvaavaToimenpide-kelpoisuuskoe',
  );
  const kokemusJaOppiminenSopeutumisaikaButton = page.getByTestId(
    'ammattikokemusElinikainenOppiminen-korvaavaToimenpide-sopeutumisaika',
  );
  const kokemusJaOppiminenDualButton = page.getByTestId(
    'ammattikokemusElinikainenOppiminen-korvaavaToimenpide-kelpoisuuskoeJaSopeutumisaika',
  );
  const kokemusJaOppiminenAihealue1Button = page.getByTestId(
    'ammattikokemusElinikainenOppiminen-singleChoice-kelpoisuuskoe-sisalto-aihealue1',
  );
  const kokemusJaOppiminenAihealue1ButtonDual = page.getByTestId(
    'ammattikokemusElinikainenOppiminen-dualChoice-kelpoisuuskoe-sisalto-aihealue1',
  );
  const korvaavuusAmmattikokemusRadioGroup = page.getByTestId(
    'ammattikokemus-korvaavuus-radio-group',
  );
  const korvaavuusElinikainenOppiminenRadioGroup = page.getByTestId(
    'elinikainenOppiminen-korvaavuus-radio-group',
  );
  const korvaavuusAmmattikokemusJaElinikainenOppiminenYhdessa =
    page.getByTestId('ammattikokemusJalinikainenOppiminenYhdessa-checkbox');

  const kokemusOppiminenLisatietoInput = page.getByTestId(
    'ammattikokemusElinikainenOppiminen-lisatieto-input',
  );

  await expect(myonteinenPaatosRadiogroup).toBeVisible();
  await expect(olennaisiaErojaRadiogroup).toBeHidden();
  await expect(erotKoulutuksessaButton1).toBeHidden();
  await expect(erotKoulutuksessaButton2).toBeHidden();
  await expect(erotKoulutuksessaButton3).toBeHidden();
  await expect(erotKoulutuksessaButton4).toBeHidden();
  await expect(muuEroButton).toBeHidden();
  await expect(muuEroInput).toBeHidden();
  await expect(kelpoisuuskoeButton).toBeHidden();
  await expect(sopeutumisaikaButton).toBeHidden();
  await expect(aihealue1Button).toBeHidden();
  await expect(sopeutumisaikaInput).toBeHidden();
  await expect(korvaavuusAmmattikokemusRadioGroup).toBeHidden();
  await expect(korvaavuusElinikainenOppiminenRadioGroup).toBeHidden();
  await expect(
    korvaavuusAmmattikokemusJaElinikainenOppiminenYhdessa,
  ).toBeHidden();
  await expect(kokemusOppiminenLisatietoInput).toBeHidden();

  await expectRequestData(
    page,
    '/paatos/',
    myonteinenPaatosRadiogroup
      .locator('input[type="radio"][value="true"]')
      .click(),
    backendRequestMyonteinenPaatos(),
  );
  await expect(olennaisiaErojaRadiogroup).toBeVisible();

  const lisavaatimusRequest: KelpoisuudenLisavaatimukset = {
    olennaisiaEroja: true,
  };
  await expectRequestData(
    page,
    '/paatos/',
    olennaisiaErojaRadiogroup
      .locator('input[type="radio"][value="true"]')
      .click(),
    backendRequestMyonteinenPaatos(lisavaatimusRequest),
  );
  await expect(erotKoulutuksessaButton1).toBeVisible();
  await expect(erotKoulutuksessaButton2).toBeVisible();
  await expect(erotKoulutuksessaButton3).toBeVisible();
  await expect(erotKoulutuksessaButton4).toBeVisible();
  await expect(muuEroButton).toBeVisible();
  await expect(kelpoisuuskoeButton).toBeVisible();
  await expect(sopeutumisaikaButton).toBeVisible();
  await expect(korvaavuusAmmattikokemusRadioGroup).toBeVisible();
  await expect(korvaavuusElinikainenOppiminenRadioGroup).toBeVisible();

  lisavaatimusRequest.erotKoulutuksessa = {
    erot: [
      { name: 'ero1', value: true },
      { name: 'ero2', value: false },
      { name: 'ero3', value: false },
      { name: 'eriIkaryhma', value: false },
    ],
  };
  await expectRequestData(
    page,
    '/paatos/',
    erotKoulutuksessaButton1.click(),
    backendRequestMyonteinenPaatos(lisavaatimusRequest),
  );

  lisavaatimusRequest.erotKoulutuksessa = {
    erot: [
      { name: 'ero1', value: true },
      { name: 'ero2', value: false },
      { name: 'ero3', value: false },
      { name: 'eriIkaryhma', value: true },
    ],
  };
  await expectRequestData(
    page,
    '/paatos/',
    erotKoulutuksessaButton4.click(),
    backendRequestMyonteinenPaatos(lisavaatimusRequest),
  );

  // Edellisen tallennuksen PUT-vastaus on saattanut viivästyttää DOM-päivitystä,
  // joten odotetaan että muuEroInput tulee näkyviin ennen kuin jatketaan
  await expect(async () => {
    if (!(await muuEroButton.isChecked())) {
      await muuEroButton.click();
    }
    await expect(muuEroInput).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 15000 });
  lisavaatimusRequest.erotKoulutuksessa = {
    muuEro: true,
    muuEroKuvaus: 'Tämä on muu ero',
  };
  await expectRequestData(
    page,
    '/paatos/',
    muuEroInput.getByRole('textbox').fill('Tämä on muu ero'),
    backendRequestMyonteinenPaatos(lisavaatimusRequest),
  );

  await kelpoisuuskoeButton.click();
  await expect(aihealue1Button).toBeVisible();
  lisavaatimusRequest.korvaavaToimenpide = {
    kelpoisuuskoe: true,
    kelpoisuuskoeSisalto: { aihealue1: true },
  };
  await expectRequestData(
    page,
    '/paatos/',
    aihealue1Button.click(),
    backendRequestMyonteinenPaatos(lisavaatimusRequest),
  );

  await sopeutumisaikaButton.click();
  await expect(sopeutumisaikaInput).toBeVisible();
  lisavaatimusRequest.korvaavaToimenpide = {
    sopeutumisaika: true,
    sopeutumiusaikaKestoKk: '3',
  };
  await expectRequestData(
    page,
    '/paatos/',
    sopeutumisaikaInput.getByRole('textbox').fill('3'),
    backendRequestMyonteinenPaatos(lisavaatimusRequest),
  );

  await kelpoisuuskoeButton.click();
  await sopeutumisaikaButton.click();
  await expect(aihealue1Button).toBeHidden();
  await expect(sopeutumisaikaInput).toBeHidden();
  await dualButton.click();
  await expect(aihealue1ButtonDual).toBeVisible();
  await expect(sopeutumisaikaInputDual).toBeVisible();
  lisavaatimusRequest.korvaavaToimenpide = {
    kelpoisuuskoe: false,
    sopeutumisaika: false,
    kelpoisuuskoeJaSopeutumisaika: false,
  };
  await expectRequestData(
    page,
    '/paatos/',
    dualButton.click(),
    backendRequestMyonteinenPaatos(lisavaatimusRequest),
  );

  await expect(korvaavuusAmmattikokemusRadioGroup).toBeVisible();
  await korvaavuusAmmattikokemusRadioGroup
    .locator('input[type="radio"][value="Taysi"]')
    .click();
  await expect(korvaavuusElinikainenOppiminenRadioGroup).toBeVisible();
  await korvaavuusElinikainenOppiminenRadioGroup
    .locator('input[type="radio"][value="Taysi"]')
    .click();
  await korvaavuusAmmattikokemusJaElinikainenOppiminenYhdessa.click();

  await expect(kokemusOppiminenLisatietoInput).toBeHidden();

  lisavaatimusRequest.ammattikokemusJaElinikainenOppiminen = {
    korvaavuusAmmattikokemus: 'Taysi',
    korvaavuusElinikainenOppiminen: 'Taysi',
    korvaavuusAmmattikokemusJaElinikainenOppiminenYhdessa: true,
    lisatieto: 'Täsmennä ite',
  };

  lisavaatimusRequest.ammattikokemusJaElinikainenOppiminen = {
    korvaavuusAmmattikokemus: 'Osittainen',
  };
  await expectRequestData(
    page,
    '/paatos/',
    korvaavuusAmmattikokemusRadioGroup
      .locator('input[type="radio"][value="Osittainen"]')
      .click(),
    backendRequestMyonteinenPaatos(lisavaatimusRequest),
  );

  await expect(kokemusOppiminenLisatietoInput).toBeVisible();

  await expectRequestData(
    page,
    '/paatos/',
    kokemusOppiminenLisatietoInput.getByRole('textbox').fill('Täsmennä ite'),
    backendRequestMyonteinenPaatos(lisavaatimusRequest),
  );

  await expect(kokemusJaOppiminenKelpoisuuskoeButton).toBeVisible();
  await expect(kokemusJaOppiminenSopeutumisaikaButton).toBeVisible();
  await expect(kokemusJaOppiminenDualButton).toBeVisible();

  await kokemusJaOppiminenKelpoisuuskoeButton.click();
  await kokemusJaOppiminenDualButton.click();
  await expect(kokemusJaOppiminenAihealue1Button).toBeVisible();
  await expect(kokemusJaOppiminenAihealue1ButtonDual).toBeVisible();

  lisavaatimusRequest.ammattikokemusJaElinikainenOppiminen = {
    korvaavuusAmmattikokemus: null,
    korvaavuusElinikainenOppiminen: 'Taysi',
  };
  await expectRequestData(
    page,
    '/paatos/',
    page
      .getByTestId('ammattikokemus-korvaavuus-radio-group-clear-button')
      .click(),
    backendRequestMyonteinenPaatos(lisavaatimusRequest),
  );
  await expect(
    page.getByTestId('ammattikokemus-korvaavuus-radio-group-clear-button'),
  ).toBeHidden();

  lisavaatimusRequest.ammattikokemusJaElinikainenOppiminen = {
    korvaavuusAmmattikokemus: null,
    korvaavuusElinikainenOppiminen: null,
  };
  await expectRequestData(
    page,
    '/paatos/',
    page
      .getByTestId('elinikainenOppiminen-korvaavuus-radio-group-clear-button')
      .click(),
    backendRequestMyonteinenPaatos(lisavaatimusRequest),
  );
  await expect(
    page.getByTestId(
      'elinikainenOppiminen-korvaavuus-radio-group-clear-button',
    ),
  ).toBeHidden();

  await expectHiddenOrDetached(kokemusJaOppiminenKelpoisuuskoeButton);
  await expectHiddenOrDetached(kokemusJaOppiminenSopeutumisaikaButton);
  await expectHiddenOrDetached(kokemusJaOppiminenDualButton);

  await expect(kokemusOppiminenLisatietoInput).toBeHidden();

  await expectRequestData(
    page,
    '/paatos/',
    page
      .getByTestId(
        'kelpoisuus-myonteinenPaatos-olennaisiaEroja-radio-group-clear-button',
      )
      .click(),
    backendRequestMyonteinenPaatos({ olennaisiaEroja: null }),
  );
});

const backendRequestKielteinenPaatos = (
  perustelut?: KielteisenPaatoksenPerustelut,
): Record<string, unknown> => {
  const obj = {
    paatosTiedot: [
      {
        paatosTyyppi: 'Kelpoisuus',
        kelpoisuudet: [
          perustelut
            ? {
                kielteisenPaatoksenPerustelut: {},
                myonteinenPaatos: false,
              }
            : {
                myonteinenPaatos: false,
              },
        ],
      },
    ],
  };
  const paatosTieto = obj.paatosTiedot[0];
  if (typeof paatosTieto === 'object' && perustelut) {
    const kelpoisuus = paatosTieto.kelpoisuudet[0];
    if (typeof kelpoisuus === 'object') {
      kelpoisuus.kielteisenPaatoksenPerustelut = perustelut;
    }
  }
  return obj;
};

test('Kielteisen päätöksen jatkovalinnat näytetään oikein, ja vastaavat PUT -kutsut lähetetään backendille', async ({
  page,
}) => {
  await makeInitialKelpoisuusSelections(page);
  const myonteinenPaatosRadiogroup = page.getByTestId(
    'myonteinenPaatos-radio-group',
  );
  const olennaisiaErojaRadiogroup = page.getByTestId(
    'kelpoisuus-myonteinenPaatos-olennaisiaEroja-radio-group',
  );
  const epavirallinenKorkeakouluButton = page.getByTestId(
    'kielteinenPaatos-epavirallinenKorkeakoulu',
  );
  const muuPerusteluButton = page.getByTestId('kielteinenPaatos-muuPerustelu');
  const muuPerusteluInput = page.getByTestId(
    'kielteinenPaatos-muuPerustelu-kuvaus-input',
  );

  await myonteinenPaatosRadiogroup
    .locator('input[type="radio"][value="true"]')
    .click();
  await expect(olennaisiaErojaRadiogroup).toBeVisible();

  const lisavaatimusRequest: KelpoisuudenLisavaatimukset = {
    olennaisiaEroja: false,
  };
  await expectRequestData(
    page,
    '/paatos/',
    olennaisiaErojaRadiogroup
      .locator('input[type="radio"][value="false"]')
      .click(),
    backendRequestMyonteinenPaatos(lisavaatimusRequest),
  );
  await expect(olennaisiaErojaRadiogroup).toBeVisible();
  await expect(epavirallinenKorkeakouluButton).toBeHidden();
  await expect(muuPerusteluButton).toBeHidden();
  await expect(muuPerusteluInput).toBeHidden();

  await expectRequestData(
    page,
    '/paatos/',
    myonteinenPaatosRadiogroup
      .locator('input[type="radio"][value="false"]')
      .click(),
    backendRequestKielteinenPaatos(),
  );
  await expect(olennaisiaErojaRadiogroup).toBeHidden();
  await expect(epavirallinenKorkeakouluButton).toBeVisible();
  await expect(muuPerusteluButton).toBeVisible();

  const perustelutRequest: KielteisenPaatoksenPerustelut = {
    epavirallinenKorkeakoulu: true,
    muuPerustelu: true,
    muuPerusteluKuvaus: 'Huonosti meni',
  };
  await epavirallinenKorkeakouluButton.click();
  await muuPerusteluButton.click();
  await expect(muuPerusteluInput).toBeVisible();
  await expectRequestData(
    page,
    '/paatos/',
    muuPerusteluInput.getByRole('textbox').fill('Huonosti meni'),
    backendRequestKielteinenPaatos(perustelutRequest),
  );

  // myonteinenPaatos-radio-group
  await expectRequestData(
    page,
    '/paatos/',
    page.getByTestId('myonteinenPaatos-radio-group-clear-button').click(),
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'Kelpoisuus',
          kelpoisuudet: [{ myonteinenPaatos: null }],
        },
      ],
    },
  );
  await expect(olennaisiaErojaRadiogroup).toBeHidden();
  await expect(epavirallinenKorkeakouluButton).toBeHidden();
  await expect(muuPerusteluButton).toBeHidden();
});

test('Valittaessa 2 Kelpoisuus ja Päätös UO näytetään oikeat jatkokysymyskentät', async ({
  page,
}) => {
  const paatostyyppiInput = page.getByTestId('paatos-paatostyyppi-dropdown');
  const sovellettuLakiSelect = page.getByTestId(
    'paatos-sovellettulaki-dropdown',
  );
  await selectOption(
    page,
    paatostyyppiInput,
    '2 hakemus.paatos.paatostyyppi.options.kelpoisuus',
  );
  await selectOption(
    page,
    sovellettuLakiSelect,
    'hakemus.paatos.sovellettuLaki.uo',
  );
  await page.getByTestId('kelpoisuus-select').isVisible();

  await selectOptionByValue(
    page,
    page.getByTestId('kelpoisuus-select'),
    'Opetusalan ammatit_Esiopetusta antava opettaja',
  );

  await page
    .getByTestId('myonteinenPaatos-radio-group')
    .getByText('hakemus.paatos.myonteinen')
    .click();

  const sovellettuTilanneSelect = page.getByTestId(
    'uo-sovellettuTilanne-select',
  );

  await expect(sovellettuTilanneSelect).toBeHidden();

  await selectOptionByValue(
    page,
    page.getByTestId('kelpoisuus-select'),
    'Opetusalan ammatit_Luokanopettaja',
  );

  await page
    .getByTestId('myonteinenPaatos-radio-group')
    .getByText('hakemus.paatos.myonteinen')
    .click();

  await expect(sovellettuTilanneSelect).toBeVisible();
  const ammattikokemuksenHuomioiminenRadiot = page.getByTestId(
    'uo-ammattikokemuksenHuomioiminen-radio',
  );

  await Promise.all(
    [
      'UlkomaillaHankittuKokonaan',
      'SuomessaJaUlkomaillaHankittuKokonaan',
      'SuomessaJaUlkomaillaHankittuOsittain',
    ].map(async (option) => {
      await expect(
        ammattikokemuksenHuomioiminenRadiot.locator(`input[value="${option}"]`),
      ).toBeHidden();
    }),
  );

  await selectOptionByValue(
    page,
    page.getByTestId('kelpoisuus-select'),
    'Opetusalan ammatit_Aineenopettaja perusopetuksessa',
  );

  await page
    .getByTestId('myonteinenPaatos-radio-group')
    .getByText('hakemus.paatos.myonteinen')
    .click();

  await expect(sovellettuTilanneSelect).toBeVisible();

  await sovellettuTilanneSelect.click();
  await expect(sovellettuTilanneSelect).toBeVisible();
  await expect(
    page.locator('ul[role="listbox"] li[role="option"]'),
  ).toHaveCount(10);
  await page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator(
      `text=${'hakemus.paatos.paatostyyppi.kelpoisuus.uo.sovellettuTilanne.pedagogiset1_ja_aine1'}`,
    )
    .last()
    .click();
  await page.getByTestId('erotKoulutuksessa-ero3').click();
  await page.getByTestId('erotKoulutuksessa-ero4').click();

  await expect(
    page.getByTestId('erotKoulutuksessa-ero3-tarkennus1'),
  ).toBeVisible();
  await expect(
    page.getByTestId('erotKoulutuksessa-ero3-tarkennus2'),
  ).toBeVisible();
  await expect(
    page.getByTestId('erotKoulutuksessa-ero4-tarkennus1'),
  ).toBeVisible();
  await expect(
    page.getByTestId('erotKoulutuksessa-ero4-tarkennus2'),
  ).toBeVisible();

  const osaamisenTaydentamisenTavat = page.getByText(
    'hakemus.paatos.paatostyyppi.kelpoisuus.uo.osaamisenTaydentamisenTavat',
    { exact: true },
  );

  await Promise.all(
    [
      'SuomessaHankittuOsittain',
      'UlkomaillaHankittuOsittain',
      'SuomessaJaUlkomaillaHankittuOsittain',
    ].map(async (option) => {
      await ammattikokemuksenHuomioiminenRadiot
        .locator(`input[value="${option}"]`)
        .click();
      await expect(osaamisenTaydentamisenTavat).toBeVisible();
      await ammattikokemuksenHuomioiminenRadiot
        .locator(`input[value="${option}"]`)
        .click();
    }),
  );

  await page
    .getByTestId('uo-suomessaSuoritettujenOpintojenHuomioiminen-radio')
    .locator(`input[value="KorvaavatOsittain"]`)
    .click();

  await expect(osaamisenTaydentamisenTavat).toBeVisible();

  await page
    .getByTestId('uo-suomessaSuoritettujenOpintojenHuomioiminen-radio')
    .locator(`input[value="EiHuomioida"]`)
    .click();
  await ammattikokemuksenHuomioiminenRadiot
    .locator(`input[value="EiHuomioida"]`)
    .click();

  await expect(
    page.getByText(
      'hakemus.paatos.paatostyyppi.kelpoisuus.uo.kaytetaanLahtokohtaisiaOsaamisenTaydentamisenTapoja',
    ),
  ).toBeVisible();
});
