import { expect, Page, test } from '@playwright/test';

import {
  expectDataFromDropdownSelection,
  expectRequestData,
  navigateToSovellettuTilanneOfMyonteinenTutkintoTaiOpinto,
} from '@/playwright/helpers/testUtils';
import { mockAll, mockPaatos } from '@/playwright/mocks';

const PAGE_URL =
  '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/paatostiedot';
const PAATOS_URL = '/paatos/';
const PEDAGOGISET_OPINNOT = 'Opettajan pedagogiset opinnot';

const AMMATTIKOKEMUS_OSITTAIN_OPTIONS = [
  'SuomessaHankittuOsittain',
  'UlkomaillaHankittuOsittain',
  'SuomessaJaUlkomaillaHankittuOsittain',
] as const;

async function navigateToMyonteinenPaatosUO(page: Page): Promise<void> {
  await navigateToSovellettuTilanneOfMyonteinenTutkintoTaiOpinto(
    page,
    PEDAGOGISET_OPINNOT,
  );
}

test.beforeEach(async ({ page }) => {
  await mockAll({ page });
  await mockPaatos(page);
  await page.goto(PAGE_URL);
});

test.describe('Sovellettu tilanne', () => {
  test('Sovellettu tilanne -dropdownissa kolme pedagogiset-vaihtoehtoa', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUO(page);

    await page
      .getByTestId('myonteinenPaatos-uo-sovellettuTilanne-select')
      .click();
    await expect(
      page.locator('ul[role="listbox"] li[role="option"]:visible'),
    ).toHaveCount(3);
  });

  test('Sovellettu tilanne -valinta lähettää PUT-kutsun oikeilla tiedoilla', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUO(page);

    await expectDataFromDropdownSelection(
      page,
      page.getByTestId('myonteinenPaatos-uo-sovellettuTilanne-select'),
      'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.pedagogiset 1',
      PAATOS_URL,
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  sovellettuTilanne: 'pedagogiset1',
                },
              },
            ],
          },
        ],
      },
    );
  });
});

test.describe('Erot koulutuksessa', () => {
  test('Erot koulutuksessa -osiossa näytetään kaksi valintaruutua', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUO(page);

    await expect(
      page.getByTestId('myonteinenPaatos-uo-erotKoulutuksessa-ero1'),
    ).toBeVisible();
    await expect(
      page.getByTestId('myonteinenPaatos-uo-erotKoulutuksessa-ero2'),
    ).toBeVisible();
  });

  test('Valintaruudun valinta lähettää PUT-kutsun oikealla erot-taulukolla', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUO(page);

    await expectRequestData(
      page,
      PAATOS_URL,
      page.getByTestId('myonteinenPaatos-uo-erotKoulutuksessa-ero1').click(),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  erotKoulutuksessa: {
                    erot: [
                      { name: 'ero1', value: true },
                      { name: 'ero2', value: false },
                    ],
                  },
                },
              },
            ],
          },
        ],
      },
    );
  });

  test('Valintaruudun poistaminen lähettää PUT-kutsun', async ({ page }) => {
    await navigateToMyonteinenPaatosUO(page);

    const ero1Checkbox = page.getByTestId(
      'myonteinenPaatos-uo-erotKoulutuksessa-ero1',
    );

    await expectRequestData(page, PAATOS_URL, ero1Checkbox.click(), {});

    await expectRequestData(page, PAATOS_URL, ero1Checkbox.click(), {
      paatosTiedot: [
        {
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              myonteisenPaatoksenLisavaatimukset: {
                erotKoulutuksessa: {
                  erot: [
                    { name: 'ero1', value: false },
                    { name: 'ero2', value: false },
                  ],
                },
              },
            },
          ],
        },
      ],
    });
  });
});

