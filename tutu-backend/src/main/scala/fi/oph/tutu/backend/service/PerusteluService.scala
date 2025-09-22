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
            val withUoRo = perusteluRepository.haePerusteluUoRo(perustelu.id.get) match {
              case Some(perusteluUoRo) =>
                Some(perustelu.copy(perusteluUoRo = Some(perusteluUoRo)))
              case _ => Some(perustelu)
            }
            withUoRo.flatMap { withUoRo =>
              perusteluRepository.haeLausuntopyynnot(perustelu.id.get) match {
                case lausuntoPyynnot if lausuntoPyynnot.nonEmpty =>
                  Some(
                    withUoRo.copy(lausuntopyynnot = lausuntoPyynnot)
                  )
                case _ => Some(withUoRo)
              }
            }
          }
        }
      }
  }

  def tallennaPerustelu(
    hakemusOid: HakemusOid,
    partialPerustelu: PartialPerustelu,
    luojaTaiMuokkaaja: String
  ): Option[Perustelu] = {
    hakemusRepository
      .haeHakemus(hakemusOid)
      .flatMap((dbHakemus: DbHakemus) => {
        val currentPerustelu     = perusteluRepository.haePerustelu(dbHakemus.id)
        val latestSavedPerustelu = currentPerustelu match {
          case Some(existing) if partialPerustelu.topLevelFieldsModified() =>
            perusteluRepository.tallennaPerustelu(dbHakemus.id, existing.mergeWith(partialPerustelu), luojaTaiMuokkaaja)
          case Some(existing) => existing
          case _              =>
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
            case _ => LausuntopyyntoModifyData()
          }

        perusteluRepository.suoritaLausuntopyyntojenModifiointi(
          latestSavedPerustelu.id.orNull,
          lausuntopyyntoModifyData,
          luojaTaiMuokkaaja
        )

        val newlySavedLausuntoPyynnot =
          perusteluRepository.haeLausuntopyynnot(latestSavedPerustelu.id.orNull)

        val newlySavedPerustelyUoRo = partialPerustelu.perusteluUoRo.flatMap(uoRo => {
          val newOrUpdatedUoRo = perusteluRepository.haePerusteluUoRo(latestSavedPerustelu.id.get) match {
            case Some(existing) => existing.mergeWith(uoRo)
            case _              =>
              PerusteluUoRo()
                .mergeWith(uoRo)
                .copy(perusteluId = latestSavedPerustelu.id)
          }
          Some(
            perusteluRepository.tallennaPerusteluUoRo(latestSavedPerustelu.id.get, newOrUpdatedUoRo, luojaTaiMuokkaaja)
          )
        })
        Some(
          latestSavedPerustelu.copy(
            lausuntopyynnot =
              if (newlySavedLausuntoPyynnot.nonEmpty)
                newlySavedLausuntoPyynnot
              else
                latestSavedPerustelu.lausuntopyynnot,
            perusteluUoRo = newlySavedPerustelyUoRo.orElse(latestSavedPerustelu.perusteluUoRo)
          )
        )
      })
  }
}
