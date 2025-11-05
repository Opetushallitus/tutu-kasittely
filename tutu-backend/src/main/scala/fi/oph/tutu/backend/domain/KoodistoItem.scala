package fi.oph.tutu.backend.domain

import java.time.LocalDate

case class KoodistoItem(
  koodiUri: String,
  koodiArvo: String,
  nimi: Kielistetty,
  voimassaAlkuPvm: Option[LocalDate] = None,
  voimassaLoppuPvm: Option[LocalDate] = None,
  tila: Option[String] = None
) {
  def isValid(referenceDate: LocalDate = LocalDate.now()): Boolean = {
    val isAfterStart   = voimassaAlkuPvm.forall(start => !referenceDate.isBefore(start))
    val isBeforeEnd    = voimassaLoppuPvm.forall(end => referenceDate.isBefore(end))
    val isActiveStatus = tila.forall(status => status == "HYVAKSYTTY" || status == "LUONNOS")

    isAfterStart && isBeforeEnd && isActiveStatus
  }
}
