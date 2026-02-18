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
  henkiloOid = "1.2.246.562.198.94192383589",
  etunimet = "Testi Kolmas",
  kutsumanimi = "Tatu",
  sukunimi = "Hakija",
  kansalaisuus = Seq(suomi),
  hetu = Some("180462-9981"),
  syntymaaika = "18.04.1962",
  matkapuhelin = Some("+3584411222333"),
  asuinmaa = suomi,
  katuosoite = "Sillitie 1",
  postinumero = "00800",
  postitoimipaikka = "HELSINKI",
  kotikunta = kajaani,
  sahkopostiosoite = Some("patu.kuusinen@riibasu.fi"),
  yksiloityVTJ = false
)
