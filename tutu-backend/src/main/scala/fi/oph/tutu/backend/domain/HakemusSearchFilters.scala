package fi.oph.tutu.backend.domain

case class HakemusSearchFilters(
  suoritusmaa: Option[String] = None,
  paattymisVuosi: Option[Int] = None,
  todistusVuosi: Option[String] = None,
  oppilaitos: Option[String] = None,
  tutkinnonNimi: Option[String] = None,
  paaAine: Option[String] = None
) {
  def hasAny: Boolean =
    suoritusmaa.nonEmpty || paattymisVuosi.nonEmpty || todistusVuosi.nonEmpty ||
      oppilaitos.nonEmpty || tutkinnonNimi.nonEmpty || paaAine.nonEmpty
}
