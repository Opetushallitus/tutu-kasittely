package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.{HakemusRepository, PerusteluRepository}
import fi.oph.tutu.backend.utils.Constants.*
import fi.oph.tutu.backend.utils.TutuJsonFormats
import org.json4s.*
import org.json4s.jackson.JsonMethods.*
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
      .flatMap((dbHakemus: DbHakemus) => {
        perusteluRepository.haePerustelu(dbHakemus.id)
      })
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
        perusteluRepository.haePerustelu(dbHakemus.id)
      })
  }
}
