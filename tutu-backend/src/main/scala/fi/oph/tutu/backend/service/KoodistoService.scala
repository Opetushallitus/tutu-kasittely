package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.TutuBackendApplication.CALLER_ID
import fi.vm.sade.javautils.nio.cas.{CasClient, CasClientBuilder, CasConfig}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Value

class KoodistoService(httpService: HttpService) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[KoodistoService])

  @Value("${opintopolku.virkailija.url}")
  val opintopolku_virkailija_domain: String = null

  @Value("${tutu-backend.cas.username}")
  val cas_username: String = null

  @Value("${tutu-backend.cas.password}")
  val cas_password: String = null

  private val koodistoCasClient: CasClient = CasClientBuilder.build(
    CasConfig
      .CasConfigBuilder(
        cas_username,
        cas_password,
        s"$opintopolku_virkailija_domain/cas",
        s"$opintopolku_virkailija_domain/koodisto-service",
        CALLER_ID,
        CALLER_ID,
        "/j_spring_cas_security_check"
      )
      .setJsessionName("JSESSIONID")
      .build()
  )

  def getKoodisto(koodisto: String): Either[Throwable, String] = {
    httpService.get(koodistoCasClient, s"$opintopolku_virkailija_domain/koodisto-service/rest/codes/$koodisto") match {
      case Left(error: Throwable)  => Left(error)
      case Right(response: String) => Right(response)
    }
  }
}
