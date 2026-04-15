package fi.oph.tutu.backend.service

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.core.`type`.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import fi.vm.sade.javautils.nio.cas.{CasClient, CasClientBuilder, CasConfig}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.Cacheable
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}

import fi.oph.tutu.backend.TutuBackendApplication.CALLER_ID
import fi.oph.tutu.backend.domain.Kieli
import org.springframework.cache.Cache

@JsonIgnoreProperties(ignoreUnknown = true)
case class TranslationEntry(
  id: Int,           // DB identifier
  namespace: String, // service namespace, e.g. tutu-kasittely
  key: String,       // translation key
  locale: String,    // locale (fi/en/sv)
  value: String      // translated message
)

@Component
@Service
class TranslationService(httpService: HttpService, mapper: ObjectMapper) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[TranslationService])

  @Value("${opintopolku.virkailija.url}")
  val opintopolku_virkailija_domain: String = null

  @Value("${tutu.backend.cas.username}")
  val cas_username: String = null

  @Value("${tutu.backend.cas.password}")
  val cas_password: String = null

  @Autowired
  val cacheManager: CacheManager = null

  private lazy val translationCasClient: CasClient = CasClientBuilder.build(
    CasConfig
      .CasConfigBuilder(
        cas_username,
        cas_password,
        s"$opintopolku_virkailija_domain/cas",
        s"$opintopolku_virkailija_domain/lokalisointi",
        CALLER_ID,
        CALLER_ID,
        "/j_spring_cas_security_check"
      )
      .setJsessionName("JSESSIONID")
      .build()
  )

  private def getTranslationCache(): Cache = {
    Option(cacheManager.getCache("translations"))
      .getOrElse(throw new RuntimeException("Translation cachea ei löydy"))
  }

  private def getCachedTranslation(locale: Kieli, key: String): Option[String] = {
    val cacheKey = s"$locale:$key"
    Option(getTranslationCache().get(cacheKey))
      .flatMap(v => Option(v.get().asInstanceOf[String]))
  }

  def loadAllIntoCache(): Unit = {
    httpService.get(
      translationCasClient,
      s"$opintopolku_virkailija_domain/lokalisointi/api/v1/localisation?category=tutu-kasittely"
    ) match {
      case Left(error: Throwable) =>
        LOG.warn(s"Käännösten lataus epäonnistui: ${error.getMessage}")
      case Right(jsonString: String) =>
        val items = mapper.readValue(jsonString, new TypeReference[Seq[TranslationEntry]] {})
        val cache = getTranslationCache()
        items.foreach(e => {
          cache.put(s"${e.locale}:${e.key}", e.value)
        })
        LOG.info(s"Ladattu ${items.size} käännöstä")
    }
  }

  /*
   * Simple {var} replacement for parameters in translations.
   */
  def getTranslation(locale: Kieli, key: String, params: Map[String, String]): String = {
    val template = getCachedTranslation(locale, key)
      .getOrElse(getTranslation(locale, key))

    params.foldLeft(template) { case (text, (k, v)) => text.replace(s"{$k}", v) }
  }

  @Cacheable(value = Array("translations"), key = "#locale + ':' + #key", unless = "#result == #key")
  def getTranslation(locale: Kieli, key: String): String = {
    httpService.get(
      translationCasClient,
      s"$opintopolku_virkailija_domain/lokalisointi/api/v1/localisation?category=tutu-kasittely&key=$key&locale=$locale"
    ) match {
      case Left(error: Throwable) =>
        LOG.warn(s"Käännöksen haku epäonnistui key:lle $key ($locale): ${error.getMessage}")
        key
      case Right(jsonString: String) =>
        val items = mapper.readValue(jsonString, new TypeReference[Seq[TranslationEntry]] {})
        items
          .filter(_.locale == locale.toString())
          .map(_.value)
          .headOption
          .getOrElse(key)
    }
  }
}
