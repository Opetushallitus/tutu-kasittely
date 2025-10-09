package fi.oph.tutu.backend.service

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.TutuBackendApplication.CALLER_ID
import fi.oph.tutu.backend.domain.OnrUser
import fi.vm.sade.javautils.nio.cas.{CasClient, CasClientBuilder, CasConfig}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.{CacheEvict, CachePut, Cacheable}
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.{Component, Service}

case class OnrServiceException(message: String = "", cause: Throwable = null) extends RuntimeException(message, cause)

@Component
@Service
class OnrService(httpService: HttpService) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[OnrService])

  @Value("${opintopolku.virkailija.url}")
  val opintopolku_virkailija_domain: String = null

  @Value("${tutu.backend.cas.username}")
  val cas_username: String = null

  @Value("${tutu.backend.cas.password}")
  val cas_password: String = null

  @Autowired
  val cacheManager: CacheManager = null

  private lazy val onrCasClient: CasClient = CasClientBuilder.build(
    CasConfig
      .CasConfigBuilder(
        cas_username,
        cas_password,
        s"$opintopolku_virkailija_domain/cas",
        s"$opintopolku_virkailija_domain/oppijanumerorekisteri-service",
        CALLER_ID,
        CALLER_ID,
        "/j_spring_cas_security_check"
      )
      .setJsessionName("JSESSIONID")
      .build()
  )

  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)

  @Cacheable(value = Array("asiointikieli"))
  def haeAsiointikieli(personOid: String): Either[Throwable, String] = {
    LOG.info("Fetching asiointikieli from oppijanumerorekisteri")
    httpService.get(
      onrCasClient,
      s"$opintopolku_virkailija_domain/oppijanumerorekisteri-service/henkilo/$personOid/asiointiKieli"
    ) match {
      case Left(e)  => Left(OnrServiceException("", e))
      case Right(o) => Right(o)
    }
  }

  @Cacheable(value = Array("henkilo"))
  def haeHenkilo(personOid: String): Either[Throwable, OnrUser] = {
    LOG.info("Fetching henkilö from oppijanumerorekisteri")
    httpService.get(
      onrCasClient,
      s"$opintopolku_virkailija_domain/oppijanumerorekisteri-service/henkilo/$personOid"
    ) match {
      case Left(e) =>
        LOG.error(s"Error fetching henkilo with OID: $personOid from oppijanumerorekisteri: ${e.getMessage}")
        Left(OnrServiceException("", e))
      case Right(response) => Right(mapper.readValue(response, classOf[OnrUser]))
    }
  }

  @CacheEvict(value = Array("asiointikieli"), allEntries = true)
  @Scheduled(fixedRateString = "${caching.spring.dayTTL}")
  def emptyAsiointikieliCache(): Unit =
    LOG.info("Emptying asiointikieli cache")

  @CachePut(Array("asiointikieli"))
  private def updateCached(personOid: String, value: String): Unit = {
    val asiointikieliCache = cacheManager.getCache("asiointikieli")
    asiointikieliCache.put(personOid, value)
  }

  @CacheEvict(value = Array("henkilo"), allEntries = true)
  @Scheduled(fixedRateString = "${caching.spring.dayTTL}")
  def emptyHenkiloCache(): Unit =
    LOG.info("Emptying henkilo cache")

  @CachePut(Array("henkilo"))
  private def updateCached(personOid: String, value: OnrUser): Unit = {
    val henkiloCache = cacheManager.getCache("henkilo")
    henkiloCache.put(personOid, value)
  }
}
