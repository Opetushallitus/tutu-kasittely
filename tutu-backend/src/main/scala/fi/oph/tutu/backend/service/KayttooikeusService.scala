package fi.oph.tutu.backend.service

import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Value

class KayttooikeusService(httpService: HttpService) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[KayttooikeusService])

  @Value("${opintopolku.virkailija.url}")
  val opintopolku_virkailija_domain: String = null

  def getEsittelijat: Either[Throwable, String] = {
    val id = "TODO TUTUKASITTELIJAKAYTTOOIKEUSRYHMA ID"
    httpService.get(s"$opintopolku_virkailija_domain/kayttooikeus-service/kayttooikeusryhma/$id/henkilot") match {
      case Left(error: Throwable) => Left(error)
      case Right(response: String) => Right(response)
    }
  }

}
