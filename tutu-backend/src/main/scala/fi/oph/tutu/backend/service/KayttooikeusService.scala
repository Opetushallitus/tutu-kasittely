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

case class KayttooikeusServiceException(message: String = "", cause: Throwable = null)
    extends RuntimeException(message, cause)

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

  @Value("${tutu-backend.esittelija.kayttooikeusryhma.ids}")
  val esittelija_kayttooikeusryhma_ids: String = null

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
    val ids: Seq[String] = esittelija_kayttooikeusryhma_ids.split(",").toSeq
    var esittelija_oidit = Seq.empty[String]

    ids.foreach { kayttooikeusRyhmaId =>
      httpService.get(
        kayttooikeusCasClient,
        s"$opintopolku_virkailija_domain/kayttooikeus-service/kayttooikeusryhma/$kayttooikeusRyhmaId/henkilot"
      ) match {
        case Left(error: Throwable) => Left(KayttooikeusServiceException("", error))
        case Right(response: String) =>
          val oids = mapper.readValue(response, classOf[PersonOids]).personOids.toSeq
          esittelija_oidit ++= oids
      }
    }
    Right(esittelija_oidit)
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
