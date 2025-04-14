package fi.oph.tutu.backend.service

import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Value

class KayttooikeusService(httpService: HttpService) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[KayttooikeusService])

  @Value("${opintopolku.virkailija.url}")
  val opintopolku_virkailija_domain: String = null
}
