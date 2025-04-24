package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.repository.HakemusRepository
import fi.oph.tutu.backend.service.HakemuspalveluService
import fi.oph.tutu.backend.utils.AuditLog
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode
import io.swagger.v3.oas.annotations.media.{Content, Schema}
import io.swagger.v3.oas.annotations.responses.ApiResponse
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.{HttpStatus, MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.*

import java.util
import java.util.UUID
import scala.annotation.meta.field
import scala.beans.BeanProperty
import scala.jdk.OptionConverters.*

@Schema(name = "Hakemus")
case class Hakemus(
                      @(Schema @field)(example = "1.2.246.562.00.00000000000000006666", requiredMode = RequiredMode.REQUIRED, maxLength = 40)
                      @BeanProperty hakemusOid: String,
                      )

@RestController
@RequestMapping(path = Array("api"))
class Controller(
    hakemuspalveluService: HakemuspalveluService,
    hakemusRepository: HakemusRepository,
    val auditLog: AuditLog = AuditLog
) {
  val LOG = LoggerFactory.getLogger(classOf[Controller])

  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(SerializationFeature.INDENT_OUTPUT, true)

  @Value("${tutu.ui.url}")
  val tutuUiUrl: String = null

  @GetMapping(path = Array("healthcheck"))
  def healthcheck = "Tutu is alive and kicking!"

  final val RESPONSE_200_DESCRIPTION = "Pyyntö vastaanotettu, palauttaa hakemuksen id:n"
  final val RESPONSE_400_DESCRIPTION = "Pyyntö virheellinen"
  final val RESPONSE_403_DESCRIPTION = "Käyttäjällä ei ole tarvittavia oikeuksia hakemusten luontiin"
  final val RESPONSE_500_DESCRIPTION = "Palvelinvirhe"

  @PostMapping(
    path = Array("hakemus"),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Luo uuden hakemuspalvelun hakemuksen",
    description = "",
    requestBody = new io.swagger.v3.oas.annotations.parameters.RequestBody(
      content = Array(new Content(schema = new Schema(implementation = classOf[Hakemus])))),
    responses = Array(
      new ApiResponse(responseCode = "200", description = RESPONSE_200_DESCRIPTION, content = Array(new Content(schema = new Schema(implementation = classOf[UUID])))),
      new ApiResponse(responseCode = "400", description = RESPONSE_400_DESCRIPTION),
      new ApiResponse(responseCode = "403", description = RESPONSE_403_DESCRIPTION),
      new ApiResponse(responseCode = "500", description = RESPONSE_500_DESCRIPTION)
    ))
  def luoHakemus(@RequestBody hakemusBytes: Array[Byte]) =
      try
          val hakemus = mapper.readValue(hakemusBytes, classOf[Hakemus])
          hakemusRepository.tallennaHakemus(hakemus.hakemusOid, "hakemuspalvelu")
      catch
        case e: Exception =>
          LOG.error("Hakemuksen luonti epäonnistui", e.getMessage)
          ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage)

  // TODO: FOR TESTING, TO BE REMOVED LATERZ
  @GetMapping(path = Array("test"))
  def testi: Unit = {
    hakemuspalveluService.getHakemus("1.2.246.562.11.00000000000002349688") match {
      case Left(error: Throwable)  => LOG.error("Error fetching: ", error)
      case Right(response: String) => LOG.info(s"Response: $response")
    }
  }
}
