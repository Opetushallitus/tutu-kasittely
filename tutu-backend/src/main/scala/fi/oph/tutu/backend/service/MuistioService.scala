package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.{HakemusRepository, MuistioRepository}
import fi.oph.tutu.backend.utils.Constants.*
import fi.oph.tutu.backend.utils.TutuJsonFormats
import org.json4s.*
import org.json4s.jackson.JsonMethods.*
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.UUID

@Component
@Service
class MuistioService(
  hakemusRepository: HakemusRepository,
  muistioRepository: MuistioRepository,
  hakemusService: HakemusService
) extends TutuJsonFormats {
  val LOG: Logger = LoggerFactory.getLogger(classOf[MuistioService])

  def haeMuistio(
    hakemusOid: HakemusOid,
    hakemuksenOsa: HakemuksenOsa,
    sisainen: Boolean
  ): Option[Muistio] = {
    hakemusRepository
      .haeHakemus(hakemusOid)
      .flatMap((dbHakemus: DbHakemus) => {
        muistioRepository.haeMuistio(
          dbHakemus.id,
          hakemuksenOsa,
          sisainen
        )
      })
  }

  // val muistioId = muistioService.tallennaMuistio(hakemusOid, hakemuksenOsa, muistioPostBody)
  def tallennaMuistio(
    hakemusOid: HakemusOid,
    hakemuksenOsa: HakemuksenOsa,
    sisainen: Boolean,
    sisalto: String,
    luoja: String
  ): Option[UUID] = {
    hakemusRepository
      .haeHakemus(hakemusOid)
      .map((dbHakemus: DbHakemus) => {
        muistioRepository.tallennaMuistio(
          dbHakemus.id,
          hakemuksenOsa,
          sisainen,
          sisalto,
          luoja
        )
      })
  }
}
