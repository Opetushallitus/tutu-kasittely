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
const OPETETTAVAN_AINEEN_OPINNOT_MATEMATIIKKA =
  'Opetettavan aineen opinnot_matematiikka';
const OHJAUSTEHTAVAN_OPINNOT =
  'Oppilaanohjauksen ja opinto-ohjauksen tehtäviin ammatillisia valmiuksia antavat opinnot';
const ERITYISOPETUKSEN_OPINNOT =
  'Erityisopetuksen tehtäviin ammatillisia valmiuksia antavat opinnot';
const MONIALAISET_OPINNOT = 'Monialaiset opinnot';
const VAKA_VALMIUS_OPINNOT =
  'Varhaiskasvatuksen tehtäviin ja esiopetukseen ammatillisia valmiuksia antavat opinnot';
const MUU_OPINTOSUORITUS =
  'Muu opetustehtävään tai varhaiskasvatuksen tehtävään vaadittava korkeakoulun opintosuoritus';

const AMMATTIKOKEMUS_OSITTAIN_OPTIONS = [
  'SuomessaHankittuOsittain',
  'UlkomaillaHankittuOsittain',
  'SuomessaJaUlkomaillaHankittuOsittain',
] as const;

async function navigateToMyonteinenPaatosUOWithoutSovellettuTilanne(
  page: Page,
): Promise<void> {
  await navigateToSovellettuTilanneOfMyonteinenTutkintoTaiOpinto(
    page,
    PEDAGOGISET_OPINNOT,
  );
}

async function navigateToMyonteinenPaatosUO(page: Page): Promise<void> {
  await navigateToSovellettuTilanneOfMyonteinenTutkintoTaiOpinto(
    page,
    PEDAGOGISET_OPINNOT,
    'pedagogiset1',
  );
}

async function navigateToMyonteinenPaatosUOOpetettavaAine(
  page: Page,
  sovellettuTilanne: string,
): Promise<void> {
  await navigateToSovellettuTilanneOfMyonteinenTutkintoTaiOpinto(
    page,
    OPETETTAVAN_AINEEN_OPINNOT_MATEMATIIKKA,
    sovellettuTilanne,
  );
}

async function navigateToMyonteinenPaatosUOOhjausTehtava(
  page: Page,
): Promise<void> {
  await navigateToSovellettuTilanneOfMyonteinenTutkintoTaiOpinto(
    page,
    OHJAUSTEHTAVAN_OPINNOT,
  );
}

const ERITYISOPETUS_SOVELLETTU_TILANNE_LABELS: Record<string, string> = {
  erityisopetus1:
    'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.erityisopetus 1',
  erityisopetus234:
    'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.erityisopetus 2/3/4',
  erityisopetus0:
    'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.erityisopetus 0',
  muu: 'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.muuErityisopetus',
};

async function navigateToMyonteinenPaatosUOErityisopetus(
  page: Page,
  sovellettuTilanne?: string,
): Promise<void> {
  await navigateToSovellettuTilanneOfMyonteinenTutkintoTaiOpinto(
    page,
    ERITYISOPETUKSEN_OPINNOT,
    sovellettuTilanne,
    {
      sovellettuTilanne: sovellettuTilanne
        ? ERITYISOPETUS_SOVELLETTU_TILANNE_LABELS[sovellettuTilanne]
        : undefined,
    },
  );
}

async function navigateToMyonteinenPaatosUOMonialaiset(
  page: Page,
  sovellettuTilanne?: string,
): Promise<void> {
  await navigateToSovellettuTilanneOfMyonteinenTutkintoTaiOpinto(
    page,
    MONIALAISET_OPINNOT,
    sovellettuTilanne,
    {
      tutkintoTaiOpinto:
        'hakemus.paatos.paatostyyppi.tiettyTutkintoTaiOpinnot.monialaisetOpinnot',
      sovellettuTilanne:
        sovellettuTilanne === 'muu'
          ? 'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.muuMonialaiset'
          : undefined,
    },
  );
}

