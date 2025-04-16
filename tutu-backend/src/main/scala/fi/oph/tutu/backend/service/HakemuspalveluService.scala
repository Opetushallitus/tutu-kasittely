package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.TutuBackendApplication.CALLER_ID
import fi.vm.sade.javautils.nio.cas.{CasClient, CasClientBuilder, CasConfig}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.{Component, Service}

@Component
@Service
class HakemuspalveluService(httpService: HttpService) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[HakemuspalveluService])

  @Value("${opintopolku.virkailija.url}")
  val opintopolku_virkailija_domain: String = null

  @Value("${tutu-backend.cas.username}")
  val cas_username: String = null

  @Value("${tutu-backend.cas.password}")
  val cas_password: String = null

  lazy private val hakemuspalveluCasClient: CasClient = CasClientBuilder.build(
    CasConfig
      .CasConfigBuilder(
        cas_username,
        cas_password,
        s"$opintopolku_virkailija_domain/cas",
        s"$opintopolku_virkailija_domain/lomake-editori",
        CALLER_ID,
        CALLER_ID,
        "/auth/cas"
      )
      .setJsessionName("ring-session")
      .build()
  )

  def getHakemus(hakemusOid: String): Either[Throwable, String] = {
    httpService.get(
      hakemuspalveluCasClient,
      s"$opintopolku_virkailija_domain/lomake-editori/api/applications/$hakemusOid"
    ) match {
      case Left(error: Throwable)  => Left(error)
      case Right(response: String) => Right(response)
    }
  }
}