test.describe('Lähtökohtaiset osaamisen täydentämisen tavat', () => {
  test('osio näytetään aina', async ({ page }) => {
    await navigateToMyonteinenPaatosUO(page);

    await expect(
      page.getByTestId(
        'lahtokohtaisetOsaamisenTaydentamisenTavat-korvaavaToimenpide-taydentavatOpinnot',
      ),
    ).toBeVisible();
    await expect(
      page.getByTestId(
        'lahtokohtaisetOsaamisenTaydentamisenTavat-korvaavaToimenpide-kelpoisuuskoe',
      ),
    ).toBeVisible();
    await expect(
      page.getByTestId(
        'lahtokohtaisetOsaamisenTaydentamisenTavat-korvaavaToimenpide-sopeutumisaika',
      ),
    ).toBeVisible();
  });

  test('täydentävät opinnot -valintaruudun valinta lähettää PUT-kutsun', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUO(page);

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(
          'lahtokohtaisetOsaamisenTaydentamisenTavat-korvaavaToimenpide-taydentavatOpinnot',
        )
        .click(),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  lahtokohtaisetOsaamisenTaydentamisenTavat: {
                    taydentavatOpinnot: true,
                  },
                },
              },
            ],
          },
        ],
      },
    );
  });

  test('täydentävät opinnot -valintaruudun poistaminen lähettää PUT-kutsun', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUO(page);

    const taydentavatOpinnotCheckbox = page.getByTestId(
      'lahtokohtaisetOsaamisenTaydentamisenTavat-korvaavaToimenpide-taydentavatOpinnot',
    );

    await expectRequestData(
      page,
      PAATOS_URL,
      taydentavatOpinnotCheckbox.click(),
      {},
    );

    await expectRequestData(
      page,
      PAATOS_URL,
      taydentavatOpinnotCheckbox.click(),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  lahtokohtaisetOsaamisenTaydentamisenTavat: {
                    taydentavatOpinnot: false,
                  },
                },
              },
            ],
          },
        ],
      },
    );
  });

  test('kelpoisuuskoe-valintaruudun valinta avaa sisältövalinnat ja lähettää PUT-kutsun', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUO(page);

    const kelpoisuuskoeCheckbox = page.getByTestId(
      'lahtokohtaisetOsaamisenTaydentamisenTavat-korvaavaToimenpide-kelpoisuuskoe',
    );
    const aihealue1Checkbox = page.getByTestId(
      'lahtokohtaisetOsaamisenTaydentamisenTavat-singleChoice-kelpoisuuskoe-sisalto-aihealue1',
    );

    await expect(aihealue1Checkbox).toBeHidden();

    await expectRequestData(page, PAATOS_URL, kelpoisuuskoeCheckbox.click(), {
      paatosTiedot: [
        {
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              myonteisenPaatoksenLisavaatimukset: {
                lahtokohtaisetOsaamisenTaydentamisenTavat: {
                  kelpoisuuskoe: true,
                },
              },
            },
          ],
        },
      ],
    });

    await expect(aihealue1Checkbox).toBeVisible();
  });

  test('kelpoisuuskoe-valintaruudun poistaminen lähettää PUT-kutsun', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUO(page);

    const kelpoisuuskoeCheckbox = page.getByTestId(
      'lahtokohtaisetOsaamisenTaydentamisenTavat-korvaavaToimenpide-kelpoisuuskoe',
    );

    await expectRequestData(
      page,
      PAATOS_URL,
      kelpoisuuskoeCheckbox.click(),
      {},
    );

    await expectRequestData(page, PAATOS_URL, kelpoisuuskoeCheckbox.click(), {
      paatosTiedot: [
        {
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              myonteisenPaatoksenLisavaatimukset: {
                lahtokohtaisetOsaamisenTaydentamisenTavat: {
                  kelpoisuuskoe: false,
                },
              },
            },
          ],
        },
      ],
    });

    await expect(
      page.getByTestId(
        'lahtokohtaisetOsaamisenTaydentamisenTavat-singleChoice-kelpoisuuskoe-sisalto-aihealue1',
      ),
    ).toBeHidden();
  });

  test('kelpoisuuskoe-sisällön aihealueen valinta lähettää PUT-kutsun', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUO(page);

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(
          'lahtokohtaisetOsaamisenTaydentamisenTavat-korvaavaToimenpide-kelpoisuuskoe',
        )
        .click(),
      {},
    );

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(
          'lahtokohtaisetOsaamisenTaydentamisenTavat-singleChoice-kelpoisuuskoe-sisalto-aihealue1',
        )
        .click(),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  lahtokohtaisetOsaamisenTaydentamisenTavat: {
                    kelpoisuuskoe: true,
                    kelpoisuuskoeSisalto: {
                      aihealue1: true,
                    },
                  },
                },
              },
            ],
          },
        ],
      },
    );
  });

  test('sopeutumisaika-valintaruudun valinta avaa kesto-kentän ja lähettää PUT-kutsun', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUO(page);

    const sopeutumisaikaCheckbox = page.getByTestId(
      'lahtokohtaisetOsaamisenTaydentamisenTavat-korvaavaToimenpide-sopeutumisaika',
    );
    const sopeutumisaikaInput = page.getByTestId(
      'lahtokohtaisetOsaamisenTaydentamisenTavat-singleChoice-korvaavaToimenpide-sopeutumisaika-input',
    );

    await expect(sopeutumisaikaInput).toBeHidden();

    await expectRequestData(page, PAATOS_URL, sopeutumisaikaCheckbox.click(), {
      paatosTiedot: [
        {
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              myonteisenPaatoksenLisavaatimukset: {
                lahtokohtaisetOsaamisenTaydentamisenTavat: {
                  sopeutumisaika: true,
                },
              },
            },
          ],
        },
      ],
    });

    await expect(sopeutumisaikaInput).toBeVisible();
  });

  test('sopeutumisaika-kestokenttään syötetty arvo lähettää PUT-kutsun', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUO(page);

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(
          'lahtokohtaisetOsaamisenTaydentamisenTavat-korvaavaToimenpide-sopeutumisaika',
        )
        .click(),
      {},
    );

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(
          'lahtokohtaisetOsaamisenTaydentamisenTavat-singleChoice-korvaavaToimenpide-sopeutumisaika-input',
        )
        .getByRole('textbox')
        .fill('3'),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  lahtokohtaisetOsaamisenTaydentamisenTavat: {
                    sopeutumisaika: true,
                    sopeutumiusaikaKestoKk: '3',
                  },
                },
              },
            ],
          },
        ],
      },
    );
  });
});

