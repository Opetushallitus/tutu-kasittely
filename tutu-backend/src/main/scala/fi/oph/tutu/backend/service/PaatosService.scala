package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{HakemusOid, Paatos, PartialPaatos}
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
      paatosRepository.haePaatos(dbHakemus.id)
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
        val paatos = currentPaatos match {
          case Some(existing) => existing.mergeWith(partialPaatos)
          case _              => Paatos().mergeWith(partialPaatos).copy(hakemusId = Some(dbHakemus.id))
        }
        Some(paatosRepository.tallennaPaatos(dbHakemus.id, paatos, luojaTaiMuokkaaja))
      case _ => None
    }
    (currentPaatos, updatedPaatos)
  }
}
