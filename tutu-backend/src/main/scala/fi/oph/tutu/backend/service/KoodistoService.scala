package fi.oph.tutu.backend.service

import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Value

class KoodistoService(httpService: HttpService) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[KoodistoService])

  @Value("${opintopolku.virkailija.url}")
  val opintopolku_virkailija_domain: String = null

  def getKoodisto(koodisto: String): Either[Throwable, String] = {
    httpService.get(s"$opintopolku_virkailija_domain/koodisto-service/rest/codes/$koodisto") match {
      case Left(error: Throwable) => Left(error)
      case Right(response: String) => Right(response)
    }
  }
}
