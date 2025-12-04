import { test, expect, Page } from '@playwright/test';
import { mockAll, mockPaatos } from '@/playwright/mocks';
import {
  expectDataFromDropdownSelection,
  expectRequestData,
  selectOption,
} from '@/playwright/helpers/testUtils';
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

test('Valittaessa 2 Kelpoisuus, ja muutettaessa jatkovalintoja, näytetään käyttäjälle oikea otsikko ja valittavat kentät, ja lähetetään POST -kutsut backendille', async ({
  page,
}) => {
  const paatostyyppiInput = page.getByTestId('paatos-paatostyyppi-dropdown');
  const sovellettuLakiSelect = page.getByTestId(
    'paatos-sovellettulaki-dropdown',
  );
  const kelpoisuusSelect = page.getByTestId('kelpoisuus-select');
  const opetettavaAineSelect = page.getByTestId('opetettavaAine-select');
  const muuAmmattiInput = page.getByTestId('muuAmmattikuvaus-input');
  await expect(page.getByTestId('paatos-ratkaisutyyppi')).toHaveText('Päätös');

  await selectOption(page, paatostyyppiInput, '2 Kelpoisuus');

  await expect(kelpoisuusSelect).not.toBeVisible();
  await expect(opetettavaAineSelect).not.toBeVisible();

  await selectOption(page, sovellettuLakiSelect, 'Päätös UO');
  await expect(page.locator('h3').last()).toHaveText('Kelpoisuus 1');
  await expect(kelpoisuusSelect).toBeVisible();
  await expect(opetettavaAineSelect).not.toBeVisible();

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

  await expect(opetettavaAineSelect).toBeVisible();

  await selectOption(page, sovellettuLakiSelect, 'Päätös AP/SEUT');
  await selectOption(page, kelpoisuusSelect, 'Aineenopettaja lukiossa');
  await expect(opetettavaAineSelect).toBeVisible();
  await expect(muuAmmattiInput).not.toBeVisible();

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
              opetettavaAine:
                'Opetusalan ammatit_Aineenopettaja lukiossa_biologia',
            },
          ],
        },
      ],
    },
  );

  await expectDataFromDropdownSelection(
    page,
    page.getByTestId('direktiivitaso-select'),
    'b - 1384/2015 pätevyystaso 2',
    '/paatos/',
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'Kelpoisuus',
          kelpoisuudet: [
            {
              kelpoisuus: 'Opetusalan ammatit_Aineenopettaja lukiossa',
              opetettavaAine:
                'Opetusalan ammatit_Aineenopettaja lukiossa_biologia',
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
    'c - 1384/2015 pätevyystaso 3',
    '/paatos/',
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'Kelpoisuus',
          kelpoisuudet: [
            {
              kelpoisuus: 'Opetusalan ammatit_Aineenopettaja lukiossa',
              opetettavaAine:
                'Opetusalan ammatit_Aineenopettaja lukiossa_biologia',
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

  await selectOption(page, kelpoisuusSelect, 'Muu ammatti');
  await expect(opetettavaAineSelect).not.toBeVisible();
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
    '2 Kelpoisuus',
  );
  await selectOption(
    page,
    page.getByTestId('paatos-sovellettulaki-dropdown'),
    'Päätös AP/SEUT',
  );
  await selectOption(
    page,
    page.getByTestId('kelpoisuus-select'),
    'Aineenopettaja perusopetuksessa',
  );
};

test('Kelpoisuuksien lisääminen ja poistaminen toimivat odotetusti, ja lähettävät POST -kutsut backendille', async ({
  page,
}) => {
  makeInitialKelpoisuusSelections(page);
  await expect(page.locator('h3').last()).toHaveText('Kelpoisuus 1');

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

  page.getByTestId('poista-kelpoisuus-button-1').click();
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

test('Myönteisen päätöksen jatkovalinnat näytetään oikein, ja vastaavat POST -kutsut lähetetään backendille', async ({
  page,
}) => {
  makeInitialKelpoisuusSelections(page);
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
  const ammattikokemusButton = page.getByTestId(
    'ammattikokemusElinikainenOppiminen-ammattikokemus',
  );
  const elinikainenOppiminenButton = page.getByTestId(
    'ammattikokemusElinikainenOppiminen-elinikainenOppiminen',
  );
  const kokemusOppiminenLisatietoInput = page.getByTestId(
    'ammattikokemusElinikainenOppiminen-lisatieto-input',
  );
  const korvaavuusRadiogroup = page.getByTestId(
    'ammattikokemusElinikainenOppiminen-korvaavuus-radio-group',
  );
  await expect(myonteinenPaatosRadiogroup).toBeVisible();
  await expect(olennaisiaErojaRadiogroup).not.toBeVisible();
  await expect(erotKoulutuksessaButton1).not.toBeVisible();
  await expect(erotKoulutuksessaButton2).not.toBeVisible();
  await expect(erotKoulutuksessaButton3).not.toBeVisible();
  await expect(erotKoulutuksessaButton4).not.toBeVisible();
  await expect(muuEroButton).not.toBeVisible();
  await expect(muuEroInput).not.toBeVisible();
  await expect(kelpoisuuskoeButton).not.toBeVisible();
  await expect(sopeutumisaikaButton).not.toBeVisible();
  await expect(aihealue1Button).not.toBeVisible();
  await expect(sopeutumisaikaInput).not.toBeVisible();
  await expect(ammattikokemusButton).not.toBeVisible();
  await expect(elinikainenOppiminenButton).not.toBeVisible();
  await expect(kokemusOppiminenLisatietoInput).not.toBeVisible();
  await expect(korvaavuusRadiogroup).not.toBeVisible();

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
  await expect(ammattikokemusButton).toBeVisible();
  await expect(elinikainenOppiminenButton).toBeVisible();

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

  await muuEroButton.click();
  await expect(muuEroInput).toBeVisible();
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
  await expect(aihealue1Button).not.toBeVisible();
  await expect(sopeutumisaikaInput).not.toBeVisible();
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

  await ammattikokemusButton.click();
  await elinikainenOppiminenButton.click();
  await expect(kokemusOppiminenLisatietoInput).toBeVisible();
  await expect(korvaavuusRadiogroup).toBeVisible();
  await korvaavuusRadiogroup
    .locator('input[type="radio"][value="Taysi"]')
    .click();
  lisavaatimusRequest.ammattikokemusJaElinikainenOppiminen = {
    ammattikokemus: true,
    elinikainenOppiminen: true,
    lisatieto: 'Täsmennä ite',
    korvaavuus: 'Taysi',
  };
  await expectRequestData(
    page,
    '/paatos/',
    kokemusOppiminenLisatietoInput.getByRole('textbox').fill('Täsmennä ite'),
    backendRequestMyonteinenPaatos(lisavaatimusRequest),
  );

  lisavaatimusRequest.ammattikokemusJaElinikainenOppiminen = {
    korvaavuus: 'Osittainen',
  };
  await expectRequestData(
    page,
    '/paatos/',
    korvaavuusRadiogroup
      .locator('input[type="radio"][value="Osittainen"]')
      .click(),
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
    korvaavuus: null,
  };
  await expectRequestData(
    page,
    '/paatos/',
    page
      .getByTestId(
        'ammattikokemusElinikainenOppiminen-korvaavuus-radio-group-clear-button',
      )
      .click(),
    backendRequestMyonteinenPaatos(lisavaatimusRequest),
  );
  await expect(kokemusJaOppiminenKelpoisuuskoeButton).not.toBeVisible();
  await expect(kokemusJaOppiminenSopeutumisaikaButton).not.toBeVisible();
  await expect(kokemusJaOppiminenDualButton).not.toBeVisible();

  await ammattikokemusButton.click();
  await elinikainenOppiminenButton.click();
  await expect(kokemusOppiminenLisatietoInput).not.toBeVisible();
  await expect(korvaavuusRadiogroup).not.toBeVisible();

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

test('Kielteisen päätöksen jatkovalinnat näytetään oikein, ja vastaavat POST -kutsut lähetetään backendille', async ({
  page,
}) => {
  makeInitialKelpoisuusSelections(page);
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
  await expect(epavirallinenKorkeakouluButton).not.toBeVisible();
  await expect(muuPerusteluButton).not.toBeVisible();
  await expect(muuPerusteluInput).not.toBeVisible();

  await expectRequestData(
    page,
    '/paatos/',
    myonteinenPaatosRadiogroup
      .locator('input[type="radio"][value="false"]')
      .click(),
    backendRequestKielteinenPaatos(),
  );
  await expect(olennaisiaErojaRadiogroup).not.toBeVisible();
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
  await expect(olennaisiaErojaRadiogroup).not.toBeVisible();
  await expect(epavirallinenKorkeakouluButton).not.toBeVisible();
  await expect(muuPerusteluButton).not.toBeVisible();
});