async function navigateToMyonteinenPaatosUOVaka(
  page: Page,
  sovellettuTilanne?: string,
): Promise<void> {
  await navigateToSovellettuTilanneOfMyonteinenTutkintoTaiOpinto(
    page,
    VAKA_VALMIUS_OPINNOT,
    sovellettuTilanne,
    {
      tutkintoTaiOpinto:
        'hakemus.paatos.paatostyyppi.tiettyTutkintoTaiOpinnot.varhaiskasvatusJaEsiopetusValmiusOpinnot',
      sovellettuTilanne:
        sovellettuTilanne === 'muu'
          ? 'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.muuVaka'
          : undefined,
    },
  );
}

async function navigateToMyonteinenPaatosUOMuu(page: Page): Promise<void> {
  await navigateToSovellettuTilanneOfMyonteinenTutkintoTaiOpinto(
    page,
    MUU_OPINTOSUORITUS,
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
    await navigateToMyonteinenPaatosUOWithoutSovellettuTilanne(page);

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
    await navigateToMyonteinenPaatosUOWithoutSovellettuTilanne(page);

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

test.describe('Opetettavan aineen opinnot: eiKoulutusEroja-ilmoitus', () => {
  for (const sovellettuTilanne of ['aine1', 'aine4']) {
    test(`näytetään sovelletulla tilanteella ${sovellettuTilanne}`, async ({
      page,
    }) => {
      await navigateToMyonteinenPaatosUOOpetettavaAine(page, sovellettuTilanne);

      await expect(
        page.getByText('hakemus.paatos.myonteinenPaatos.uo.eiKoulutusEroja'),
      ).toBeVisible();
      await expect(
        page.getByTestId('uo-ammattikokemuksenHuomioiminen-radio'),
      ).toBeHidden();
    });
  }

  test('ei näytetä muulla sovelletulla tilanteella (aine2)', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUOOpetettavaAine(page, 'aine2');

    await expect(
      page.getByText('hakemus.paatos.myonteinenPaatos.uo.eiKoulutusEroja'),
    ).toBeHidden();
    await expect(
      page.getByTestId('uo-ammattikokemuksenHuomioiminen-radio'),
    ).toBeVisible();
  });
});

test.describe('Opetettavan aineen opinnot: erotKoulutuksessa-tarkennukset', () => {
  test('neljä eroa näytetään', async ({ page }) => {
    await navigateToMyonteinenPaatosUOOpetettavaAine(page, 'aine2');

    for (const eroName of ['ero1', 'ero2', 'ero3', 'ero4']) {
      await expect(
        page.getByTestId(`myonteinenPaatos-uo-erotKoulutuksessa-${eroName}`),
      ).toBeVisible();
    }
  });

  test('eron valinta avaa tarkennusvalintaruudut ja lähettää PUT-kutsun oikealla erot-taulukolla', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUOOpetettavaAine(page, 'aine2');

    const tarkennus1Checkbox = page.getByTestId(
      'erotKoulutuksessa-ero1-tarkennus1',
    );
    const tarkennus2Checkbox = page.getByTestId(
      'erotKoulutuksessa-ero1-tarkennus2',
    );

    await expect(tarkennus1Checkbox).toBeHidden();
    await expect(tarkennus2Checkbox).toBeHidden();

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
                      { name: 'ero3', value: false },
                      { name: 'ero4', value: false },
                    ],
                  },
                },
              },
            ],
          },
        ],
      },
    );

    await expect(tarkennus1Checkbox).toBeVisible();
    await expect(tarkennus2Checkbox).toBeVisible();
  });

  test('tarkennuksen valinta lähettää PUT-kutsun oikealla tarkennustaulukolla', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUOOpetettavaAine(page, 'aine2');

    await expectRequestData(
      page,
      PAATOS_URL,
      page.getByTestId('myonteinenPaatos-uo-erotKoulutuksessa-ero1').click(),
      {},
    );

    await expectRequestData(
      page,
      PAATOS_URL,
      page.getByTestId('erotKoulutuksessa-ero1-tarkennus1').click(),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  erotKoulutuksessa: {
                    eroTarkennukset: {
                      ero1: [
                        { name: 'tarkennus1', value: true },
                        { name: 'tarkennus2', value: false },
                      ],
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

  test('tarkennuksen poistaminen lähettää PUT-kutsun', async ({ page }) => {
    await navigateToMyonteinenPaatosUOOpetettavaAine(page, 'aine2');

    await expectRequestData(
      page,
      PAATOS_URL,
      page.getByTestId('myonteinenPaatos-uo-erotKoulutuksessa-ero1').click(),
      {},
    );

    const tarkennus1Checkbox = page.getByTestId(
      'erotKoulutuksessa-ero1-tarkennus1',
    );

    await expectRequestData(page, PAATOS_URL, tarkennus1Checkbox.click(), {});

    await expectRequestData(page, PAATOS_URL, tarkennus1Checkbox.click(), {
      paatosTiedot: [
        {
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              myonteisenPaatoksenLisavaatimukset: {
                erotKoulutuksessa: {
                  eroTarkennukset: {
                    ero1: [
                      { name: 'tarkennus1', value: false },
                      { name: 'tarkennus2', value: false },
                    ],
                  },
                },
              },
            },
          ],
        },
      ],
    });
  });
});

