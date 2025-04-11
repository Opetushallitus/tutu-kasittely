package fi.oph.tutu.backend.service

import fi.vm.sade.javautils.nio.cas.CasClient
import org.asynchttpclient.RequestBuilder
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.stereotype.Component

import java.util.concurrent.TimeUnit
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Await
import scala.concurrent.duration.Duration
import scala.jdk.javaapi.FutureConverters.asScala

@Component
class HakemuspalveluService {
  val LOG: Logger = LoggerFactory.getLogger(classOf[HakemuspalveluService])

  @Value("${opintopolku.virkailija.url}")
  val opintopolku_virkailija_domain: String = null

  @Autowired
  private val client: CasClient = null

  private def get(url: String): Either[Throwable, String] = {
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
            s"Hakemuspalvelu GET failed with: ${r.getStatusCode} ${r.getStatusText} ${r.getResponseBody()}"
          )
          Left(new RuntimeException("Hakemuspalvelu GET failed: " + r.getResponseBody()))
      }

      Await.result(result, Duration(10, TimeUnit.SECONDS))
    } catch {
      case e: Throwable =>
        Left(e)
    }
  }

  private def post(url: String, body: String): Either[Throwable, String] = {
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
            s"Hakemuspalvelu POST failed with: ${r.getStatusCode} ${r.getStatusText} ${r.getResponseBody()}"
          )
          Left(new RuntimeException("Hakemuspalvelu POST failed: " + r.getResponseBody()))
      }

      Await.result(result, Duration(10, TimeUnit.SECONDS))
    } catch {
      case e: Throwable =>
        Left(e)
    }
  }

}
