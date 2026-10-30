package fi.oph.tutu.backend.service

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.domain.OnrUser
import fi.oph.tutu.backend.service.oauth.Oauth2Client
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.{CacheEvict, CachePut, Cacheable}
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.{Component, Service}

case class OnrServiceException(message: String = "", cause: Throwable = null) extends RuntimeException(message, cause)

@Component
@Service
class OnrService(oauth2Client: Oauth2Client, httpService: HttpService, mapper: ObjectMapper) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[OnrService])

  @Value("${opintopolku.virkailija.url}")
  val opintopolku_virkailija_domain: String = null

  @Autowired
  val cacheManager: CacheManager = null

  @Cacheable(value = Array("asiointikieli"))
  def haeAsiointikieli(personOid: String): Either[Throwable, String] = {
    LOG.info("Fetching asiointikieli from oppijanumerorekisteri")
    httpService.get(
      oauth2Client,
      s"$opintopolku_virkailija_domain/oppijanumerorekisteri-service/henkilo/$personOid/asiointiKieli"
    ) match {
      case Left(e)  => Left(OnrServiceException("", e))
      case Right(o) => Right(o)
    }
  }

  @Cacheable(value = Array("henkilo"))
  def haeHenkilo(personOid: String): Either[Throwable, OnrUser] = {
    LOG.info(s"Fetching henkilö from oppijanumerorekisteri $personOid")
    httpService.get(
      oauth2Client,
      s"$opintopolku_virkailija_domain/oppijanumerorekisteri-service/henkilo/$personOid"
    ) match {
      case Left(e) =>
        LOG.error(s"Error fetching henkilo with OID: $personOid from oppijanumerorekisteri: ${e.getMessage}")
        Left(OnrServiceException("", e))
      case Right(response) => Right(mapper.readValue(response, classOf[OnrUser]))
    }
  }

  def haeHenkilot(personOids: Seq[String]): Either[Throwable, Seq[OnrUser]] = {
    val henkiloCache = cacheManager.getCache("henkilo")
    val oids         = personOids.distinct
    val cached       = oids.flatMap(oid => Option(henkiloCache.get(oid, classOf[OnrUser])))
    val cachedOids   = cached.map(_.oidHenkilo).toSet
    val missingOids  = oids.filterNot(cachedOids.contains)

    if (missingOids.isEmpty) {
      Right(cached)
    } else {
      LOG.info(s"Fetching ${missingOids.size} henkilö(s) from oppijanumerorekisteri")
      httpService.post(
        oauth2Client,
        s"$opintopolku_virkailija_domain/oppijanumerorekisteri-service/henkilo/henkilotByHenkiloOidList",
        mapper.writeValueAsString(missingOids.toArray)
      ) match {
        case Left(e) =>
          LOG.error(
            s"Error fetching henkilot with OIDs: ${missingOids.mkString(", ")} from oppijanumerorekisteri: ${e.getMessage}"
          )
          Left(OnrServiceException("", e))
        case Right(response) =>
          try {
            val fetched = mapper.readValue(response, classOf[Array[OnrUser]]).toSeq
            fetched.foreach(henkilo => henkiloCache.put(henkilo.oidHenkilo, henkilo))
            Right(cached ++ fetched)
          } catch {
            case e: Exception =>
              LOG.error(s"Error parsing henkilot response from oppijanumerorekisteri: ${e.getMessage}")
              Left(OnrServiceException("", e))
          }
      }
    }
  }

  @CacheEvict(value = Array("asiointikieli"), allEntries = true)
  @Scheduled(fixedRateString = "${caching.spring.dayTTL}")
  def emptyAsiointikieliCache(): Unit =
    LOG.info("Emptying asiointikieli cache")

  @CachePut(Array("asiointikieli"))
  def updateCached(personOid: String, value: String): Unit = {
    val asiointikieliCache = cacheManager.getCache("asiointikieli")
    asiointikieliCache.put(personOid, value)
  }

  @CacheEvict(value = Array("henkilo"), allEntries = true)
  @Scheduled(fixedRateString = "${caching.spring.dayTTL}")
  def emptyHenkiloCache(): Unit =
    LOG.info("Emptying henkilo cache")

  @CachePut(Array("henkilo"))
  def updateCached(personOid: String, value: OnrUser): Unit = {
    val henkiloCache = cacheManager.getCache("henkilo")
    henkiloCache.put(personOid, value)
  }
}
