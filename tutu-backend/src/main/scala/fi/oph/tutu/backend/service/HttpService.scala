package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.service.oauth.Oauth2Client
import fi.vm.sade.javautils.nio.cas.CasClient
import org.asynchttpclient.{RequestBuilder, Response}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.Component

import java.util.concurrent.TimeUnit
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.Duration
import scala.concurrent.{Await, Future}
import scala.jdk.javaapi.FutureConverters.asScala

case class NotFoundException(message: String = "", cause: Throwable = null) extends RuntimeException(message, cause)
@Component
class HttpService {
  private val LOG: Logger = LoggerFactory.getLogger(classOf[HttpService])

  def get(client: CasClient, url: String): Either[Throwable, String] = {
    try {
      val response = asScala(client.execute(getRequestBuilder(url).build()))
      handleGetResponse(url, response)
    } catch {
      case e: Throwable =>
        Left(e)
    }
  }

  def get(client: Oauth2Client, url: String): Either[Throwable, String] = {
    try {
      val response = client.executeRequest(getRequestBuilder(url))
      handleGetResponse(url, response)
    } catch {
      case e: Throwable =>
        Left(e)
    }
  }

  private def getRequestBuilder(url: String): RequestBuilder = {
    new RequestBuilder()
      .setMethod("GET")
      .setUrl(url)
  }

  private def handleGetResponse(url: String, response: Future[Response]): Either[Throwable, String] = {
    val result = response.map {
      case r if r.getStatusCode == 200 =>
        Right(r.getResponseBody())
      case r if r.getStatusCode == 404 =>
        LOG.warn(s"GET request returned 404 Not Found")
        Left(NotFoundException("Resource not found"))
      case r =>
        LOG.error(
          s"GET request to $url failed with: ${r.getStatusCode} ${r.getStatusText} ${r.getResponseBody()}"
        )
        Left(new RuntimeException("GET request failed: " + r.getResponseBody()))
    }
    Await.result(result, Duration(10, TimeUnit.SECONDS))
  }

  def post(
    client: CasClient,
    url: String,
    body: String
  ): Either[Throwable, String] = {
    try {
      val result = asScala(client.execute(postRequestBuilder(url, body).build()))
      handlePostResponse(url, result)
    } catch {
      case e: Throwable =>
        Left(e)
    }
  }

  def post(
    client: Oauth2Client,
    url: String,
    body: String
  ): Either[Throwable, String] = {
    try {
      val result = client.executeRequest(postRequestBuilder(url, body))
      handlePostResponse(url, result)
    } catch {
      case e: Throwable =>
        Left(e)
    }
  }

  private def postRequestBuilder(url: String, body: String): RequestBuilder = {
    new RequestBuilder()
      .setMethod("POST")
      .setUrl(url)
      .setHeader("Content-Type", "application/json")
      .setBody(body)
  }

  private def handlePostResponse(url: String, response: Future[Response]): Either[Throwable, String] = {
    val result = response.map {
      case r if r.getStatusCode == 200 =>
        Right(r.getResponseBody())
      case r =>
        LOG.error(
          s"POST request to $url failed with: ${r.getStatusCode} ${r.getStatusText} ${r.getResponseBody()}"
        )
        Left(new RuntimeException("POST request failed: " + r.getResponseBody()))
    }
    Await.result(result, Duration(10, TimeUnit.SECONDS))
  }
}
