package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.{HakemusRepository, PaatosRepository}
import fi.oph.tutu.backend.utils.TutuJsonFormats
import org.json4s.jackson.JsonMethods.parse
import org.json4s.jvalue2extractable
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}

@Component
@Service
class PaatosService(
  hakemusRepository: HakemusRepository,
  paatosRepository: PaatosRepository,
  hakemuspalveluService: HakemuspalveluService,
  ataruLomakeParser: AtaruLomakeParser
) extends TutuJsonFormats {
  val LOG: Logger = LoggerFactory.getLogger(classOf[PaatosService])

  def haePaatos(hakemusOid: HakemusOid, formId: Long): Option[Paatos] = {
    hakemusRepository.haeHakemus(hakemusOid).flatMap { dbHakemus =>
      paatosRepository.haePaatos(dbHakemus.id).flatMap { paatos =>
        {
          val paatosTietoOptions = hakemuspalveluService.haeLomake(formId) match {
            case Right(response: String) =>
              Some(ataruLomakeParser.parsePaatosTietoOptions(parse(response).extract[AtaruLomake]))
            case Left(error) =>
              LOG.error(s"Lomakkeeen $formId haku epäonnistui hakemuspalvelusta: ${error.getMessage}")
              None
          }

          paatosRepository.haePaatosTiedot(paatos.id.get) match {
            case paatostiedot if paatostiedot.nonEmpty =>
              val paatostiedotWithRinnastettavatTutkinnotTaiOpinnot = paatostiedot.map { paatosTieto =>
                paatosRepository.haeTutkinnotTaiOpinnot(paatosTieto.id.get) match {
                  case tutkinnotTaiOpinnot if tutkinnotTaiOpinnot.nonEmpty =>
                    paatosTieto.copy(rinnastettavatTutkinnotTaiOpinnot = tutkinnotTaiOpinnot)
                  case _ => paatosTieto
                }
              }
              val paatostiedotWithAllData = paatostiedotWithRinnastettavatTutkinnotTaiOpinnot.map { paatosTieto =>
                paatosRepository.haeKelpoisuudet(paatosTieto.id.get) match {
                  case kelpoisuudet if kelpoisuudet.nonEmpty =>
                    paatosTieto.copy(kelpoisuudet = kelpoisuudet)
                  case _ => paatosTieto
                }
              }
              Some(
                paatos.copy(
                  paatosTiedot = paatostiedotWithAllData,
                  paatosTietoOptions = paatosTietoOptions
                )
              )
            case _ =>
              Some(
                paatos.copy(paatosTietoOptions = paatosTietoOptions)
              )
          }
        }
      }
    }
  }

  def tallennaPaatos(
    hakemusOid: HakemusOid,
    formId: Long,
    paatos: Paatos,
    luojaTaiMuokkaaja: String
  ): (Option[Paatos], Option[Paatos]) = {
    val dbHakemus     = hakemusRepository.haeHakemus(hakemusOid)
    val currentPaatos = dbHakemus.flatMap(h => paatosRepository.haePaatos(h.id))
    val updatedPaatos = dbHakemus match {
      case Some(dbHakemus) =>
        val latestSavedPaatos = paatosRepository.tallennaPaatos(
          dbHakemus.id,
          paatos.copy(hakemusId = Some(dbHakemus.id)),
          luojaTaiMuokkaaja
        )

        val currentPaatosTiedot = haePaatos(hakemusOid, formId) match {
          case Some(paatos) => paatos.paatosTiedot
          case None         => Nil
        }
        val paatosTietoModifyData =
          HakemusModifyOperationResolver
            .resolvePaatosTietoModifyOperations(currentPaatosTiedot, paatos.paatosTiedot) match {
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
            paatosTiedot = if (newlySavedPaatosTiedot.nonEmpty) {
              newlySavedPaatosTiedot.map(paatosTieto =>
                paatosTieto.copy(
                  rinnastettavatTutkinnotTaiOpinnot = paatosRepository.haeTutkinnotTaiOpinnot(paatosTieto.id.get),
                  kelpoisuudet = paatosRepository.haeKelpoisuudet(paatosTieto.id.get)
                )
              )
            } else
              latestSavedPaatos.paatosTiedot
          )
        )
      case _ => None
    }
    (currentPaatos, updatedPaatos)
  }
}
