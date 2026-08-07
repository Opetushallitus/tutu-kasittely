package fi.oph.tutu.backend.frontend

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.env.Environment
import org.springframework.http.{CacheControl, MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.{GetMapping, RequestMapping, RestController}

@RestController
@RequestMapping(path = Array("tutu-frontend"))
class FrontendConfigController(mapper: ObjectMapper, environment: Environment) {
  @Value("${opintopolku.virkailija.url}")
  private val virkailijaUrl: String = null

  @Value("${tutu.frontend.tolgee.api-url:}")
  private val tolgeeApiUrl: String = null

  @Value("${tutu.frontend.tolgee.api-key:}")
  private val tolgeeApiKey: String = null

  @GetMapping(path = Array("config.js"), produces = Array("application/javascript"))
  def configJs: ResponseEntity[String] = {
    val payload = FrontendConfiguration(
      IS_DEV = environment.getActiveProfiles.contains("dev"),
      IS_PROD = environment.getActiveProfiles.contains("prod"),
      IS_TEST = environment.getActiveProfiles.contains("test"),
      VIRKAILIJA_URL = virkailijaUrl,
      TUTU_BACKEND = "",
      PUBLIC_TOLGEE_API_URL = tolgeeApiUrl,
      PUBLIC_TOLGEE_API_KEY = tolgeeApiKey
    )
    val body = s"window.configuration = ${mapper.writeValueAsString(payload)};"
    ResponseEntity
      .ok()
      .cacheControl(CacheControl.noStore())
      .contentType(MediaType.valueOf("application/javascript"))
      .body(body)
  }
}

private case class FrontendConfiguration(
  IS_DEV: Boolean,
  IS_PROD: Boolean,
  IS_TEST: Boolean,
  VIRKAILIJA_URL: String,
  TUTU_BACKEND: String,
  PUBLIC_TOLGEE_API_URL: String,
  PUBLIC_TOLGEE_API_KEY: String
)
