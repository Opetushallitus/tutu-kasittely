package fi.oph.tutu.backend.service

import fi.vm.sade.javautils.nio.cas.CasClient
import org.asynchttpclient.RequestBuilder
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.Component

import java.util.concurrent.TimeUnit
import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.Duration
import scala.jdk.javaapi.FutureConverters.asScala

@Component
class HttpService {
  private val LOG: Logger = LoggerFactory.getLogger(classOf[HttpService])

  def get(client: CasClient, url: String): Either[Throwable, String] = {
    val req = new RequestBuilder()
      .setMethod("GET")
      .setUrl(url)
      .build()
    try {
      val result = asScala(client.execute(req)).map {
        case r if r.getStatusCode == 200 =>
          Right(r.getResponseBody())
        case r =>
          LOG.error(
            s"GET request to ${url} failed with: ${r.getStatusCode} ${r.getStatusText} ${r.getResponseBody()}"
          )
          Left(
            new RuntimeException("GET request failed: " + r.getResponseBody())
          )
      }

      Await.result(result, Duration(10, TimeUnit.SECONDS))
    } catch {
      case e: Throwable =>
        Left(e)
    }
  }

  def post(
      client: CasClient,
      url: String,
      body: String
  ): Either[Throwable, String] = {
    val req = new RequestBuilder()
      .setMethod("POST")
      .setUrl(url)
      .setBody(body)
      .build()
    try {
      val result = asScala(client.execute(req)).map {
        case r if r.getStatusCode == 200 =>
          Right(r.getResponseBody())
        case r =>
          LOG.error(
            s"POST request to ${url} failed with: ${r.getStatusCode} ${r.getStatusText} ${r.getResponseBody()}"
          )
          Left(
            new RuntimeException("POST request failed: " + r.getResponseBody())
          )
      }

      Await.result(result, Duration(10, TimeUnit.SECONDS))
    } catch {
      case e: Throwable =>
        Left(e)
    }
  }
}