test.describe('Oppilaan- ja opinto-ohjaustehtävät', () => {
  test('sovellettu tilanne -valintaa ei näytetä, lisavalinnat näytetään suoraan', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUOOhjausTehtava(page);

    await expect(
      page.getByTestId('myonteinenPaatos-uo-sovellettuTilanne-select'),
    ).toBeHidden();
    await expect(
      page.getByTestId('myonteinenPaatos-uo-erotKoulutuksessa-ero1'),
    ).toBeVisible();
  });

  test('Erot koulutuksessa -osiossa näytetään neljä valintaruutua eikä tarkennuksia', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUOOhjausTehtava(page);

    for (const eroName of ['ero1', 'ero2', 'ero3', 'ero4']) {
      await expect(
        page.getByTestId(`myonteinenPaatos-uo-erotKoulutuksessa-${eroName}`),
      ).toBeVisible();
    }

    await page
      .getByTestId('myonteinenPaatos-uo-erotKoulutuksessa-ero1')
      .click();

    await expect(
      page.getByTestId('erotKoulutuksessa-ero1-tarkennus1'),
    ).toHaveCount(0);
  });

  test('Valintaruudun valinta lähettää PUT-kutsun oikealla neljän eron taulukolla', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUOOhjausTehtava(page);

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
                      { name: 'ero3', value: false },
                      { name: 'ero4', value: false },
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
    await navigateToMyonteinenPaatosUOOhjausTehtava(page);

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
                    { name: 'ero3', value: false },
                    { name: 'ero4', value: false },
                  ],
                },
              },
            },
          ],
        },
      ],
    });
  });

  test('Smoke: jaetut lisavalinnat-osiot ovat käytettävissä', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUOOhjausTehtava(page);

    await expect(
      page.getByTestId(
        'lahtokohtaisetOsaamisenTaydentamisenTavat-korvaavaToimenpide-taydentavatOpinnot',
      ),
    ).toBeVisible();

    await expect(
      page
        .getByTestId('uo-ammattikokemuksenHuomioiminen-radio')
        .locator('input[type="radio"]'),
    ).toHaveCount(7);

    await expect(
      page
        .getByTestId('uo-suomessaSuoritettujenOpintojenHuomioiminen-radio')
        .locator('input[type="radio"]'),
    ).toHaveCount(3);

    await page
      .getByTestId('uo-ammattikokemuksenHuomioiminen-radio')
      .locator('input[value="SuomessaHankittuOsittain"]')
      .click();

    await expect(
      page.getByTestId(
        'osaamisenTaydentamisenTavat-korvaavaToimenpide-kelpoisuuskoe',
      ),
    ).toBeVisible();
  });
});

