package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.TutuBackendApplication.CALLER_ID
import fi.oph.tutu.backend.domain.HakemusOid
import fi.vm.sade.javautils.nio.cas.{CasClient, CasClientBuilder, CasConfig}
import org.json4s.native.JsonMethods.{compact, parse, render}
import org.json4s.{DefaultFormats, Extraction, JArray, JObject, JValue}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.{Component, Service}

case class HakemuspalveluServiceException(cause: Throwable = null) extends RuntimeException(cause)

@Component
@Service
class HakemuspalveluService(httpService: HttpService) {
  val LOG: Logger                           = LoggerFactory.getLogger(classOf[HakemuspalveluService])
  implicit val formats: DefaultFormats.type = DefaultFormats

  @Value("${opintopolku.virkailija.url}")
  val opintopolku_virkailija_domain: String = null

  @Value("${tutu-backend.cas.username}")
  val cas_username: String = null

  @Value("${tutu-backend.cas.password}")
  val cas_password: String = null

  private lazy val hakemuspalveluCasClient: CasClient = CasClientBuilder.build(
    CasConfig
      .CasConfigBuilder(
        cas_username,
        cas_password,
        s"$opintopolku_virkailija_domain/cas",
        s"$opintopolku_virkailija_domain/lomake-editori",
        CALLER_ID,
        CALLER_ID,
        "/auth/cas"
      )
      .setJsessionName("ring-session")
      .build()
  )

  def haeHakemus(hakemusOid: HakemusOid): Either[Throwable, String] = {
    httpService.get(
      hakemuspalveluCasClient,
      s"$opintopolku_virkailija_domain/lomake-editori/api/external/tutu/hakemus/${hakemusOid.toString}"
    ) match {
      case Left(error: Throwable) =>
        error match {
          case e: NotFoundException => Left(e)
          case _                    => Left(HakemuspalveluServiceException(error))
        }
      case Right(response: String) => Right(response)
    }
  }

  def haeHakemukset(hakemusOidit: Seq[HakemusOid]): Either[Throwable, String] = {
    val jsonObj: JValue  = JObject("hakemusOids" -> Extraction.decompose(hakemusOidit.map(_.toString)))
    val jsonBody: String = compact(render(jsonObj))

    httpService.post(
      hakemuspalveluCasClient,
      s"$opintopolku_virkailija_domain/lomake-editori/api/external/tutu/hakemukset",
      jsonBody
    ) match {
      case Left(error: Throwable)  => Left(HakemuspalveluServiceException(error))
      case Right(response: String) => Right(response)
    }
  }

  def haeMuutoshistoria(hakemusOid: HakemusOid): Either[Throwable, String] = {
    httpService.get(
      hakemuspalveluCasClient,
      s"$opintopolku_virkailija_domain/lomake-editori/api/external/tutu/${hakemusOid.toString}/changes"
    ) match {
      case Left(error: Throwable)  => Left(HakemuspalveluServiceException(error))
      case Right(response: String) => Right(response)
    }
  }

  def haeLomake(form_id: Long): Either[Throwable, String] = {
    httpService.get(
      hakemuspalveluCasClient,
      s"$opintopolku_virkailija_domain/lomake-editori/api/forms/${form_id}"
    ) match {
      case Left(error: Throwable)  => Left(error)
      case Right(response: String) => Right(response)
    }
  }

  def haeLiitteidenTiedot(avainLista: Array[String]): Option[String] = {
    val jsonObj: JValue  = JObject("keys" -> Extraction.decompose(avainLista))
    val jsonBody: String = compact(render(jsonObj))

    httpService.post(
      hakemuspalveluCasClient,
      s"$opintopolku_virkailija_domain/lomake-editori/api/files/metadata",
      jsonBody
    ) match {
      case Left(error)     => throw error
      case Right(response) => {
        val liitteidenTiedot = parse(response).values.asInstanceOf[List[Map[String, Any]]]

        val liitteidenTiedotJaLinkit = liitteidenTiedot.map(tiedot => {
          val liitteenAvain  = tiedot("key")
          val downloadLink   = s"$opintopolku_virkailija_domain/lomake-editori/api/files/content/$liitteenAvain"
          val tiedotJaLinkki = tiedot + ("download-url" -> downloadLink)

          tiedotJaLinkki
        })

        Some(compact(render(Extraction.decompose(liitteidenTiedotJaLinkit))))
      }
    }
  }
}
