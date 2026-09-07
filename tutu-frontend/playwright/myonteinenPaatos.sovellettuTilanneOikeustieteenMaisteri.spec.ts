import { expect, Page, test } from '@playwright/test';

import {
  expectHiddenOrDetached,
  expectRequestData,
  navigateToSovellettuTilanneOfMyonteinenTutkintoTaiOpinto,
} from '@/playwright/helpers/testUtils';
import { mockAll, mockPaatos } from '@/playwright/mocks';

const PAGE_URL =
  '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/paatostiedot';
const OIKEUSTIETEEN_MAISTERI_OPTION =
  'Rinnastaminen oikeustieteen maisterin tutkintoon';
const PAATOS_URL = '/paatos/';

const AIHEALUEET = [
  'velvoiteOikeus',
  'esineOikeus',
  'perheJaJaamistooikeus',
  'rikosoikeus',
  'prosessiOikeus',
  'valtioSaantooikeus',
  'hallintoOikeus',
] as const;

async function navigateToSovellettuTilanne(
  page: Page,
  sovellettuTilanne: string,
): Promise<void> {
  await navigateToSovellettuTilanneOfMyonteinenTutkintoTaiOpinto(
    page,
    OIKEUSTIETEEN_MAISTERI_OPTION,
    sovellettuTilanne,
  );
}

test.beforeEach(async ({ page }) => {
  await mockAll({ page });
  await mockPaatos(page);
  await page.goto(PAGE_URL);
});

test.describe('Muu sovellettu tilanne', () => {
  test('näyttää vain tekstialueen ja piilottaa lomakekentät', async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, 'muu');

    await expect(
      page.getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-muuSovellettuTilanneLisatieto',
      ),
    ).toBeVisible();
    await expectHiddenOrDetached(
      page.getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-tallinnaOpinnot',
      ),
    );
    await expectHiddenOrDetached(
      page.getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnotSisallossa',
      ),
    );
    await expectHiddenOrDetached(
      page.getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-eurooppaOpinnotSisallossa',
      ),
    );
  });

  test('tekstialueen muutos lähettää PUT-kutsun backendille', async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, 'muu');

    const textInput = page.getByTestId(
      'sovellettuTilanne-oikeustieteenMaisteri-muuSovellettuTilanneLisatieto',
    );

    await expectRequestData(
      page,
      PAATOS_URL,
      textInput.getByRole('textbox').fill('Lisätieto muusta tilanteesta'),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  sovellettuTilanne: 'muu',
                  oikeustieteenMaisteriLisavaatimukset: {
                    muuSovellettuTilanneLisatieto:
                      'Lisätieto muusta tilanteesta',
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

test.describe('Tilannekohtainen osioiden näkyvyys', () => {
  test("Tilanteet '1', '1a', '1b': Tallinna- ja Suomi-opinnot näkyvissä, Eurooppa-opinnot piilossa", async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, '1');

    await expect(
      page.getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-tallinnaOpinnot',
      ),
    ).toBeVisible();
    await expect(
      page.getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnotSisallossa',
      ),
    ).toBeVisible();
    await expectHiddenOrDetached(
      page.getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-eurooppaOpinnotSisallossa',
      ),
    );
  });

  test("Tilanteet '2', '2a': Tallinna-, Eurooppa- ja Suomi-opinnot kaikki näkyvissä", async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, '2');

    await expect(
      page.getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-tallinnaOpinnot',
      ),
    ).toBeVisible();
    await expect(
      page.getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-eurooppaOpinnotSisallossa',
      ),
    ).toBeVisible();
    await expect(
      page.getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnotSisallossa',
      ),
    ).toBeVisible();
  });

  test("Tilanteet '3', '4', '4a': vain Suomi-opinnot näkyvissä", async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, '3');

    await expectHiddenOrDetached(
      page.getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-tallinnaOpinnot',
      ),
    );
    await expectHiddenOrDetached(
      page.getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-eurooppaOpinnotSisallossa',
      ),
    );
    await expect(
      page.getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnotSisallossa',
      ),
    ).toBeVisible();
  });

  test('Täyttöohje ja huomautus näytetään muille kuin muu-tilanteelle', async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, '1');

    await expect(
      page.getByText(
        'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.tayttoOhje',
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.vahimmaismaaraHuomautus',
      ),
    ).toBeVisible();
  });
});