test.describe('Muu opetustehtävään tai varhaiskasvatuksen tehtävään vaadittava korkeakoulun opintosuoritus', () => {
  test('sovellettu tilanne -valintaa ei näytetä, näytetään sen sijaan muu-lisävalinnat', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUOMuu(page);

    await expect(
      page.getByTestId('myonteinenPaatos-uo-sovellettuTilanne-select'),
    ).toBeHidden();
    await expect(
      page.getByTestId('myonteinenPaatos-taydentavatOpinnot'),
    ).toBeVisible();
    await expect(
      page.getByTestId('myonteinenPaatos-kelpoisuuskoe'),
    ).toBeVisible();
    await expect(
      page.getByTestId('myonteinenPaatos-sopeutumisaika'),
    ).toBeVisible();
  });

  test('UO-spesifiset osiot eivät näy', async ({ page }) => {
    await navigateToMyonteinenPaatosUOMuu(page);

    await expect(
      page.getByTestId('myonteinenPaatos-uo-erotKoulutuksessa-ero1'),
    ).toBeHidden();
    await expect(
      page.getByTestId('uo-ammattikokemuksenHuomioiminen-radio'),
    ).toBeHidden();
    await expect(
      page.getByTestId('uo-suomessaSuoritettujenOpintojenHuomioiminen-radio'),
    ).toBeHidden();
    await expect(
      page.getByTestId(
        'lahtokohtaisetOsaamisenTaydentamisenTavat-korvaavaToimenpide-taydentavatOpinnot',
      ),
    ).toBeHidden();
  });

  test('täydentävät opinnot -valintaruudun valinta lähettää PUT-kutsun', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUOMuu(page);

    await expectRequestData(
      page,
      PAATOS_URL,
      page.getByTestId('myonteinenPaatos-taydentavatOpinnot').click(),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  taydentavatOpinnot: true,
                },
              },
            ],
          },
        ],
      },
    );
  });

  test('kelpoisuuskoe-valintaruudun valinta lähettää PUT-kutsun', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUOMuu(page);

    await expectRequestData(
      page,
      PAATOS_URL,
      page.getByTestId('myonteinenPaatos-kelpoisuuskoe').click(),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  kelpoisuuskoe: true,
                },
              },
            ],
          },
        ],
      },
    );
  });

  test('sopeutumisaika-valintaruudun valinta lähettää PUT-kutsun', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUOMuu(page);

    await expectRequestData(
      page,
      PAATOS_URL,
      page.getByTestId('myonteinenPaatos-sopeutumisaika').click(),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  sopeutumisaika: true,
                },
              },
            ],
          },
        ],
      },
    );
  });
});

