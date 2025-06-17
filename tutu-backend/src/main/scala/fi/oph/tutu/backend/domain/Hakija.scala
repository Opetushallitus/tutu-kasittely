package fi.oph.tutu.backend.domain

case class Hakija (
  etunimet: String,
  kutsumanimi: String,
  sukunimi: String,
  kansalaisuus: Kielistetty,
  hetu: Option[String],
  syntymaaika: String,
  matkapuhelin: Option[String],
  asuinmaa: Kielistetty,
  katuosoite: String,
  postinumero: String,
  postitoimipaikka: String,
  kotikunta: Kielistetty,
  sahkopostiosoite: Option[String],
)
