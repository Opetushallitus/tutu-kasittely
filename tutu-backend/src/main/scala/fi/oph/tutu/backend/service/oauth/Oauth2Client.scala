package fi.oph.tutu.backend.service.oauth

import fi.oph.tutu.backend.TutuBackendApplication.CALLER_ID
import org.asynchttpclient.{AsyncHttpClient, RequestBuilder, Response}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.Component

import scala.concurrent.{ExecutionContext, Future}

import scala.concurrent.ExecutionContext.Implicits.global

@Component
class Oauth2Client(
  oauth2BearerClient: Oauth2BearerClient,
  client: AsyncHttpClient
) {
  private val LOG: Logger                   = LoggerFactory.getLogger(classOf[Oauth2Client])
  implicit private val ec: ExecutionContext = global

  private def execute(requestBuilder: RequestBuilder): Future[Response] = {
    val bearer  = oauth2BearerClient.getOauth2Bearer
    val request = requestBuilder
      .setHeader("Authorization", "Bearer " + bearer)
      .setHeader("Caller-Id", CALLER_ID)
      .build
    toScalaFuture(client.executeRequest(request))
  }

  def executeRequest(requestBuilder: RequestBuilder): Future[Response] = {
    execute(requestBuilder).flatMap { res =>
      if (res.getStatusCode == 401) {
        val authHeader = Option(res.getHeader("WWW-Authenticate")).getOrElse("")
        LOG.debug(s"received WWW-authenticate header: $authHeader")
        if (authHeader.contains("invalid_token")) {
          LOG.debug("Invalid token, refreshing OAuth2 bearer")
          oauth2BearerClient.evictOauth2Bearer()
          execute(requestBuilder) // retry
        } else {
          Future.successful(res)
        }
      } else {
        Future.successful(res)
      }
    }
  }
}
