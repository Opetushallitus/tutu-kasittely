package fi.oph.tutu.backend.service.oauth

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.domain.Oauth2Token
import org.asynchttpclient.{AsyncHttpClient, RequestBuilder}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Value
import org.springframework.cache.annotation.{CacheEvict, Cacheable}
import org.springframework.stereotype.Component

import java.io.IOException
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.util.concurrent.TimeUnit
import scala.concurrent.duration.Duration
import scala.concurrent.{Await, ExecutionContext}

import scala.concurrent.ExecutionContext.Implicits.global

@Component
class Oauth2BearerClient(client: AsyncHttpClient, objectMapper: ObjectMapper) {
  @Value("${oauth2.issuer.url}")
  private val oauth2IssuerUri = ""

  @Value("${tutu.backend.oauth2.client}")
  private val oauth2Client = ""

  @Value("${tutu.backend.oauth2.secret}")
  private val oauth2Secret = ""

  private val LOG: Logger                   = LoggerFactory.getLogger(classOf[Oauth2BearerClient])
  implicit private val ec: ExecutionContext = global

  @Cacheable(value = Array("oauth2Bearer"))
  @throws[IOException]
  @throws[InterruptedException]
  def getOauth2Bearer: String = {
    val tokenUrl = oauth2IssuerUri + "/oauth2/token"
    LOG.info("refetching oauth2 bearer from " + tokenUrl)
    val body = "grant_type=client_credentials&client_id="
      + encodeFormValue(oauth2Client)
      + "&client_secret="
      + encodeFormValue(oauth2Secret)

    val request = new RequestBuilder()
      .setMethod("POST")
      .setUrl(tokenUrl)
      .setHeader("Content-Type", "application/x-www-form-urlencoded")
      .setBody(body)
    val response = Await.result(toScalaFuture(client.executeRequest(request)), Duration(10, TimeUnit.SECONDS))

    if (response.getStatusCode != 200)
      throw new RuntimeException(
        "Oauth2 bearer returned status code " + response.getStatusCode + ": " + response.getResponseBody
      )
    objectMapper.readValue(response.getResponseBody, classOf[Oauth2Token]).access_token
  }

  @CacheEvict(value = Array("oauth2Bearer"), allEntries = true)
  def evictOauth2Bearer(): Unit = {
    LOG.info("evicting oauth2 bearer cache")
  }
  private def encodeFormValue(value: String) = URLEncoder.encode(value, StandardCharsets.UTF_8)
}
