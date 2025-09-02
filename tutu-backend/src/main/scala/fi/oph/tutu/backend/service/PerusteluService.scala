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
          perusteluRepository.haePerusteluUoRo(perustelu.id) match {
            case Some(perusteluUoRo) =>
              Some(perustelu.copy(perusteluUoRo = Some(perusteluUoRo)))
            case _ => Some(perustelu)
          }
        }
      }
  }

  def tallennaPerustelu(
    hakemusOid: HakemusOid,
    perustelu: Perustelu,
    luoja: String
  ): Option[Perustelu] = {
    hakemusRepository
      .haeHakemus(hakemusOid)
      .flatMap((dbHakemus: DbHakemus) => {
        perusteluRepository.tallennaPerustelu(
          dbHakemus.id,
          perustelu,
          luoja
        )
        perusteluRepository.haePerustelu(dbHakemus.id) match {
          case None                       => None
          case Some(tallennettuPerustelu) => {
            perustelu.perusteluUoRo match {
              case None                               => Some(tallennettuPerustelu)
              case Some(perusteluUoRo: PerusteluUoRo) => {
                val tallennettuPerusteluUoRo =
                  perusteluRepository.tallennaPerusteluUoRo(tallennettuPerustelu.id, perusteluUoRo, luoja)
                Some(tallennettuPerustelu.copy(perusteluUoRo = Some(tallennettuPerusteluUoRo)))
              }
            }
          }
        }
      })
  }
}
