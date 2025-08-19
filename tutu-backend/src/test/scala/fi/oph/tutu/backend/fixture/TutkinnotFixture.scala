package fi.oph.tutu.backend.fixture

import fi.oph.tutu.backend.domain.{Tutkinnot, Tutkinto}

import java.util.UUID

def createTutkinnotFixture(hakemusId: UUID): Tutkinnot = Tutkinnot(
  Tutkinto(
    None,
    hakemusId,
    "1",
    Some("Päälikkö"),
    Some("Butan Amattikoulu"),
    Some(1999),
    Some(2000),
    None
  ),
  Some(
    Tutkinto(
      None,
      hakemusId,
      "2",
      Some("Johto tehtävä"),
      Some("Johto koulu"),
      Some(2006),
      Some(2007),
      None
    )
  ),
  Some(
    Tutkinto(
      None,
      hakemusId,
      "3",
      Some("Apu poika"),
      Some("Apu koulu"),
      Some(2010),
      Some(2011),
      None
    )
  ),
  Some(
    Tutkinto(
      None,
      hakemusId,
      "MUU",
      None,
      None,
      None,
      None,
      Some(
        "olem lisäksi suorittanut onnistunesti\n\n- elämän koulun perus ja ja jatko opintoja monia kymmeniä,,,, opintoviikoja\n\n\nsekä:\n\nesi merkiksi rippi koulun!!!!111"
      )
    )
  )
)
