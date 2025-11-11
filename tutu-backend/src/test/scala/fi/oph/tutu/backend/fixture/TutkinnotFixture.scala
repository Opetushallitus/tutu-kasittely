package fi.oph.tutu.backend.fixture

import fi.oph.tutu.backend.domain.Tutkinto

import java.util.UUID

def createTutkinnotFixture(hakemusId: UUID): Seq[Tutkinto] = Seq(
  Tutkinto(
    None,
    hakemusId,
    "1",
    Some("Päälikkö"),
    Some("Butan Amattikoulu"),
    Some(1999),
    Some(2000),
    Some("maatjavaltiot2_762"),
    None,
    None,
    None,
    None,
    Some("examensbevis"),
    None
  ),
  Tutkinto(
    None,
    hakemusId,
    "2",
    Some("Johto tehtävä"),
    Some("Johto koulu"),
    Some(2006),
    Some(2007),
    Some("maatjavaltiot2_762"),
    None,
    None,
    None,
    None,
    Some("ovrigbevis"),
    None
  ),
  Tutkinto(
    None,
    hakemusId,
    "3",
    Some("Apu poika"),
    Some("Apu koulu"),
    Some(2010),
    Some(2011),
    Some("maatjavaltiot2_762"),
    None,
    None,
    None,
    None,
    None,
    None
  ),
  Tutkinto(
    None,
    hakemusId,
    "MUU",
    None,
    None,
    None,
    None,
    None,
    Some(
      "olem lisäksi suorittanut onnistunesti\n\n- elämän koulun perus ja ja jatko opintoja monia kymmeniä,,,, opintoviikoja\n\n\nsekä:\n\nesi merkiksi rippi koulun!!!!111"
    ),
    None,
    None,
    None,
    None,
    None
  )
)

def createTutkinnotFixtureBeforeMuuttuneetTutkinnot(hakemusId: UUID): Seq[Tutkinto] = Seq(
  Tutkinto(
    None,
    hakemusId,
    "1",
    Some("ensimmäinen laulututkinto"),
    Some("Karaåke-oppilaitos"),
    Some(2005),
    Some(2015),
    Some("maatjavaltiot2_101"),
    None,
    None,
    None,
    None,
    Some("tutkintotodistus"),
    None
  ),
  Tutkinto(
    None,
    hakemusId,
    "2",
    Some("Kolmosoluen asijantuntijatutkinto"),
    Some("Beer- ja ravintola oppilaitos"),
    Some(1974),
    Some(2014),
    Some("maatjavaltiot2_102"),
    None,
    None,
    None,
    None,
    Some("muutodistus"),
    None
  ),
  Tutkinto(
    None,
    hakemusId,
    "MUU",
    None,
    None,
    None,
    None,
    None,
    Some(
      "Ammuu-instituutti"
    ),
    None,
    None,
    None,
    None,
    None
  )
)

def createTutkinnotFixtureAfterMuuttuneetTutkinnot(hakemusId: UUID): Seq[Tutkinto] = Seq(
  Tutkinto(
    None,
    hakemusId,
    "1",
    Some("ensimmäinen laulututkinto, riki sorsan koko tuotanto"),
    Some("Karaåke-oppilaitos, imatra"),
    Some(2005),
    Some(2015),
    Some("maatjavaltiot2_103"),
    None,
    None,
    None,
    None,
    Some("examensbevis"),
    None
  ),
  Tutkinto(
    None,
    hakemusId,
    "2",
    Some("mocktail-koulu"),
    Some("Beer- ja ravintola oppilaitos"),
    Some(1897),
    Some(2024),
    Some("maatjavaltiot2_104"),
    None,
    None,
    None,
    None,
    Some("ovrigbevis"),
    None
  ),
  Tutkinto(
    None,
    hakemusId,
    "MUU",
    None,
    None,
    None,
    None,
    None,
    Some(
      "Ammuu-instituutti, ypäjän hevosopisto"
    ),
    None,
    None,
    None,
    None,
    None
  )
)