test.describe('Ammattikokemuksen huomioiminen', () => {
  test('radioryhmässä on seitsemän vaihtoehtoa', async ({ page }) => {
    await navigateToMyonteinenPaatosUO(page);

    await expect(
      page
        .getByTestId('uo-ammattikokemuksenHuomioiminen-radio')
        .locator('input[type="radio"]'),
    ).toHaveCount(7);
  });

  test('valinta lähettää PUT-kutsun oikeilla tiedoilla', async ({ page }) => {
    await navigateToMyonteinenPaatosUO(page);

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId('uo-ammattikokemuksenHuomioiminen-radio')
        .locator('input[value="SuomessaHankittuKokonaan"]')
        .click(),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  ammattikokemuksenHuomioiminen: 'SuomessaHankittuKokonaan',
                },
              },
            ],
          },
        ],
      },
    );
  });
});

test.describe('Suomessa suoritettujen opintojen huomioiminen', () => {
  test('valinta lähettää PUT-kutsun', async ({ page }) => {
    await navigateToMyonteinenPaatosUO(page);

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId('uo-suomessaSuoritettujenOpintojenHuomioiminen-radio')
        .locator('input[value="KorvaavatKokonaan"]')
        .click(),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  suomessaSuoritettujenOpintojenHuomioiminen:
                    'KorvaavatKokonaan',
                },
              },
            ],
          },
        ],
      },
    );
  });
});

