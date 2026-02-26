package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.domain.{HakemusOid, Paatos, Paatosteksti}
import fi.oph.tutu.backend.service.{PaatosService, UserService}
import fi.oph.tutu.backend.utils.AuditOperation.{
  CreatePaatosteksti,
  ReadPaatos,
  ReadPaatosPreview,
  ReadPaatosteksti,
  UpdatePaatos,
  UpdatePaatosteksti
}
import fi.oph.tutu.backend.utils.{AuditLog, AuditUtil, ErrorMessageMapper}
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.{HttpStatus, MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.*

import java.util.UUID
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
    path = Array("paatos/{hakemusOid}"),
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
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      paatosService.haePaatos(HakemusOid(hakemusOid))
    } match {
      case Success(result) =>
        result match {
          case None =>
            LOG.info(s"Päätöstä ei löytynyt")
            errorMessageMapper.mapPlainErrorMessage("Päätöstä ei löytynyt", HttpStatus.NOT_FOUND)
          case Some(paatos) =>
            auditLog.logRead("päätös", hakemusOid, ReadPaatos, request)
            ResponseEntity.status(HttpStatus.OK).body(mapper.writeValueAsString(paatos))
        }
      case Failure(exception) =>
        LOG.error(s"Päätöksen haku epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @PutMapping(
    path = Array("paatos/{hakemusOid}"),
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
    @RequestBody paatosBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val user           = userService.getEnrichedUserDetails(true)
      val paatos: Paatos = mapper.readValue(paatosBytes, classOf[Paatos])

      paatosService.tallennaPaatos(HakemusOid(hakemusOid), paatos, user.userOid)
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
    path = Array("paatos/{hakemusOid}/paatosteksti/generate"),
    produces = Array(MediaType.TEXT_HTML_VALUE)
  )
  def generatePaatosteksti(
    @PathVariable hakemusOid: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      paatosService.generatePaatosTeksti(HakemusOid(hakemusOid))
    } match {
      case Success(paatosTeksti) =>
        auditLog.logRead("päätös", hakemusOid, ReadPaatosPreview, request)
        ResponseEntity.status(HttpStatus.OK).body(paatosTeksti)
      case Failure(exception) =>
        LOG.error(s"Päätöstekstin haku epäonnistui, hakemusOid: $hakemusOid", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @GetMapping(
    path = Array("paatos/{hakemusOid}/paatosteksti/"),
    produces = Array(MediaType.TEXT_HTML_VALUE)
  )
  def haePaatosteksti(
    @PathVariable hakemusOid: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      paatosService.haePaatosteksti(HakemusOid(hakemusOid))
    } match {
      case Success((paatosteksti, created)) =>
        if (created) {
          auditLog.logRead("päätösteksti", hakemusOid, ReadPaatosteksti, request)
        } else {
          auditLog.logCreate(
            auditLog.getUser(request),
            Map("hakemusOid" -> hakemusOid),
            CreatePaatosteksti,
            paatosteksti
          )
        }
        ResponseEntity.status(HttpStatus.OK).body(mapper.writeValueAsString(paatosteksti))
      case Failure(exception) =>
        LOG.error(
          s"Päätöstekstin haku epäonnistui, hakemusOid: $hakemusOid",
          exception
        )
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @PutMapping(
    path = Array("paatos/{hakemusOid}/paatosteksti/{paatostekstiId}"),
    produces = Array(MediaType.TEXT_HTML_VALUE)
  )
  def tallennaPaatosteksti(
    @PathVariable hakemusOid: String,
    @PathVariable paatostekstiId: String,
    @RequestBody paatosBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    val user         = userService.getEnrichedUserDetails(true)
    val paatosteksti = mapper.readValue(paatosBytes, classOf[Paatosteksti])
    Try {
      paatosService.tallennaPaatosteksti(
        HakemusOid(hakemusOid),
        UUID.fromString(paatostekstiId),
        paatosteksti,
        user.userOid
      )
    } match {
      case Success((vanha, uusi)) =>
        auditLog.logChanges(
          auditLog.getUser(request),
          Map("hakemusOid" -> hakemusOid),
          UpdatePaatosteksti,
          AuditUtil.getChanges(
            Some(mapper.writeValueAsString(vanha)),
            Some(mapper.writeValueAsString(uusi))
          )
        )
        ResponseEntity.status(HttpStatus.OK).body(mapper.writeValueAsString(uusi))
      case Failure(exception) =>
        LOG.error(
          s"Päätöstekstin haku epäonnistui, hakemusOid: $hakemusOid, paatostekstiId: $paatostekstiId",
          exception
        )
        errorMessageMapper.mapErrorMessage(exception)
    }
  }
}
