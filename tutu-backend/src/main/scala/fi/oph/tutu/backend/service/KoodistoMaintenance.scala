package fi.oph.tutu.backend.service

import org.slf4j.{Logger, LoggerFactory}
import org.springframework.context.annotation.Profile
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

@Profile(Array("!test"))
@Component
class KoodistoMaintenance(koodistoService: KoodistoService) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[KoodistoMaintenance])

  @Scheduled(fixedRateString = "${caching.spring.dayTTL}")
  def dailySyncMaakoodit(): Unit = {
    LOG.info("Maatjavaltiot2 sync attempt")
    koodistoService.getKoodisto("maatjavaltiot2")
    LOG.info("Maatjavaltiot2 sync done")
  }
}
