package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
// import fi.oph.tutu.backend.repository.{MuistioRepository}
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
  // muistioRepository: MuistioRepository,
  hakemusService: HakemusService
) extends TutuJsonFormats {
  val LOG: Logger = LoggerFactory.getLogger(classOf[MuistioService])

  // muistioService.haeMuistio(hakemusId, hakemuksenOsa, sisainen)
  def haeMuistio(
    hakemusId: String,
    hakemuksenOsa: String,
    sisainen: Boolean
  ): Option[Muistio] = {
    Some(
      Muistio(
        id = UUID.randomUUID,
        hakemus_id = UUID.fromString(hakemusId),
        sisalto = "test",
        luotu = LocalDateTime.now,
        luoja = "",
        muokattu = None,
        muokkaaja = "",
        sisainenHuomio = sisainen,
        hakemuksenOsa = HakemuksenOsa.valueOf(hakemuksenOsa)
      )
    )
  }

  // val muistioId = muistioService.tallennaMuistio(hakemusOid, hakemuksenOsa, muistioPostBody)
  def tallennaMuistio(
    hakemusOid: String,
    hakemuksenOsa: String,
    muistioPostBody: MuistioPostBody
  ): UUID = {
    UUID.randomUUID
  }
}
