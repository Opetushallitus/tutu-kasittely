package fi.oph.tutu.backend.service

import org.slf4j.{Logger, LoggerFactory}
import org.springframework.context.annotation.Profile
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

@Profile(Array("!test"))
@Component
class TranslationMaintenance(
  translationService: TranslationService,
  hakemuspalveluService: HakemuspalveluService,
  onrService: OnrService
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[TranslationMaintenance])

  @Scheduled(fixedRateString = "${caching.spring.hourTTL}")
  def hourlyRefresh(): Unit = {
    LOG.info("Päivitetään käännösvälimuisti")
    translationService.loadAllIntoCache()
  }
}
