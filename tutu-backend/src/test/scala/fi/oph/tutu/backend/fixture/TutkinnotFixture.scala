package fi.oph.tutu.backend.fixture

import fi.oph.tutu.backend.domain.Tutkinto

import java.util.UUID

def createTutkinnotFixture(hakemusId: UUID): Seq[Tutkinto] = Seq(
  Tutkinto(
    id = None,
    hakemusId = hakemusId,
    jarjestys = "1",
    nimi = Some("Päälikkö"),
    oppilaitos = Some("Butan Amattikoulu"),
    aloitusVuosi = Some(1999),
    paattymisVuosi = Some(2000),
    maakoodiUri = Some("maatjavaltiot2_762"),
    muuTutkintoTieto = None,
    todistuksenPaivamaara = Some("1.2.2000"),
    koulutusalaKoodiUri = None,
    paaaaineTaiErikoisala = Some("Paalikön erikoisala"),
    todistusOtsikko = Some("examensbevis"),
    ohjeellinenLaajuus = None
  ),
  Tutkinto(
    id = None,
    hakemusId = hakemusId,
    jarjestys = "2",
    nimi = Some("Johto tehtävä"),
    oppilaitos = Some("Johto koulu"),
    aloitusVuosi = Some(2006),
    paattymisVuosi = Some(2007),
    maakoodiUri = Some("maatjavaltiot2_762"),
    muuTutkintoTieto = None,
    todistuksenPaivamaara = None,
    koulutusalaKoodiUri = None,
    paaaaineTaiErikoisala = None,
    todistusOtsikko = Some("ovrigbevis"),
    ohjeellinenLaajuus = None
  ),
  Tutkinto(
    id = None,
    hakemusId = hakemusId,
    jarjestys = "3",
    nimi = Some("Apu poika"),
    oppilaitos = Some("Apu koulu"),
    aloitusVuosi = Some(2010),
    paattymisVuosi = Some(2011),
    maakoodiUri = Some("maatjavaltiot2_762"),
    muuTutkintoTieto = None,
    todistuksenPaivamaara = None,
    koulutusalaKoodiUri = None,
    paaaaineTaiErikoisala = None,
    todistusOtsikko = None,
    ohjeellinenLaajuus = None
  ),
  Tutkinto(
    id = None,
    hakemusId = hakemusId,
    jarjestys = "MUU",
    nimi = None,
    oppilaitos = None,
    aloitusVuosi = None,
    paattymisVuosi = None,
    maakoodiUri = None,
    muuTutkintoTieto = Some(
      "olem lisäksi suorittanut onnistunesti\n\n- elämän koulun perus ja ja jatko opintoja monia kymmeniä,,,, opintoviikoja\n\n\nsekä:\n\nesi merkiksi rippi koulun!!!!111"
    ),
    todistuksenPaivamaara = None,
    koulutusalaKoodiUri = None,
    paaaaineTaiErikoisala = None,
    todistusOtsikko = None,
    ohjeellinenLaajuus = None,
    muuTutkintoMuistio = None
  )
)

def createTutkinnotFixtureBeforeMuuttuneetTutkinnot(hakemusId: UUID): Seq[Tutkinto] = Seq(
  Tutkinto(
    id = None,
    hakemusId = hakemusId,
    jarjestys = "1",
    nimi = Some("ensimmäinen laulututkinto"),
    oppilaitos = Some("Karaåke-oppilaitos"),
    aloitusVuosi = Some(2005),
    paattymisVuosi = Some(2015),
    maakoodiUri = Some("maatjavaltiot2_101"),
    muuTutkintoTieto = None,
    todistuksenPaivamaara = None,
    koulutusalaKoodiUri = None,
    paaaaineTaiErikoisala = None,
    todistusOtsikko = Some("tutkintotodistus"),
    ohjeellinenLaajuus = None
  ),
  Tutkinto(
    id = None,
    hakemusId = hakemusId,
    jarjestys = "2",
    nimi = Some("Kolmosoluen asijantuntijatutkinto"),
    oppilaitos = Some("Beer- ja ravintola oppilaitos"),
    aloitusVuosi = Some(1974),
    paattymisVuosi = Some(2014),
    maakoodiUri = Some("maatjavaltiot2_102"),
    muuTutkintoTieto = None,
    todistuksenPaivamaara = None,
    koulutusalaKoodiUri = None,
    paaaaineTaiErikoisala = None,
    todistusOtsikko = Some("muutodistus"),
    ohjeellinenLaajuus = None
  ),
  Tutkinto(
    id = None,
    hakemusId = hakemusId,
    jarjestys = "MUU",
    nimi = None,
    oppilaitos = None,
    aloitusVuosi = None,
    paattymisVuosi = None,
    maakoodiUri = None,
    muuTutkintoTieto = Some("Ammuu-instituutti"),
    todistuksenPaivamaara = None,
    koulutusalaKoodiUri = None,
    paaaaineTaiErikoisala = None,
    todistusOtsikko = None,
    ohjeellinenLaajuus = None,
    muuTutkintoMuistio = None
  )
)

def createTutkinnotFixtureAfterMuuttuneetTutkinnot(hakemusId: UUID): Seq[Tutkinto] = Seq(
  Tutkinto(
    id = None,
    hakemusId = hakemusId,
    jarjestys = "1",
    nimi = Some("ensimmäinen laulututkinto, riki sorsan koko tuotanto"),
    oppilaitos = Some("Karaåke-oppilaitos, imatra"),
    aloitusVuosi = Some(2005),
    paattymisVuosi = Some(2015),
    maakoodiUri = Some("maatjavaltiot2_103"),
    muuTutkintoTieto = None,
    todistuksenPaivamaara = None,
    koulutusalaKoodiUri = None,
    paaaaineTaiErikoisala = None,
    todistusOtsikko = Some("examensbevis"),
    ohjeellinenLaajuus = None
  ),
  Tutkinto(
    id = None,
    hakemusId = hakemusId,
    jarjestys = "2",
    nimi = Some("mocktail-koulu"),
    oppilaitos = Some("Beer- ja ravintola oppilaitos"),
    aloitusVuosi = Some(1897),
    paattymisVuosi = Some(2024),
    maakoodiUri = Some("maatjavaltiot2_104"),
    muuTutkintoTieto = None,
    todistuksenPaivamaara = None,
    koulutusalaKoodiUri = None,
    paaaaineTaiErikoisala = None,
    todistusOtsikko = Some("ovrigbevis"),
    ohjeellinenLaajuus = None
  ),
  Tutkinto(
    id = None,
    hakemusId = hakemusId,
    jarjestys = "MUU",
    nimi = None,
    oppilaitos = None,
    aloitusVuosi = None,
    paattymisVuosi = None,
    maakoodiUri = None,
    muuTutkintoTieto = Some("Ammuu-instituutti, ypäjän hevosopisto"),
    todistuksenPaivamaara = None,
    koulutusalaKoodiUri = None,
    paaaaineTaiErikoisala = None,
    todistusOtsikko = None,
    ohjeellinenLaajuus = None,
    muuTutkintoMuistio = None
  )
)
