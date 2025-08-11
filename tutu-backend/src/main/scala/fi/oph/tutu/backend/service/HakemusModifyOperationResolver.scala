package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{AsiakirjamalliLahde, AsiakirjamalliModifyData, AsiakirjamalliTutkinnosta}

object HakemusModifyOperationResolver {
  private def asiakirjamalliModified(
    currentMalli: Option[AsiakirjamalliTutkinnosta],
    toBeMalli: AsiakirjamalliTutkinnosta
  ): Boolean = {
    currentMalli match {
      case Some(current) =>
        current.vastaavuus != toBeMalli.vastaavuus ||
        current.kuvaus != toBeMalli.kuvaus
      case None => false
    }
  }

  def resolveAsiakirjamalliModifyOperations(
    currentAsiakirjamallit: Map[AsiakirjamalliLahde, AsiakirjamalliTutkinnosta],
    toBeAsiakirjamallit: Map[AsiakirjamalliLahde, AsiakirjamalliTutkinnosta]
  ): AsiakirjamalliModifyData = {
    val uudetMallit     = toBeAsiakirjamallit.view.filterKeys(!currentAsiakirjamallit.contains(_)).toMap
    val poistetutMallit = currentAsiakirjamallit.view.filterKeys(!toBeAsiakirjamallit.contains(_)).keys.toSeq
    val muutetutMallit  = toBeAsiakirjamallit.view
      .filterKeys(lahde => asiakirjamalliModified(currentAsiakirjamallit.get(lahde), toBeAsiakirjamallit(lahde)))
      .toMap

    AsiakirjamalliModifyData(
      uudetMallit = uudetMallit,
      muutetutMallit = muutetutMallit,
      poistetutMallit = poistetutMallit
    )
  }
}
