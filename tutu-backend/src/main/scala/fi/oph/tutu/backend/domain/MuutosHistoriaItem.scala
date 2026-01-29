package fi.oph.tutu.backend.domain

import java.time.LocalDateTime

case class MuutosHistoriaItem(
  role: MuutosHistoriaRoleType,
  time: LocalDateTime,
  modifiedBy: String
)

val UPDATED_BY_APPLICANT  = "updated-by-applicant"
val UPDATED_BY_VIRKAILIJA = "updated-by-virkailija"

enum MuutosHistoriaRoleType   { case Hakija, Esittelija, Irrelevant }
object MuutosHistoriaRoleType {
  def fromString(roleString: String): MuutosHistoriaRoleType = {
    roleString match {
      case UPDATED_BY_APPLICANT  => Hakija
      case UPDATED_BY_VIRKAILIJA => Esittelija
      case _                     => Irrelevant
    }
  }

  def isRelevant(roleString: String): Boolean = {
    roleString == UPDATED_BY_APPLICANT || roleString == UPDATED_BY_VIRKAILIJA
  }
}
