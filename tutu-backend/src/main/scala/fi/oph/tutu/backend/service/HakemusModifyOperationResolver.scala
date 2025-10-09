package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*

import java.util.UUID

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

  private def paatosTietoModified(
    currentPaatosTieto: PaatosTieto,
    toBePaatosTieto: PaatosTieto
  ): Boolean = currentPaatosTieto.id == toBePaatosTieto.id &&
    (currentPaatosTieto.paatosTyyppi != toBePaatosTieto.paatosTyyppi ||
      currentPaatosTieto.sovellettuLaki != toBePaatosTieto.sovellettuLaki ||
      currentPaatosTieto.tutkintoId != toBePaatosTieto.tutkintoId ||
      currentPaatosTieto.lisaaTutkintoPaatostekstiin != toBePaatosTieto.lisaaTutkintoPaatostekstiin ||
      currentPaatosTieto.myonteinenPaatos != toBePaatosTieto.myonteinenPaatos ||
      currentPaatosTieto.myonteisenPaatoksenLisavaatimukset != toBePaatosTieto.myonteisenPaatoksenLisavaatimukset ||
      currentPaatosTieto.kielteisenPaatoksenPerustelut != toBePaatosTieto.kielteisenPaatoksenPerustelut ||
      currentPaatosTieto.tutkintoTaso != toBePaatosTieto.tutkintoTaso ||
      currentPaatosTieto.rinnastettavatTutkinnotTaiOpinnot != toBePaatosTieto.rinnastettavatTutkinnotTaiOpinnot)

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
    val poistetut = currentLausuntopyynnot
      .filterNot(pyynto => toBeLausuntopyynnot.exists(_.id == pyynto.id))
      .map(_.id.orNull)
      .filter(_ != null)
    val muutetut =
      toBeLausuntopyynnot.filter(pyynto => currentLausuntopyynnot.exists(lausuntopyyntoModified(_, pyynto)))
    LausuntopyyntoModifyData(uudet, muutetut, poistetut)
  }

  private def resolveReIndexedTutkinnot(
    startIndex: Int,
    toBeTutkinnot: Seq[Tutkinto],
    poistetutTutkinnot: Seq[UUID]
  ): Seq[Tutkinto] = {
    val uudelleenNumerointiIterator = (startIndex to (startIndex + toBeTutkinnot.size)).iterator
    val startIndexStr               = startIndex.toString
    toBeTutkinnot
      .filter(t => t.jarjestys > startIndexStr && t.jarjestys != "MUU" && !poistetutTutkinnot.contains(t.id.orNull))
      .map(t => t.copy(jarjestys = uudelleenNumerointiIterator.next().toString))
  }

  def resolveTutkintoModifyOperations(
    currentTutkinnot: Seq[Tutkinto],
    toBeTutkinnot: Seq[Tutkinto]
  ): TutkintoModifyData = {
    val uudet     = toBeTutkinnot.filterNot(t => currentTutkinnot.exists(_.id == t.id))
    val poistetut =
      currentTutkinnot.filterNot(t => toBeTutkinnot.exists(_.id == t.id)).map(_.id.orNull).filter(_ != null)
    val muutetut = toBeTutkinnot.filter(t => currentTutkinnot.exists(ct => ct.id == t.id && ct != t))

    val pieninPoistettuJarjestysNumero =
      currentTutkinnot.find(t => poistetut.contains(t.id.orNull)).map(_.jarjestys).getOrElse("")
    val muutetutJaUudelleenNumeroitavat =
      if (pieninPoistettuJarjestysNumero.nonEmpty)
        muutetut ++ resolveReIndexedTutkinnot(pieninPoistettuJarjestysNumero.toInt, toBeTutkinnot, poistetut)
      else muutetut
    TutkintoModifyData(uudet, muutetutJaUudelleenNumeroitavat, poistetut)
  }

  def resolvePaatosTietoModifyOperations(
    currentPaatosTiedot: Seq[PaatosTieto],
    toBePaatosTiedot: Seq[PaatosTieto]
  ): PaatosTietoModifyData = {
    val uudet     = toBePaatosTiedot.filterNot(pyynto => currentPaatosTiedot.exists(_.id == pyynto.id))
    val poistetut = currentPaatosTiedot
      .filterNot(pyynto => toBePaatosTiedot.exists(_.id == pyynto.id))
      .map(_.id.orNull)
      .filter(_ != null)
    val muutetut =
      toBePaatosTiedot.filter(paatosTieto => currentPaatosTiedot.exists(paatosTietoModified(_, paatosTieto)))
    PaatosTietoModifyData(uudet, muutetut, poistetut)
  }
}
