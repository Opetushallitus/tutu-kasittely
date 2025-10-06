package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.{HakemusRepository, PerusteluRepository}
import fi.oph.tutu.backend.utils.TutuJsonFormats
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}

@Component
@Service
class PerusteluService(
  hakemusRepository: HakemusRepository,
  perusteluRepository: PerusteluRepository
) extends TutuJsonFormats {
  val LOG: Logger = LoggerFactory.getLogger(classOf[PerusteluService])

  def haePerustelu(
    hakemusOid: HakemusOid
  ): Option[Perustelu] = {
    hakemusRepository
      .haeHakemus(hakemusOid)
      .flatMap { dbHakemus =>
        perusteluRepository.haePerustelu(dbHakemus.id).flatMap { perustelu =>
          {
            perusteluRepository.haeLausuntopyynnot(perustelu.id.get) match {
              case lausuntoPyynnot if lausuntoPyynnot.nonEmpty =>
                Some(
                  perustelu.copy(lausuntopyynnot = lausuntoPyynnot)
                )
              case _ => Some(perustelu)
            }
          }
        }
      }
  }

  def tallennaPerustelu(
    hakemusOid: HakemusOid,
    partialPerustelu: PartialPerustelu,
    luojaTaiMuokkaaja: String
  ): (Option[Perustelu], Option[Perustelu]) = {
    val dbHakemus        = hakemusRepository.haeHakemus(hakemusOid)
    val currentPerustelu = dbHakemus.flatMap(h => perusteluRepository.haePerustelu(h.id))
    val newPerustelu     = dbHakemus match {
      case Some(dbHakemus) =>
        val latestSavedPerustelu = currentPerustelu match {
          case Some(existing) =>
            perusteluRepository.tallennaPerustelu(dbHakemus.id, existing.mergeWith(partialPerustelu), luojaTaiMuokkaaja)
          case _ =>
            perusteluRepository.tallennaPerustelu(
              dbHakemus.id,
              Perustelu().mergeWith(partialPerustelu).copy(hakemusId = Some(dbHakemus.id)),
              luojaTaiMuokkaaja
            )
        }
        val currentLausuntopyynnot   = perusteluRepository.haeLausuntopyynnot(latestSavedPerustelu.id.orNull)
        val lausuntopyyntoModifyData =
          HakemusModifyOperationResolver
            .resolveLausuntopyyntoModifyOperations(currentLausuntopyynnot, partialPerustelu.lausuntopyynnot) match {
            case LausuntopyyntoModifyData(uudet, muutetut, poistetut) =>
              LausuntopyyntoModifyData(uudet, muutetut, poistetut)
            case null => LausuntopyyntoModifyData()
          }

        perusteluRepository.suoritaLausuntopyyntojenModifiointi(
          latestSavedPerustelu.id.orNull,
          lausuntopyyntoModifyData,
          luojaTaiMuokkaaja
        )

        val newlySavedLausuntoPyynnot =
          perusteluRepository.haeLausuntopyynnot(latestSavedPerustelu.id.orNull)

        Some(
          latestSavedPerustelu.copy(
            lausuntopyynnot =
              if (newlySavedLausuntoPyynnot.nonEmpty)
                newlySavedLausuntoPyynnot
              else
                latestSavedPerustelu.lausuntopyynnot
          )
        )
      case _ => None
    }
    (currentPerustelu, newPerustelu)
  }
}
