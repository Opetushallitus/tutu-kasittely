package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.TutuBackendApplication.CALLER_ID
import fi.vm.sade.javautils.nio.cas.{CasClient, CasClientBuilder, CasConfig}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.{CacheEvict, CachePut, Cacheable}
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.{Component, Service}

@Component
@Service
class KoodistoService(httpService: HttpService) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[KoodistoService])

  @Value("${opintopolku.virkailija.url}")
  val opintopolku_virkailija_domain: String = null

  @Value("${tutu-backend.cas.username}")
  val cas_username: String = null

  @Value("${tutu-backend.cas.password}")
  val cas_password: String = null

  @Autowired
  val cacheManager: CacheManager = null

  lazy private val koodistoCasClient: CasClient = CasClientBuilder.build(
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
      .setJsessionName("SESSION")
      .build()
  )

  @Cacheable(value = Array("koodisto"))
  def getKoodisto(koodisto: String): Either[Throwable, String] = {
    httpService.get(koodistoCasClient, s"$opintopolku_virkailija_domain/koodisto-service/rest/json/$koodisto/koodi") match {
      case Left(error: Throwable)  => Left(error)
      case Right(response: String) => Right(response)
    }
  }

  @CacheEvict(value = Array("koodisto"), allEntries = true)
  @Scheduled(fixedRateString = "${caching.spring.dayTTL}")
  def emptyKoodistoCache(): Unit = {
    LOG.info("Emptying koodisto-cache")
  }

  @CachePut(Array("koodisto"))
  private def updateCached(koodisto: String, value: String): Unit = {
    val koodistoCache = cacheManager.getCache("koodisto")
    koodistoCache.put(koodisto, value)
  }
}


