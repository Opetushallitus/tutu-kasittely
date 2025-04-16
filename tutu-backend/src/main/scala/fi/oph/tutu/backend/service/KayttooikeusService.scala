package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.TutuBackendApplication.CALLER_ID
import fi.vm.sade.javautils.nio.cas.{CasClient, CasClientBuilder, CasConfig}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.{Component, Service}

@Component
@Service
class KayttooikeusService(httpService: HttpService) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[KayttooikeusService])

  @Value("${opintopolku.virkailija.url}")
  val opintopolku_virkailija_domain: String = null

  @Value("${tutu-backend.cas.username}")
  val cas_username: String = null

  @Value("${tutu-backend.cas.password}")
  val cas_password: String = null

  lazy private val kayttooikeusCasClient: CasClient = CasClientBuilder.build(
    CasConfig
      .CasConfigBuilder(
        cas_username,
        cas_password,
        s"$opintopolku_virkailija_domain/cas",
        s"$opintopolku_virkailija_domain/kayttooikeus-service",
        CALLER_ID,
        CALLER_ID,
        "/j_spring_cas_security_check"
      )
      .setJsessionName("JSESSIONID")
      .build()
  )

  def getEsittelijat: Either[Throwable, String] = {
    val TUTU_ESITTELIJA_KAYTTOOIKEUSRYHMA_ID = "TODO TUTUKASITTELIJAKAYTTOOIKEUSRYHMA ID"
    httpService.get(
      kayttooikeusCasClient,
      s"$opintopolku_virkailija_domain/kayttooikeus-service/kayttooikeusryhma/$TUTU_ESITTELIJA_KAYTTOOIKEUSRYHMA_ID/henkilot"
    ) match {
      case Left(error: Throwable)  => Left(error)
      case Right(response: String) => Right(response)
    }
  }

}
