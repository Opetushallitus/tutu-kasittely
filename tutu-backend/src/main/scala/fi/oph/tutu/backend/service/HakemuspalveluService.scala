package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.TutuBackendApplication.CALLER_ID
import fi.oph.tutu.backend.domain.HakemusOid
import fi.oph.tutu.backend.utils.Constants.DATE_TIME_FORMAT
import fi.vm.sade.javautils.nio.cas.{CasClient, CasClientBuilder, CasConfig}
import org.json4s.native.JsonMethods.{compact, parse, render}
import org.json4s.*
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.{Component, Service}

import java.time.{ZoneId, ZonedDateTime}
import java.time.format.DateTimeFormatter

case class HakemuspalveluServiceException(cause: Throwable = null) extends RuntimeException(cause)

@Component
@Service
class HakemuspalveluService(httpService: HttpService) {
  val LOG: Logger                           = LoggerFactory.getLogger(classOf[HakemuspalveluService])
  implicit val formats: DefaultFormats.type = DefaultFormats

  @Value("${opintopolku.virkailija.url}")
  val opintopolku_virkailija_domain: String = null

  @Value("${tutu.backend.cas.username}")
  val cas_username: String = null

  @Value("${tutu.backend.cas.password}")
  val cas_password: String = null

  val COMMON_MUUTOSHISTORIA_FIELDS: Seq[String] = Seq("type", "virkailijaOid", "time")

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

  def haeLiitteidenTiedot(hakemusOid: HakemusOid, avainLista: Array[String]): Option[String] = {
    val muutosHistoria = haeMuutoshistoria(hakemusOid) match {
      case Left(error: Throwable) =>
        throw error
      case Right(response: String) =>
        resolveLiitteidenMuutoshistoria(response)
    }
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
          val liitteenAvain = tiedot("key").toString
          val downloadLink  = s"$opintopolku_virkailija_domain/lomake-editori/api/files/content/$liitteenAvain"
          var tiedotJaLinkkiJaSaapumisaika = tiedot + ("download-url" -> downloadLink)
          tiedotJaLinkkiJaSaapumisaika =
            if (muutosHistoria.contains(liitteenAvain))
              tiedotJaLinkkiJaSaapumisaika + ("saapumisaika" -> muutosHistoria(liitteenAvain))
            else tiedotJaLinkkiJaSaapumisaika

          tiedotJaLinkkiJaSaapumisaika
        })

        Some(compact(render(Extraction.decompose(liitteidenTiedotJaLinkit))))
      }
    }
  }

  def resolveLiitteidenMuutoshistoria(jsonString: String): Map[String, String] = {
    val dateTimeFormatter = DateTimeFormatter.ofPattern(DATE_TIME_FORMAT)
    val mappings          = parse(jsonString) match {
      case JArray(rawItems) =>
        rawItems.flatMap(item => {
          val fields    = item.asInstanceOf[JObject].values
          val time      = (item \ "time").extract[String]
          val localTime = ZonedDateTime
            .parse(time, dateTimeFormatter)
            .withZoneSameInstant(ZoneId.of("Europe/Helsinki"))
            .toLocalDateTime

          val keysOfModifiedFields = fields.keys.toSeq.diff(COMMON_MUUTOSHISTORIA_FIELDS)
          keysOfModifiedFields.flatMap(key =>
            item \ key match {
              case JObject(subFields) =>
                val oldValue = subFields.find(_._1 == "old")
                val newValue = subFields.find(_._1 == "new")
                (oldValue, newValue) match {
                  case (Some(_, JArray(oldVals)), Some(_, JArray(newVals)))
                      if oldVals.forall(_.isInstanceOf[JString]) && newVals.forall(_.isInstanceOf[JString]) =>
                    val oldStrVals   = oldVals.map(_.extract[String])
                    val newStrVals   = newVals.map(_.extract[String])
                    val addedStrVals = newStrVals.filterNot(oldStrVals.contains)
                    addedStrVals.map(_ -> localTime.toString)
                  case _ => Seq()
                }
              case _ => Seq()
            }
          )
        })
      case _ => Seq()
    }
    mappings.toMap
  }
}
