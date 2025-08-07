package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{AsiakirjamalliModifyData, AsiakirjamalliTutkinnosta}

object HakemusModifyOperationResolver {
  private def asiakirjamalliModified(
    currentMalli: AsiakirjamalliTutkinnosta,
    toBeMalli: AsiakirjamalliTutkinnosta
  ): Boolean =
    currentMalli.lahde == toBeMalli.lahde && (
      currentMalli.vastaavuus != toBeMalli.vastaavuus ||
        currentMalli.kuvaus != toBeMalli.kuvaus
    )

  def resolveAsiakirjamalliModifyOperations(
    currentAsiakirjamallit: Seq[AsiakirjamalliTutkinnosta],
    toBeAsiakirjamallit: Seq[AsiakirjamalliTutkinnosta]
  ): AsiakirjamalliModifyData = {
    val uudetMallit     = toBeAsiakirjamallit.filterNot(malli => currentAsiakirjamallit.exists(_.lahde == malli.lahde))
    val poistetutMallit = currentAsiakirjamallit.filterNot(malli => toBeAsiakirjamallit.exists(_.lahde == malli.lahde))
    val muutetutMallit  =
      toBeAsiakirjamallit.filter(malli => currentAsiakirjamallit.exists(asiakirjamalliModified(_, malli)))

    AsiakirjamalliModifyData(
      uudetMallit = uudetMallit,
      muutetutMallit = muutetutMallit,
      poistetutMallit = poistetutMallit
    )
  }
}