test.describe('OpintopisteTaulukko', () => {
  test("Tilanne '1': taulukossa kaksi riviä (ei eurooppaopintojen riviä)", async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, '1');

    const tableBody = page.getByRole('table').locator('tbody');
    await expect(tableBody.getByRole('row')).toHaveCount(2);
  });

  test("Tilanne '2': taulukossa kolme riviä, eurooppaopintojen rivi mukana", async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, '2');

    const tableBody = page.getByRole('table').locator('tbody');
    await expect(tableBody.getByRole('row')).toHaveCount(3);
  });

  test("Tilanne '3': taulukossa kaksi riviä (ei eurooppaopintojen riviä)", async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, '3');

    const tableBody = page.getByRole('table').locator('tbody');
    await expect(tableBody.getByRole('row')).toHaveCount(2);
  });

  test('Taulukon lukumäärät täsmäävät', async ({ page }) => {
    await navigateToSovellettuTilanne(page, '2');

    await page
      .getByTestId('sovellettuTilanne-oikeustieteenMaisteri-tallinnaOpinnot')
      .click();
    await page
      .getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-eurooppaOpinnotKokonaismaarassa',
      )
      .click();
    await page
      .getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-eurooppaOpintojenLaajuus',
      )
      .locator('input')
      .fill('15');
    await page
      .getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnotLaajuudessa',
      )
      .click();
    await page
      .getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-suomiOpintojenLaajuus',
      )
      .locator('input')
      .fill('20');

    const kokonaislaajuusSolut = page
      .getByTestId('opintopiste-taulukko-rivi-kokonaislaajuus')
      .getByRole('cell');
    await expect(kokonaislaajuusSolut.nth(2)).toHaveText('45 op');
    await expect(kokonaislaajuusSolut.nth(3)).toHaveText('20 op');

    const perusjaainetasoisetSolut = page
      .getByTestId('opintopiste-taulukko-rivi-perusjaainetasoiset')
      .getByRole('cell');
    await expect(perusjaainetasoisetSolut.nth(2)).toHaveText('30 op');
    await expect(perusjaainetasoisetSolut.nth(3)).toHaveText('10 op');

    const eurooppaOpintojenSolut = page
      .getByTestId('opintopiste-taulukko-rivi-eurooppaOpinnot')
      .getByRole('cell');
    await expect(eurooppaOpintojenSolut.nth(2)).toHaveText('15 op');
    await expect(eurooppaOpintojenSolut.nth(3)).toHaveText('0 op');
  });
});

test.describe('Tallinna-opinnot', () => {
  test('Valintaruudun valinta avaa laajuuskentän ja lähettää PUT-kutsun oletuslaajuudella 10', async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, '1');

    const tallinnaCheckbox = page.getByTestId(
      'sovellettuTilanne-oikeustieteenMaisteri-tallinnaOpinnot',
    );
    const tallinnaLaajuusInput = page.getByTestId(
      'sovellettuTilanne-oikeustieteenMaisteri-tallinnaOpinnot-laajuus',
    );

    await expectHiddenOrDetached(tallinnaLaajuusInput);

    await expectRequestData(page, PAATOS_URL, tallinnaCheckbox.click(), {
      paatosTiedot: [
        {
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              myonteisenPaatoksenLisavaatimukset: {
                oikeustieteenMaisteriLisavaatimukset: {
                  tallinnassaSuoritettujaOpintoja: true,
                  tallinnaOpintojenLaajuus: 10,
                },
              },
            },
          ],
        },
      ],
    });

    await expect(tallinnaLaajuusInput).toBeVisible();
  });

  test('Valintaruudun poistaminen lähettää PUT-kutsun ilman laajuutta', async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, '1');

    const tallinnaCheckbox = page.getByTestId(
      'sovellettuTilanne-oikeustieteenMaisteri-tallinnaOpinnot',
    );

    await expectRequestData(page, PAATOS_URL, tallinnaCheckbox.click(), {
      paatosTiedot: [
        {
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              myonteisenPaatoksenLisavaatimukset: {
                oikeustieteenMaisteriLisavaatimukset: {
                  tallinnassaSuoritettujaOpintoja: true,
                },
              },
            },
          ],
        },
      ],
    });

    await expectRequestData(page, PAATOS_URL, tallinnaCheckbox.click(), {
      paatosTiedot: [
        {
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              myonteisenPaatoksenLisavaatimukset: {
                oikeustieteenMaisteriLisavaatimukset: {
                  tallinnassaSuoritettujaOpintoja: false,
                },
              },
            },
          ],
        },
      ],
    });

    await expectHiddenOrDetached(
      page.getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-tallinnaOpinnot-laajuus',
      ),
    );
  });

  test('Laajuuskentän kokonaislukuvalidointi: virheellinen arvo ei lähetä kutsua, kelvollinen arvo lähettää', async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, '1');

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId('sovellettuTilanne-oikeustieteenMaisteri-tallinnaOpinnot')
        .click(),
      {},
    );

    const inputField = page
      .getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-tallinnaOpinnot-laajuus',
      )
      .locator('input');

    await inputField.fill('abc');
    await expect(page.getByTestId('save-ribbon-button')).toBeHidden();

    await expectRequestData(page, PAATOS_URL, inputField.fill('25'), {
      paatosTiedot: [
        {
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              myonteisenPaatoksenLisavaatimukset: {
                oikeustieteenMaisteriLisavaatimukset: {
                  tallinnassaSuoritettujaOpintoja: true,
                  tallinnaOpintojenLaajuus: 25,
                },
              },
            },
          ],
        },
      ],
    });
  });
});

