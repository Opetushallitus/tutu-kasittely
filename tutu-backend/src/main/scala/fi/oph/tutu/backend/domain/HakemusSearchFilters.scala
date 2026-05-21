package fi.oph.tutu.backend.domain

case class HakemusSearchFilters(
  // Tutkinto-filtterit
  suoritusmaa: Option[Seq[String]],
  paattymisVuosi: Option[Int],
  todistusVuosi: Option[String],
  oppilaitos: Option[String],
  tutkinnonNimi: Option[String],
  paaAine: Option[String],
  // Kelpoisuus-filtterit (korreloituu tutkintoon kun molemmat annettu)
  kelpoisuus: Option[String],
  opetettavatAineet: Option[Seq[String]],
  // Päätösfiltterit (korreloituu tutkintoon)
  ratkaisutyyppi: Option[String],
  paatostyyppi: Option[String],
  sovellettuLaki: Option[String],
  tutkinnonTaso: Option[String],
  kielteinen: Option[String],
  myonteinen: Option[String],
  // Hakija/esittelijä-filtterit
  esittelijaOid: Option[String],
  hakijanNimi: Option[String],
  asiatunnus: Option[String]
) {
  def hasAny: Boolean =
    suoritusmaa.nonEmpty || paattymisVuosi.nonEmpty || todistusVuosi.nonEmpty ||
      oppilaitos.nonEmpty || tutkinnonNimi.nonEmpty || paaAine.nonEmpty ||
      kelpoisuus.nonEmpty || opetettavatAineet.nonEmpty ||
      ratkaisutyyppi.nonEmpty || paatostyyppi.nonEmpty || sovellettuLaki.nonEmpty ||
      tutkinnonTaso.nonEmpty || kielteinen.nonEmpty || myonteinen.nonEmpty ||
      esittelijaOid.nonEmpty || hakijanNimi.nonEmpty || asiatunnus.nonEmpty
}
