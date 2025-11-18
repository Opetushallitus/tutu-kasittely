package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.domain.{HakemusOid, Paatos}
import fi.oph.tutu.backend.service.{PaatosService, UserService}
import fi.oph.tutu.backend.utils.AuditOperation.{ReadPaatos, UpdatePaatos}
import fi.oph.tutu.backend.utils.{AuditLog, AuditUtil, ErrorMessageMapper}
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.{HttpStatus, MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.*

import scala.util.{Failure, Success, Try}

@RestController
@RequestMapping(path = Array("api"))
class PaatosController(
  paatosService: PaatosService,
  userService: UserService,
  mapper: ObjectMapper,
  val auditLog: AuditLog
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[PaatosController])

  private val errorMessageMapper = new ErrorMessageMapper(mapper)

  @GetMapping(
    path = Array("paatos/{hakemusOid}/{formId}"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Hae päätös hakemuksen ja lomakkeen perusteella",
    responses = Array(
      new ApiResponse(
        responseCode = "200",
        description = RESPONSE_200_DESCRIPTION
      ),
      new ApiResponse(
        responseCode = "404",
        description = "Päätöstä ei löytynyt"
      ),
      new ApiResponse(
        responseCode = "500",
        description = RESPONSE_500_DESCRIPTION
      )
    )
  )
  def haePaatos(
    @PathVariable("hakemusOid") hakemusOid: String,
    @PathVariable("formId") formId: Long,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      paatosService.haePaatos(HakemusOid(hakemusOid), formId)
    } match {
      case Success(result) => {
        result match {
          case None =>
            LOG.info(s"Päätöstä ei löytynyt")
            errorMessageMapper.mapPlainErrorMessage("Päätöstä ei löytynyt", HttpStatus.NOT_FOUND)
          case Some(paatos) =>
            auditLog.logRead("päätös", hakemusOid, ReadPaatos, request)
            ResponseEntity.status(HttpStatus.OK).body(mapper.writeValueAsString(paatos))
        }
      }
      case Failure(exception) =>
        LOG.error(s"Päätöksen haku epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }
  @PostMapping(
    path = Array("paatos/{hakemusOid}/{formId}"),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Tallenna päätös osittain (päivittää vain pyynnössä olevat kentät)",
    description = "POST endpoint osittaisille päivityksille. Vain pyynnössä olevat kentät päivitetään.",
    responses = Array(
      new ApiResponse(
        responseCode = "200",
        description = RESPONSE_200_DESCRIPTION
      ),
      new ApiResponse(
        responseCode = "400",
        description = RESPONSE_400_DESCRIPTION
      ),
      new ApiResponse(
        responseCode = "403",
        description = RESPONSE_403_DESCRIPTION
      ),
      new ApiResponse(
        responseCode = "500",
        description = RESPONSE_500_DESCRIPTION
      )
    )
  )
  def tallennaPaatos(
    @PathVariable("hakemusOid") hakemusOid: String,
    @PathVariable("formId") formId: Long,
    @RequestBody paatosBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val user           = userService.getEnrichedUserDetails(true)
      val paatos: Paatos = mapper.readValue(paatosBytes, classOf[Paatos])

      paatosService.tallennaPaatos(HakemusOid(hakemusOid), formId, paatos, user.userOid)
    } match {
      case Success(result) =>
        result match {
          case (vanhaPaatos, Some(paivitettyPaatos)) =>
            auditLog.logChanges(
              auditLog.getUser(request),
              Map("hakemusOid" -> hakemusOid),
              UpdatePaatos,
              AuditUtil.getChanges(
                vanhaPaatos.map(vp => mapper.writeValueAsString(vp)),
                Some(mapper.writeValueAsString(paivitettyPaatos))
              )
            )
            ResponseEntity.status(HttpStatus.OK).body(mapper.writeValueAsString(paivitettyPaatos))

          case _ =>
            LOG.warn(s"Päätöksen tallennus epäonnistui")
            errorMessageMapper.mapPlainErrorMessage(
              "Päätöksen tallennus epäonnistui",
              HttpStatus.INTERNAL_SERVER_ERROR
            )

        }
      case Failure(e) =>
        LOG.error(s"Päätöksen tallennus epäonnistui, hakemusOid: $hakemusOid", e)
        errorMessageMapper.mapPlainErrorMessage(RESPONSE_400_DESCRIPTION, HttpStatus.BAD_REQUEST)

    }
  }

  @GetMapping(
    path = Array("paatos/{hakemusOid}/paatosteksti"),
    produces = Array(MediaType.TEXT_HTML_VALUE)
  )
  def haePaatosTeksti(@PathVariable hakemusOid: String): ResponseEntity[Any] = {
    Try {
      paatosService.haePaatosTeksti(HakemusOid(hakemusOid))
    } match {
      case Success(paatosTeksti) =>
        val response = mapper.writeValueAsString(paatosTeksti)
        ResponseEntity.status(HttpStatus.OK).body(response)
      case Failure(exception) =>
        LOG.error(s"Päätöstekstin haku epäonnistui, hakemusOid: $hakemusOid", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }
}
