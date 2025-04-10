package fi.oph.tutu.backend.service

import fi.vm.sade.javautils.nio.cas.CasClient
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.stereotype.Component

@Component
class HakemuspalveluService {
  val LOG: Logger = LoggerFactory.getLogger(classOf[HakemuspalveluService])

  @Value("${opintopolku.virkailija.url}")
  val opintopolku_virkailija_domain: String = null

  @Autowired
  private val client: CasClient = null
}