test.describe('Eurooppa-opinnot (tilanne 2)', () => {
  test('Sisällössä-valintaruutu avaa lisätietokentän ja lähettää PUT-kutsun', async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, '2');

    const eurooppaSisallossaCheckbox = page.getByTestId(
      'sovellettuTilanne-oikeustieteenMaisteri-eurooppaOpinnotSisallossa',
    );
    const eurooppaLisatietoTextarea = page.getByTestId(
      'sovellettuTilanne-oikeustieteenMaisteri-eurooppaOpintojenSisallonLisatieto',
    );

    await expectHiddenOrDetached(eurooppaLisatietoTextarea);

    await expectRequestData(
      page,
      PAATOS_URL,
      eurooppaSisallossaCheckbox.click(),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  oikeustieteenMaisteriLisavaatimukset: {
                    eurooppaOpintojaSisallossa: true,
                  },
                },
              },
            ],
          },
        ],
      },
    );

    await expect(eurooppaLisatietoTextarea).toBeVisible();
  });

  test('Lisätietokentän täyttö lähettää PUT-kutsun', async ({ page }) => {
    await navigateToSovellettuTilanne(page, '2');

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(
          'sovellettuTilanne-oikeustieteenMaisteri-eurooppaOpinnotSisallossa',
        )
        .click(),
      {},
    );

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(
          'sovellettuTilanne-oikeustieteenMaisteri-eurooppaOpintojenSisallonLisatieto',
        )
        .getByRole('textbox')
        .fill('Eurooppa-opintojen kuvaus'),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  oikeustieteenMaisteriLisavaatimukset: {
                    eurooppaOpintojaSisallossa: true,
                    eurooppaOpintojenSisallonLisatieto:
                      'Eurooppa-opintojen kuvaus',
                  },
                },
              },
            ],
          },
        ],
      },
    );
  });

  test('Kokonaismäärässä-valintaruutu avaa laajuuskentän ja lähettää PUT-kutsun', async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, '2');

    const eurooppaKokonaismaarassaCheckbox = page.getByTestId(
      'sovellettuTilanne-oikeustieteenMaisteri-eurooppaOpinnotKokonaismaarassa',
    );
    const eurooppaLaajuusInput = page.getByTestId(
      'sovellettuTilanne-oikeustieteenMaisteri-eurooppaOpintojenLaajuus',
    );

    await expectHiddenOrDetached(eurooppaLaajuusInput);

    await expectRequestData(
      page,
      PAATOS_URL,
      eurooppaKokonaismaarassaCheckbox.click(),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  oikeustieteenMaisteriLisavaatimukset: {
                    eurooppaOpintojaKokonaismaarassa: true,
                  },
                },
              },
            ],
          },
        ],
      },
    );

    await expect(eurooppaLaajuusInput).toBeVisible();
  });

  test('Eurooppa-opintojen laajuuskenttään syötetty arvo lähettää PUT-kutsun', async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, '2');

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(
          'sovellettuTilanne-oikeustieteenMaisteri-eurooppaOpinnotKokonaismaarassa',
        )
        .click(),
      {},
    );

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(
          'sovellettuTilanne-oikeustieteenMaisteri-eurooppaOpintojenLaajuus',
        )
        .locator('input')
        .fill('12'),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  oikeustieteenMaisteriLisavaatimukset: {
                    eurooppaOpintojaKokonaismaarassa: true,
                    eurooppaOpintojenLaajuus: 12,
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

test.describe('Suomi-opinnot', () => {
  test('Sisällössä-valintaruutu avaa kaikki aihealuevaihtoehdot ja lisätietokentän', async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, '1');

    const suomiSisallossaCheckbox = page.getByTestId(
      'sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnotSisallossa',
    );

    for (const aihealue of AIHEALUEET) {
      await expectHiddenOrDetached(
        page.getByTestId(
          `sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnot-aihealue-${aihealue}`,
        ),
      );
    }
    await expectHiddenOrDetached(
      page.getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-suomiOpintojenSisallonLisatieto',
      ),
    );
    await expectHiddenOrDetached(
      page.getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnot-valitseKaikki',
      ),
    );

    await expectRequestData(page, PAATOS_URL, suomiSisallossaCheckbox.click(), {
      paatosTiedot: [
        {
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              myonteisenPaatoksenLisavaatimukset: {
                oikeustieteenMaisteriLisavaatimukset: {
                  suomiOpintojaSisallossa: true,
                  suomiOpintojenAihealueet: {
                    velvoiteOikeus: false,
                    esineOikeus: false,
                    perheJaJaamistooikeus: false,
                    rikosoikeus: false,
                    prosessiOikeus: false,
                    valtioSaantooikeus: false,
                    hallintoOikeus: false,
                  },
                },
              },
            },
          ],
        },
      ],
    });

    for (const aihealue of AIHEALUEET) {
      await expect(
        page.getByTestId(
          `sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnot-aihealue-${aihealue}`,
        ),
      ).toBeVisible();
    }
    await expect(
      page.getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-suomiOpintojenSisallonLisatieto',
      ),
    ).toBeVisible();
    await expect(
      page.getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnot-valitseKaikki',
      ),
    ).toBeVisible();
  });

  test('Aihealueen valinta lähettää PUT-kutsun oikeilla tiedoilla', async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, '1');

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(
          'sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnotSisallossa',
        )
        .click(),
      {},
    );

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(
          'sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnot-aihealue-velvoiteOikeus',
        )
        .click(),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  oikeustieteenMaisteriLisavaatimukset: {
                    suomiOpintojaSisallossa: true,
                    suomiOpintojenAihealueet: {
                      velvoiteOikeus: true,
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

  test('Sisällössä-valintaruudun poistaminen piilottaa aihealueet ja lisätietokentän', async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, '1');

    const suomiSisallossaCheckbox = page.getByTestId(
      'sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnotSisallossa',
    );

    await expectRequestData(
      page,
      PAATOS_URL,
      suomiSisallossaCheckbox.click(),
      {},
    );
    await expect(
      page.getByTestId(
        `sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnot-aihealue-velvoiteOikeus`,
      ),
    ).toBeVisible();

    await expectRequestData(page, PAATOS_URL, suomiSisallossaCheckbox.click(), {
      paatosTiedot: [
        {
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              myonteisenPaatoksenLisavaatimukset: {
                oikeustieteenMaisteriLisavaatimukset: {
                  suomiOpintojaSisallossa: false,
                },
              },
            },
          ],
        },
      ],
    });

    await expectHiddenOrDetached(
      page.getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnot-aihealue-velvoiteOikeus',
      ),
    );
    await expectHiddenOrDetached(
      page.getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-suomiOpintojenSisallonLisatieto',
      ),
    );
  });

  test('Laajuudessa-valintaruutu avaa laajuuskentän ja lähettää PUT-kutsun', async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, '1');

    const suomiLaajuudessaCheckbox = page.getByTestId(
      'sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnotLaajuudessa',
    );
    const suomiLaajuusInput = page.getByTestId(
      'sovellettuTilanne-oikeustieteenMaisteri-suomiOpintojenLaajuus',
    );

    await expectHiddenOrDetached(suomiLaajuusInput);

    await expectRequestData(
      page,
      PAATOS_URL,
      suomiLaajuudessaCheckbox.click(),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  oikeustieteenMaisteriLisavaatimukset: {
                    suomiOpintojaLaajuudessa: true,
                  },
                },
              },
            ],
          },
        ],
      },
    );

    await expect(suomiLaajuusInput).toBeVisible();
  });

  test('Suomi-opintojen laajuuskenttään syötetty arvo lähettää PUT-kutsun', async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, '1');

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(
          'sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnotLaajuudessa',
        )
        .click(),
      {},
    );

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(
          'sovellettuTilanne-oikeustieteenMaisteri-suomiOpintojenLaajuus',
        )
        .locator('input')
        .fill('30'),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  oikeustieteenMaisteriLisavaatimukset: {
                    suomiOpintojaLaajuudessa: true,
                    suomiOpintojenLaajuus: 30,
                  },
                },
              },
            ],
          },
        ],
      },
    );
  });

  test('Lisätietokentän täyttö lähettää PUT-kutsun', async ({ page }) => {
    await navigateToSovellettuTilanne(page, '1');

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(
          'sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnotSisallossa',
        )
        .click(),
      {},
    );

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(
          'sovellettuTilanne-oikeustieteenMaisteri-suomiOpintojenSisallonLisatieto',
        )
        .getByRole('textbox')
        .fill('Suomi-opintojen sisällön kuvaus'),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  oikeustieteenMaisteriLisavaatimukset: {
                    suomiOpintojaSisallossa: true,
                    suomiOpintojenSisallonLisatieto:
                      'Suomi-opintojen sisällön kuvaus',
                  },
                },
              },
            ],
          },
        ],
      },
    );
  });

  test("'Valitse kaikki' -painike valitsee kaikki aihealueet ja lähettää PUT-kutsun", async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, '1');

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(
          'sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnotSisallossa',
        )
        .click(),
      {},
    );

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(
          'sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnot-valitseKaikki',
        )
        .click(),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  oikeustieteenMaisteriLisavaatimukset: {
                    suomiOpintojenAihealueet: {
                      velvoiteOikeus: true,
                      esineOikeus: true,
                      perheJaJaamistooikeus: true,
                      rikosoikeus: true,
                      prosessiOikeus: true,
                      valtioSaantooikeus: true,
                      hallintoOikeus: true,
                    },
                  },
                },
              },
            ],
          },
        ],
      },
    );

    for (const aihealue of AIHEALUEET) {
      await expect(
        page.getByTestId(
          `sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnot-aihealue-${aihealue}`,
        ),
      ).toBeChecked();
    }
  });

  test("'Valitse kaikki' ylikirjoittaa aiemmat yksittäiset valinnat", async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, '1');

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(
          'sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnotSisallossa',
        )
        .click(),
      {},
    );

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(
          'sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnot-aihealue-velvoiteOikeus',
        )
        .click(),
      {},
    );

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(
          'sovellettuTilanne-oikeustieteenMaisteri-suomiOpinnot-valitseKaikki',
        )
        .click(),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  oikeustieteenMaisteriLisavaatimukset: {
                    suomiOpintojenAihealueet: {
                      velvoiteOikeus: true,
                      esineOikeus: true,
                      perheJaJaamistooikeus: true,
                      rikosoikeus: true,
                      prosessiOikeus: true,
                      valtioSaantooikeus: true,
                      hallintoOikeus: true,
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
});

