package fi.oph.tutu.backend.service

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.core.`type`.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.vm.sade.javautils.nio.cas.{CasClient, CasClientBuilder, CasConfig}
import org.springframework.beans.factory.annotation.Value
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}

import fi.oph.tutu.backend.utils.TutuJsonFormats
import fi.oph.tutu.backend.TutuBackendApplication.CALLER_ID

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
class TranslationService(httpService: HttpService) {
  @Value("${opintopolku.virkailija.url}")
  val opintopolku_virkailija_domain: String = null

  @Value("${tutu.backend.cas.username}")
  val cas_username: String = null

  @Value("${tutu.backend.cas.password}")
  val cas_password: String = null

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

  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)

  def getTranslation(locale: String, key: String): String = {
    httpService.get(
      translationCasClient,
      s"$opintopolku_virkailija_domain/lokalisointi/api/v1/localisation?category=tutu-kasittely&key=$key&locale=$locale"
    ) match {
      case Left(error: Throwable) =>
        error match {
          case _ => key
        }
      case Right(jsonString: String) => {
        val items            = mapper.readValue(jsonString, new TypeReference[Seq[TranslationEntry]] {})
        val maybeTranslation = items
          .filter(_.locale == locale)
          .map(_.value)
          .headOption

        maybeTranslation match {
          case None              => key
          case Some(translation) => translation
        }
      }
    }
  }
}
