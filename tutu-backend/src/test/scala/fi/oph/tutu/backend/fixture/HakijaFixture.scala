package fi.oph.tutu.backend.fixture

import fi.oph.tutu.backend.domain.{Hakija, Kieli}

val suomi = Map(
  Kieli.valueOf("fi") -> "Suomi",
  Kieli.valueOf("sv") -> "Finland",
  Kieli.valueOf("en") -> "Finland"
)
val kajaani = Map(
  Kieli.valueOf("fi") -> "Kajaani",
  Kieli.valueOf("sv") -> "Kajana",
  Kieli.valueOf("en") -> "Kanada"
)

val hakijaFixture = Hakija(
  "Testi Kolmas",
  "Tatu",
  "Hakija",
  suomi,
  Some("180462-9981"),
  "18.04.1962",
  Some("+3584411222333"),
  suomi,
  "Sillitie 1",
  "00800",
  "HELSINKI",
  kajaani,
  Some("patu.kuusinen@riibasu.fi")
)