test.describe('Osaamisen täydentämisen tavat -osion näkyvyys', () => {
  for (const option of AMMATTIKOKEMUS_OSITTAIN_OPTIONS) {
    test(`näytetään osittaisella ammattikokemuksella (${option})`, async ({
      page,
    }) => {
      await navigateToMyonteinenPaatosUO(page);

      await page
        .getByTestId('uo-ammattikokemuksenHuomioiminen-radio')
        .locator(`input[value="${option}"]`)
        .click();

      await expect(
        page.getByTestId(
          'osaamisenTaydentamisenTavat-korvaavaToimenpide-kelpoisuuskoe',
        ),
      ).toBeVisible();
    });
  }

  test('näytetään KorvaavatOsittain-suomiOpinnoilla', async ({ page }) => {
    await navigateToMyonteinenPaatosUO(page);

    await page
      .getByTestId('uo-suomessaSuoritettujenOpintojenHuomioiminen-radio')
      .locator('input[value="KorvaavatOsittain"]')
      .click();

    await expect(
      page.getByTestId(
        'osaamisenTaydentamisenTavat-korvaavaToimenpide-kelpoisuuskoe',
      ),
    ).toBeVisible();
  });

  test('ei näytetä täydellä ammattikokemuksella (kumoaa osittaisen)', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUO(page);

    await page
      .getByTestId('uo-suomessaSuoritettujenOpintojenHuomioiminen-radio')
      .locator('input[value="KorvaavatOsittain"]')
      .click();

    await page
      .getByTestId('uo-ammattikokemuksenHuomioiminen-radio')
      .locator('input[value="SuomessaHankittuKokonaan"]')
      .click();

    await expect(
      page.getByTestId(
        'osaamisenTaydentamisenTavat-korvaavaToimenpide-kelpoisuuskoe',
      ),
    ).toBeHidden();
  });

  test('ei näytetä KorvaavatKokonaan-suomiOpinnoilla (kumoaa osittaisen)', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUO(page);

    await page
      .getByTestId('uo-ammattikokemuksenHuomioiminen-radio')
      .locator('input[value="SuomessaHankittuOsittain"]')
      .click();

    await page
      .getByTestId('uo-suomessaSuoritettujenOpintojenHuomioiminen-radio')
      .locator('input[value="KorvaavatKokonaan"]')
      .click();

    await expect(
      page.getByTestId(
        'osaamisenTaydentamisenTavat-korvaavaToimenpide-kelpoisuuskoe',
      ),
    ).toBeHidden();
  });

  test('Smoke: näkyvän osion täydentävät opinnot -valintaruudun valinta lähettää PUT-kutsun', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUO(page);

    await page
      .getByTestId('uo-ammattikokemuksenHuomioiminen-radio')
      .locator('input[value="SuomessaHankittuOsittain"]')
      .click();

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(
          'osaamisenTaydentamisenTavat-korvaavaToimenpide-taydentavatOpinnot',
        )
        .click(),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  korvaavaToimenpide: {
                    taydentavatOpinnot: true,
                  },
                },
              },
            ],
          },
        ],
      },
    );
  });
});

test.describe('Info-ilmoitus', () => {
  test('näytetään kun molemmat ovat EiHuomioida', async ({ page }) => {
    await navigateToMyonteinenPaatosUO(page);

    await page
      .getByTestId('uo-ammattikokemuksenHuomioiminen-radio')
      .locator('input[value="EiHuomioida"]')
      .click();

    await page
      .getByTestId('uo-suomessaSuoritettujenOpintojenHuomioiminen-radio')
      .locator('input[value="EiHuomioida"]')
      .click();

    await expect(
      page.getByText(
        'hakemus.paatos.myonteinenPaatos.uo.kaytetaanLahtokohtaisiaOsaamisenTaydentamisenTapoja',
      ),
    ).toBeVisible();
  });

  test('ei näytetä kun vain toinen on EiHuomioida', async ({ page }) => {
    await navigateToMyonteinenPaatosUO(page);

    await page
      .getByTestId('uo-ammattikokemuksenHuomioiminen-radio')
      .locator('input[value="EiHuomioida"]')
      .click();

    await expect(
      page.getByText(
        'hakemus.paatos.myonteinenPaatos.uo.kaytetaanLahtokohtaisiaOsaamisenTaydentamisenTapoja',
      ),
    ).toBeHidden();
  });
});
