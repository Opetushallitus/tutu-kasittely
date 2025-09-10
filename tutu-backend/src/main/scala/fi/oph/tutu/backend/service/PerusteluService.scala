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
              perusteluRepository.haeLausuntotieto(perustelu.id.get) match {
                case Some(lausuntotieto) =>
                  val lausuntopyynnot = perusteluRepository.haeLausuntopyynnot(lausuntotieto.id.orNull)
                  Some(
                    withUoRo.copy(
                      lausuntotieto = Some(lausuntotieto.copy(lausuntopyynnot = lausuntopyynnot))
                    )
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
        val newlySavedLausuntotieto = partialPerustelu.lausuntotieto.flatMap(lausuntotieto => {
          val currentLausuntotieto   = perusteluRepository.haeLausuntotieto(latestSavedPerustelu.id.get)
          val currentLausuntopyynnot =
            currentLausuntotieto.map(lt => perusteluRepository.haeLausuntopyynnot(lt.id.orNull)).getOrElse(Seq())
          val newOrUpdatedLausuntotieto = currentLausuntotieto match {
            case Some(existing) => existing.mergeWith(lausuntotieto)
            case _              => Lausuntotieto().mergeWith(lausuntotieto).copy(perusteluId = latestSavedPerustelu.id)
          }
          val dbLausuntotieto =
            perusteluRepository
              .tallennaLausuntotieto(latestSavedPerustelu.id.get, newOrUpdatedLausuntotieto, luojaTaiMuokkaaja)
          val lausuntopyyntoModifyData = lausuntotieto.lausuntopyynnot
            .map(pyynnot =>
              HakemusModifyOperationResolver.resolveLausuntopyyntoModifyOperations(currentLausuntopyynnot, pyynnot)
            )
            .getOrElse(LausuntopyyntoModifyData())
          perusteluRepository.suoritaLausuntopyyntojenModifiointi(
            dbLausuntotieto.id.orNull,
            lausuntopyyntoModifyData,
            luojaTaiMuokkaaja
          )
          Some(
            dbLausuntotieto.copy(lausuntopyynnot = perusteluRepository.haeLausuntopyynnot(dbLausuntotieto.id.orNull))
          )
        })
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
            lausuntotieto = newlySavedLausuntotieto.orElse(latestSavedPerustelu.lausuntotieto),
            perusteluUoRo = newlySavedPerustelyUoRo.orElse(latestSavedPerustelu.perusteluUoRo)
          )
        )
      })
  }
}
