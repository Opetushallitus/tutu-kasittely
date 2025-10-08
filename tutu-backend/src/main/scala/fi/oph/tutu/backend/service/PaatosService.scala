package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{HakemusOid, Paatos, PaatosTietoModifyData, PartialPaatos}
import fi.oph.tutu.backend.repository.{HakemusRepository, PaatosRepository}
import fi.oph.tutu.backend.utils.TutuJsonFormats
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}

@Component
@Service
class PaatosService(hakemusRepository: HakemusRepository, paatosRepository: PaatosRepository) extends TutuJsonFormats {
  val LOG: Logger = LoggerFactory.getLogger(classOf[PaatosService])

  def haePaatos(hakemusOid: HakemusOid): Option[Paatos] = {
    hakemusRepository.haeHakemus(hakemusOid).flatMap { dbHakemus =>
      paatosRepository.haePaatos(dbHakemus.id).flatMap { paatos =>
        {
          paatosRepository.haePaatosTiedot(paatos.id.get) match {
            case paatostiedot if paatostiedot.nonEmpty =>
              Some(
                paatos.copy(paatosTiedot = Some(paatostiedot))
              )
            case _ => Some(paatos)
          }
        }
      }
    }
  }

  def tallennaPaatos(
    hakemusOid: HakemusOid,
    partialPaatos: PartialPaatos,
    luojaTaiMuokkaaja: String
  ): (Option[Paatos], Option[Paatos]) = {
    val dbHakemus     = hakemusRepository.haeHakemus(hakemusOid)
    val currentPaatos = dbHakemus.flatMap(h => paatosRepository.haePaatos(h.id))
    val updatedPaatos = dbHakemus match {
      case Some(dbHakemus) =>
        val latestSavedPaatos = currentPaatos match {
          case Some(existing) =>
            paatosRepository.tallennaPaatos(dbHakemus.id, existing.mergeWith(partialPaatos), luojaTaiMuokkaaja)
          case _ =>
            paatosRepository.tallennaPaatos(
              dbHakemus.id,
              Paatos().mergeWith(partialPaatos).copy(hakemusId = Some(dbHakemus.id)),
              luojaTaiMuokkaaja
            )
        }

        val currentPaatosTiedot   = paatosRepository.haePaatosTiedot(latestSavedPaatos.id.orNull)
        val paatosTietoModifyData =
          HakemusModifyOperationResolver
            .resolvePaatosTietoModifyOperations(currentPaatosTiedot, partialPaatos.paatosTiedot) match {
            case PaatosTietoModifyData(uudet, muutetut, poistetut) =>
              PaatosTietoModifyData(uudet, muutetut, poistetut)
            case null => PaatosTietoModifyData()
          }

        paatosRepository.suoritaPaatosTietojenModifiointi(
          latestSavedPaatos.id.orNull,
          paatosTietoModifyData,
          luojaTaiMuokkaaja
        )

        val newlySavedPaatosTiedot =
          paatosRepository.haePaatosTiedot(latestSavedPaatos.id.orNull)

        Some(
          latestSavedPaatos.copy(
            paatosTiedot =
              if (newlySavedPaatosTiedot.nonEmpty)
                Some(newlySavedPaatosTiedot)
              else
                latestSavedPaatos.paatosTiedot
          )
        )
      case _ => None
    }
    (currentPaatos, updatedPaatos)
  }
}