test.describe('Erityisopetuksen opinnot: sovellettu tilanne', () => {
  test('Sovellettu tilanne -dropdownissa neljä vaihtoehtoa', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUOErityisopetus(page);

    await page
      .getByTestId('myonteinenPaatos-uo-sovellettuTilanne-select')
      .click();
    const options = page.locator(
      'ul[role="listbox"] li[role="option"]:visible',
    );
    await expect(options).toHaveText(
      Object.values(ERITYISOPETUS_SOVELLETTU_TILANNE_LABELS),
    );
  });

  test('erityisopetus0: näytetään eiKoulutusEroja-ilmoitus', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUOErityisopetus(page, 'erityisopetus0');

    await expect(
      page.getByText('hakemus.paatos.myonteinenPaatos.uo.eiKoulutusEroja'),
    ).toBeVisible();
    await expect(
      page.getByTestId('uo-ammattikokemuksenHuomioiminen-radio'),
    ).toBeHidden();
  });

  for (const sovellettuTilanne of ['erityisopetus1', 'erityisopetus234']) {
    test(`${sovellettuTilanne}: polku jatkuu erot koulutuksessa -valinnoilla`, async ({
      page,
    }) => {
      await navigateToMyonteinenPaatosUOErityisopetus(page, sovellettuTilanne);

      await expect(
        page.getByText('hakemus.paatos.myonteinenPaatos.uo.eiKoulutusEroja'),
      ).toBeHidden();
      await expect(
        page.getByTestId('myonteinenPaatos-uo-erotKoulutuksessa-ero1'),
      ).toBeVisible();
      await expect(
        page.getByTestId('uo-ammattikokemuksenHuomioiminen-radio'),
      ).toBeVisible();
      await expect(
        page.getByTestId('uo-suomessaSuoritettujenOpintojenHuomioiminen-radio'),
      ).toBeVisible();
      await expect(
        page.getByTestId('myonteinenPaatos-uo-muuTilannekuvaus-input'),
      ).toBeHidden();
    });
  }

  test('muu: näytetään tilannekuvaus ja tallennetaan se', async ({ page }) => {
    await navigateToMyonteinenPaatosUOErityisopetus(page, 'muu');

    await expect(
      page.getByText(
        'hakemus.paatos.paatostyyppi.kelpoisuus.uo.muu.kuvaile.otsikko',
      ),
    ).toBeVisible();
    for (const key of [
      'hakemus.paatos.paatostyyppi.kelpoisuus.uo.muu.kuvaile.erot',
      'hakemus.paatos.paatostyyppi.kelpoisuus.uo.muu.kuvaile.lahtokohtaisetTaydennysTavat',
      'hakemus.paatos.paatostyyppi.kelpoisuus.uo.muu.kuvaile.ammattikokemuksenHuomioiminen',
      'hakemus.paatos.paatostyyppi.kelpoisuus.uo.muu.kuvaile.suomessaSuoritettujenOpintojenHuomioiminen',
    ]) {
      await expect(page.getByText(key, { exact: true })).toBeVisible();
    }
    await expect(
      page.getByTestId('myonteinenPaatos-uo-erotKoulutuksessa-ero1'),
    ).toBeHidden();
    await expect(
      page.getByTestId('uo-ammattikokemuksenHuomioiminen-radio'),
    ).toBeHidden();

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId('myonteinenPaatos-uo-muuTilannekuvaus-input')
        .getByRole('textbox')
        .first()
        .fill('Tilannekuvaus'),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  sovellettuTilanne: 'muu',
                  muuTilannekuvaus: 'Tilannekuvaus',
                },
              },
            ],
          },
        ],
      },
    );
  });
});

