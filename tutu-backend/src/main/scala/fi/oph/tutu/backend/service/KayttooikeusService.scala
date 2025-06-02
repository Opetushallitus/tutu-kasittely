package fi.oph.tutu.backend.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.TutuBackendApplication.CALLER_ID
import fi.oph.tutu.backend.domain.UserOid
import fi.vm.sade.javautils.nio.cas.{CasClient, CasClientBuilder, CasConfig}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.{CacheEvict, CachePut}
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.{Component, Service}

case class PersonOids(personOids: Seq[String])

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

  @Autowired
  val cacheManager: CacheManager = null

  private lazy val kayttooikeusCasClient: CasClient = CasClientBuilder.build(
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

  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)

  def haeEsittelijat: Either[Throwable, Seq[String]] = {
    // TODO PARAMETRISOINTI: TUTU_ESITTELIJA_KAYTTOOIKEUSRYHMA_ID
    val TUTU_ESITTELIJA_KAYTTOOIKEUSRYHMA_ID = 71713274
    httpService.get(
      kayttooikeusCasClient,
      s"$opintopolku_virkailija_domain/kayttooikeus-service/kayttooikeusryhma/$TUTU_ESITTELIJA_KAYTTOOIKEUSRYHMA_ID/henkilot"
    ) match {
      case Left(error: Throwable) => Left(error)
      case Right(response: String) => {
        val oidit = mapper.readValue(response, classOf[PersonOids]).personOids.toSeq
        Right(oidit)
      }
    }
  }

  @CacheEvict(value = Array("esittelijat"), allEntries = true)
  @Scheduled(fixedRateString = "${caching.spring.dayTTL}")
  def emptyEsittelijatCache(): Unit =
    LOG.info("Emptying esittelijat cache")

  @CachePut(Array("esittelijat"))
  private def updateCached(kayttooikeusRyhmaId: String, value: Seq[UserOid]): Unit = {
    val esittelijatCache = cacheManager.getCache("esittelijat")
    esittelijatCache.put(kayttooikeusRyhmaId, value)
  }
}
