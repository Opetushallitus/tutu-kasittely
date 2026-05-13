package fi.oph.tutu.backend.domain

case class HakemusSearchFilters(
  // Tutkinto-filtterit
  suoritusmaa: Option[String] = None,
  paattymisVuosi: Option[Int] = None,
  todistusVuosi: Option[String] = None,
  oppilaitos: Option[String] = None,
  tutkinnonNimi: Option[String] = None,
  paaAine: Option[String] = None,
  // Kelpoisuus-filtterit (korreloituu tutkintoon kun molemmat annettu)
  kelpoisuus: Option[String] = None,
  opetettavatAineet: Option[String] = None,
  // Päätösfiltterit
  ratkaisutyyppi: Option[String] = None,
  paatostyyppi: Option[String] = None,
  sovellettuLaki: Option[String] = None,
  tutkinnonTaso: Option[String] = None,
  kielteinen: Option[String] = None,
  myonteinen: Option[String] = None,
  // Hakija/esittelijä-filtterit
  esittelijaOid: Option[String] = None,
  hakijanNimi: Option[String] = None,
  asiatunnus: Option[String] = None
) {
  def hasAny: Boolean =
    suoritusmaa.nonEmpty || paattymisVuosi.nonEmpty || todistusVuosi.nonEmpty ||
      oppilaitos.nonEmpty || tutkinnonNimi.nonEmpty || paaAine.nonEmpty ||
      kelpoisuus.nonEmpty || opetettavatAineet.nonEmpty ||
      ratkaisutyyppi.nonEmpty || paatostyyppi.nonEmpty || sovellettuLaki.nonEmpty ||
      tutkinnonTaso.nonEmpty || kielteinen.nonEmpty || myonteinen.nonEmpty ||
      esittelijaOid.nonEmpty || hakijanNimi.nonEmpty || asiatunnus.nonEmpty
}
