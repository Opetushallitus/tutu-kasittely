package fi.oph.tutu.backend.domain

case class Hakija(
  henkiloOid: String,
  etunimet: String,
  kutsumanimi: String,
  sukunimi: String,
  kansalaisuus: Seq[Kielistetty],
  hetu: Option[String],
  syntymaaika: String,
  matkapuhelin: Option[String],
  asuinmaa: Kielistetty,
  katuosoite: String,
  postinumero: String,
  postitoimipaikka: String,
  kotikunta: Kielistetty,
  sahkopostiosoite: Option[String],
  yksiloityVTJ: Boolean
)