test.describe('Laajuuden kokonaislukuvalidointi', () => {
  test('Virheellinen syöte ei lähetä kutsua, kelvollinen kokonaisluku lähettää', async ({
    page,
  }) => {
    await navigateToSovellettuTilanne(page, '2');

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId(
          'sovellettuTilanne-oikeustieteenMaisteri-eurooppaOpinnotKokonaismaarassa',
        )
        .click(),
      {},
    );

    const inputField = page
      .getByTestId(
        'sovellettuTilanne-oikeustieteenMaisteri-eurooppaOpintojenLaajuus',
      )
      .locator('input');

    await inputField.fill('10.5');
    await expect(page.getByTestId('save-ribbon-button')).toBeHidden();

    await inputField.fill('abc');
    await expect(page.getByTestId('save-ribbon-button')).toBeHidden();

    await expectRequestData(page, PAATOS_URL, inputField.fill('8'), {
      paatosTiedot: [
        {
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              myonteisenPaatoksenLisavaatimukset: {
                oikeustieteenMaisteriLisavaatimukset: {
                  eurooppaOpintojaKokonaismaarassa: true,
                  eurooppaOpintojenLaajuus: 8,
                },
              },
            },
          ],
        },
      ],
    });
  });

  test('Tyhjä syöte nollaa laajuuden', async ({ page }) => {
    await navigateToSovellettuTilanne(page, '1');

    await expectRequestData(
      page,
      PAATOS_URL,
      page
        .getByTestId('sovellettuTilanne-oikeustieteenMaisteri-tallinnaOpinnot')
        .click(),
      {},
    );

    const inputField = page.getByTestId(
      'sovellettuTilanne-oikeustieteenMaisteri-tallinnaOpinnot-laajuus',
    );

    await expectRequestData(
      page,
      PAATOS_URL,
      inputField.getByRole('textbox').fill(''),
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  oikeustieteenMaisteriLisavaatimukset: {
                    tallinnassaSuoritettujaOpintoja: true,
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
