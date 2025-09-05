package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{
  AsiakirjamalliLahde,
  AsiakirjamalliModifyData,
  AsiakirjamalliTutkinnosta,
  Lausuntopyynto,
  LausuntopyyntoModifyData,
  PyydettavaAsiakirja,
  PyydettavaAsiakirjaModifyData
}

object HakemusModifyOperationResolver {
  private def pyydettavaAsiakirjaModified(
    currentAsiakirja: PyydettavaAsiakirja,
    toBeAsiakirja: PyydettavaAsiakirja
  ): Boolean = currentAsiakirja.id == toBeAsiakirja.id &&
    currentAsiakirja.asiakirjanTyyppi != toBeAsiakirja.asiakirjanTyyppi

  private def asiakirjamalliModified(
    currentMalli: Option[AsiakirjamalliTutkinnosta],
    toBeMalli: AsiakirjamalliTutkinnosta
  ): Boolean = {
    currentMalli match {
      case Some(current) =>
        current.vastaavuus != toBeMalli.vastaavuus ||
        current.kuvaus != toBeMalli.kuvaus
      case _ => false
    }
  }

  private def lausuntopyyntoModified(
    currentPyynto: Lausuntopyynto,
    toBePyynto: Lausuntopyynto
  ): Boolean = currentPyynto.id == toBePyynto.id &&
    (currentPyynto.lausunnonAntaja != toBePyynto.lausunnonAntaja ||
      currentPyynto.lahetetty != toBePyynto.lahetetty ||
      currentPyynto.saapunut != toBePyynto.saapunut)

  def resolvePyydettavatAsiakirjatModifyOperations(
    currentAsiakirjat: Seq[PyydettavaAsiakirja],
    toBeAsiakirjat: Seq[PyydettavaAsiakirja]
  ): PyydettavaAsiakirjaModifyData = {
    val uudet     = toBeAsiakirjat.filterNot(asiakirja => currentAsiakirjat.exists(_.id == asiakirja.id))
    val poistetut = currentAsiakirjat.filterNot(asiakirja => toBeAsiakirjat.exists(_.id == asiakirja.id)).map(_.id.get)
    val muutetut  =
      toBeAsiakirjat.filter(asiakirja => currentAsiakirjat.exists(pyydettavaAsiakirjaModified(_, asiakirja)))

    PyydettavaAsiakirjaModifyData(uudet, muutetut, poistetut)
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

    AsiakirjamalliModifyData(uudetMallit, muutetutMallit, poistetutMallit)
  }

  def resolveLausuntopyyntoModifyOperations(
    currentLausuntopyynnot: Seq[Lausuntopyynto],
    toBeLausuntopyynnot: Seq[Lausuntopyynto]
  ): LausuntopyyntoModifyData = {
    val uudet     = toBeLausuntopyynnot.filterNot(pyynto => currentLausuntopyynnot.exists(_.id == pyynto.id))
    val poistetut = currentLausuntopyynnot.filterNot(pyynto => toBeLausuntopyynnot.exists(_.id == pyynto.id)).map(_.id)
    val muutetut  =
      toBeLausuntopyynnot.filter(pyynto => currentLausuntopyynnot.exists(lausuntopyyntoModified(_, pyynto)))
    LausuntopyyntoModifyData(uudet, muutetut, poistetut)
  }
}