test.describe('Monialaiset opinnot: sovellettu tilanne', () => {
  test('Sovellettu tilanne -dropdownissa viisi vaihtoehtoa', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUOMonialaiset(page);

    await page
      .getByTestId('myonteinenPaatos-uo-sovellettuTilanne-select')
      .click();
    const options = page.locator(
      'ul[role="listbox"] li[role="option"]:visible',
    );
    await expect(options).toHaveText([
      'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.monialaiset 1',
      'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.monialaiset 2',
      'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.monialaiset 3',
      'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.monialaiset 0',
      'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.muuMonialaiset',
    ]);
  });

  test('monialaiset0: näytetään eiKoulutusEroja-ilmoitus', async ({ page }) => {
    await navigateToMyonteinenPaatosUOMonialaiset(page, 'monialaiset0');

    await expect(
      page.getByText('hakemus.paatos.myonteinenPaatos.uo.eiKoulutusEroja'),
    ).toBeVisible();
    await expect(
      page.getByTestId('uo-ammattikokemuksenHuomioiminen-radio'),
    ).toBeHidden();
  });

  for (const sovellettuTilanne of [
    'monialaiset1',
    'monialaiset2',
    'monialaiset3',
  ]) {
    test(`${sovellettuTilanne}: polku jatkuu erot koulutuksessa -valinnoilla`, async ({
      page,
    }) => {
      await navigateToMyonteinenPaatosUOMonialaiset(page, sovellettuTilanne);

      await expect(
        page.getByText('hakemus.paatos.myonteinenPaatos.uo.eiKoulutusEroja'),
      ).toBeHidden();
      await expect(
        page.getByTestId('myonteinenPaatos-uo-erotKoulutuksessa-ero1'),
      ).toBeVisible();
      await expect(
        page.getByTestId('uo-ammattikokemuksenHuomioiminen-radio'),
      ).toBeVisible();
      await expect(
        page.getByTestId('uo-suomessaSuoritettujenOpintojenHuomioiminen-radio'),
      ).toBeVisible();
      await expect(
        page.getByTestId('myonteinenPaatos-uo-muuTilannekuvaus-input'),
      ).toBeHidden();
    });
  }

  test('muu: näytetään tilannekuvaus ja tallennetaan se', async ({ page }) => {
    await navigateToMyonteinenPaatosUOMonialaiset(page, 'muu');

    await expect(
      page.getByText(
        'hakemus.paatos.paatostyyppi.kelpoisuus.uo.muu.kuvaile.otsikko',
      ),
    ).toBeVisible();
    for (const key of [
      'erot',
      'lahtokohtaisetTaydennysTavat',
      'opintojenHuomioiminen',
      'taydennysTavatPaatokseen',
    ]) {
      await expect(
        page.getByText(
          `hakemus.paatos.paatostyyppi.kelpoisuus.uo.muu.kuvaile.${key}`,
        ),
      ).toBeVisible();
    }
    await expect(
      page.getByTestId('myonteinenPaatos-uo-erotKoulutuksessa-ero1'),
    ).toBeHidden();
    await expect(
      page.getByTestId('uo-ammattikokemuksenHuomioiminen-radio'),
    ).toBeHidden();

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId('myonteinenPaatos-uo-muuTilannekuvaus-input')
        .getByRole('textbox')
        .first()
        .fill('Tilannekuvaus'),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  sovellettuTilanne: 'muu',
                  muuTilannekuvaus: 'Tilannekuvaus',
                },
              },
            ],
          },
        ],
      },
    );
  });
});

test.describe('Vaka- ja esiopetuksen valmiusopinnot: sovellettu tilanne', () => {
  test('Sovellettu tilanne -dropdownissa viisi vaihtoehtoa', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUOVaka(page);

    await page
      .getByTestId('myonteinenPaatos-uo-sovellettuTilanne-select')
      .click();
    const options = page.locator(
      'ul[role="listbox"] li[role="option"]:visible',
    );
    await expect(options).toHaveText([
      'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.vaka 1',
      'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.vaka 2',
      'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.vaka 3',
      'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.vaka 0',
      'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.muuVaka',
    ]);
  });

  test('vaka0: näytetään eiKoulutusEroja-ilmoitus', async ({ page }) => {
    await navigateToMyonteinenPaatosUOVaka(page, 'vaka0');

    await expect(
      page.getByText('hakemus.paatos.myonteinenPaatos.uo.eiKoulutusEroja'),
    ).toBeVisible();
    await expect(
      page.getByTestId('uo-ammattikokemuksenHuomioiminen-radio'),
    ).toBeHidden();
  });

  test('muu: näytetään tilannekuvaus ja tallennetaan se', async ({ page }) => {
    await navigateToMyonteinenPaatosUOVaka(page, 'muu');

    await expect(
      page.getByText(
        'hakemus.paatos.paatostyyppi.kelpoisuus.uo.muu.kuvaile.otsikko',
      ),
    ).toBeVisible();
    await expect(
      page.getByTestId('myonteinenPaatos-uo-erotKoulutuksessa-ero1'),
    ).toBeHidden();
    await expect(
      page.getByTestId('uo-ammattikokemuksenHuomioiminen-radio'),
    ).toBeHidden();

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId('myonteinenPaatos-uo-muuTilannekuvaus-input')
        .getByRole('textbox')
        .first()
        .fill('Tilannekuvaus'),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  sovellettuTilanne: 'muu',
                  muuTilannekuvaus: 'Tilannekuvaus',
                },
              },
            ],
          },
        ],
      },
    );
  });
});

test.describe('Vaka- ja esiopetuksen valmiusopinnot: täydentävien opintojen aiheet', () => {
  const AIHEET = [
    'kielikasvatus',
    'matematiikka',
    'alle3VuotiaidenKasvatus',
    'ilmaisuJaTaidekasvatus',
    'ymparistokasvatus',
    'esiJaAlkuopetus',
    'katsomusJaEettinenKasvatus',
    'teknologiakasvatus',
  ];

  test('lähtökohtaiset: aiheet näytetään vasta täydentävät opinnot -valinnan jälkeen ja tallennetaan', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUOVaka(page, 'vaka1');

    const prefix = 'lahtokohtaisetOsaamisenTaydentamisenTavat';
    await expect(
      page.getByTestId(`${prefix}-taydentavienOpintojenAiheet-kielikasvatus`),
    ).toBeHidden();

    await page
      .getByTestId(`${prefix}-korvaavaToimenpide-taydentavatOpinnot`)
      .click();

    await expect(
      page.getByText(
        'hakemus.paatos.myonteinenPaatos.taydentavienOpintojenAiheet.otsikko',
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        'hakemus.paatos.myonteinenPaatos.taydentavienOpintojenAiheet.info',
      ),
    ).toBeVisible();
    for (const aihe of AIHEET) {
      await expect(
        page.getByTestId(`${prefix}-taydentavienOpintojenAiheet-${aihe}`),
      ).toBeVisible();
    }

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(`${prefix}-taydentavienOpintojenAiheet-kielikasvatus`)
        .click(),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  lahtokohtaisetOsaamisenTaydentamisenTavat: {
                    taydentavatOpinnot: true,
                    taydentavienOpintojenAiheet: { kielikasvatus: true },
                  },
                },
              },
            ],
          },
        ],
      },
    );
  });

  test('lähtökohtaiset: täydentävät opinnot -valinnan poisto tyhjentää aiheet', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUOVaka(page, 'vaka1');

    const prefix = 'lahtokohtaisetOsaamisenTaydentamisenTavat';
    const taydentavatOpinnot = page.getByTestId(
      `${prefix}-korvaavaToimenpide-taydentavatOpinnot`,
    );
    await taydentavatOpinnot.click();
    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(`${prefix}-taydentavienOpintojenAiheet-matematiikka`)
        .click(),
      {},
    );

    await expectRequestData(page, PAATOS_URL, taydentavatOpinnot.click(), {
      paatosTiedot: [
        {
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              myonteisenPaatoksenLisavaatimukset: {
                lahtokohtaisetOsaamisenTaydentamisenTavat: {
                  taydentavatOpinnot: false,
                  taydentavienOpintojenAiheet: null,
                },
              },
            },
          ],
        },
      ],
    });
    await expect(
      page.getByTestId(`${prefix}-taydentavienOpintojenAiheet-matematiikka`),
    ).toBeHidden();
  });

  test('osaamisen täydentämisen tavat: aiheet näytetään täydentävät opinnot -valinnan jälkeen', async ({
    page,
  }) => {
    await navigateToMyonteinenPaatosUOVaka(page, 'vaka1');

    await page
      .getByTestId('uo-ammattikokemuksenHuomioiminen-radio')
      .locator('input[value="SuomessaHankittuOsittain"]')
      .click();

    const prefix = 'osaamisenTaydentamisenTavat';
    await page
      .getByTestId(`${prefix}-korvaavaToimenpide-taydentavatOpinnot`)
      .click();

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(`${prefix}-taydentavienOpintojenAiheet-teknologiakasvatus`)
        .click(),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  korvaavaToimenpide: {
                    taydentavatOpinnot: true,
                    taydentavienOpintojenAiheet: { teknologiakasvatus: true },
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
