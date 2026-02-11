package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.domain.{HakemusOid, SortDef, Viesti}
import fi.oph.tutu.backend.service.{UserService, ViestiService}
import fi.oph.tutu.backend.utils.AuditOperation.{CreateViesti, DeleteViesti, ReadViesti, ReadViestit, UpdateViesti}
import fi.oph.tutu.backend.utils.Utility.currentLocalDateTime
import fi.oph.tutu.backend.utils.{AuditLog, AuditUtil, ErrorMessageMapper}
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.{HttpStatus, MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.{
  DeleteMapping,
  GetMapping,
  PathVariable,
  PutMapping,
  RequestBody,
  RequestMapping,
  RequestParam,
  RestController
}

import java.time.LocalDateTime
import java.util.UUID
import scala.util.{Failure, Success, Try}

@RestController
@RequestMapping(path = Array("api"))
class ViestiController(
  viestiService: ViestiService,
  userService: UserService,
  mapper: ObjectMapper,
  val auditLog: AuditLog
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[ViestiController])

  private val errorMessageMapper = new ErrorMessageMapper(mapper)

  @GetMapping(
    path = Array("viestilista/{hakemusOid}"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  def listaaViestit(
    @PathVariable("hakemusOid") hakemusOid: String,
    @RequestParam(required = false) sort: String = SortDef.Undefined.toString,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      viestiService.haeViestiLista(HakemusOid(hakemusOid), sort)
    } match {
      case Success(result) => {
        auditLog.logRead(
          "viestilista",
          mapper.writeValueAsString(Map("hakemusOid" -> hakemusOid)),
          ReadViestit,
          request
        )
        ResponseEntity.status(HttpStatus.OK).body(mapper.writeValueAsString(result))
      }
      case Failure(exception) =>
        LOG.error(s"Viestilistan haku epäonnistui hakemukselle $hakemusOid", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @GetMapping(
    path = Array("viesti/tyoversio/{hakemusOid}"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  def getViestiTyoversio(
    @PathVariable("hakemusOid") hakemusOid: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      viestiService.haeViestiTyoversio(HakemusOid(hakemusOid))
    } match {
      case Success(value) =>
        value match {
          case None =>
            LOG.warn(s"Hakemusta ei löytynyt hakemusOid:illa: $hakemusOid")
            errorMessageMapper.mapPlainErrorMessage(
              "Hakemusta ei löytynyt",
              HttpStatus.NOT_FOUND
            )
          case Some(viesti) =>
            auditLog.logRead(
              "viesti",
              mapper.writeValueAsString(Map("hakemusOid" -> hakemusOid, "tila" -> "tyoversio")),
              ReadViesti,
              request
            )
            ResponseEntity
              .status(HttpStatus.OK)
              .body(mapper.writeValueAsString(viesti))
        }
      case Failure(exception) =>
        LOG.error(s"Viestin työversion haku epäonnistui, hakemusOid: $hakemusOid", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @GetMapping(
    path = Array("viesti/{id}"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  def getViesti(
    @PathVariable("id") id: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      viestiService.haeViesti(UUID.fromString(id))
    } match {
      case Success(value) =>
        value match {
          case None =>
            LOG.warn(s"Viestiä ei löytynyt id:illä': $id")
            errorMessageMapper.mapPlainErrorMessage(
              "Viestiä ei löytynyt",
              HttpStatus.NOT_FOUND
            )
          case Some(viesti) =>
            auditLog.logRead(
              "viesti",
              mapper.writeValueAsString(Map("id" -> id, "tila" -> "vahvistettu")),
              ReadViesti,
              request
            )
            ResponseEntity
              .status(HttpStatus.OK)
              .body(mapper.writeValueAsString(viesti))
        }
      case Failure(exception) =>
        LOG.error(s"Vahvistetun viestin haku epäonnistui, id: $id", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @PutMapping(
    path = Array("viesti/{hakemusOid}"),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Tallenna viesti (korvaa kaikki käyttäjän muokattavat kentät)",
    description = "PUT endpoint täydelle entiteetille. NULL arvo pyynnössä -> NULL tietokantaan.",
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

  def tallenna(
    @PathVariable("hakemusOid") hakemusOid: String,
    @RequestBody paatosBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] =
    tallennaViesti(hakemusOid, paatosBytes, request)

  private def tallennaViesti(
    hakemusOid: String,
    viestiBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest,
    merkitseVahvistetuksi: Boolean = false
  ): ResponseEntity[Any] = {
    Try {
      val user        = userService.getEnrichedUserDetails(true)
      val viesti      = mapper.readValue(viestiBytes, classOf[Viesti])
      val finalViesti = if (merkitseVahvistetuksi) {
        viesti.copy(vahvistettu = Some(currentLocalDateTime()), vahvistaja = Some(user.userOid))
      } else {
        viesti
      }

      viestiService.tallennaViesti(HakemusOid(hakemusOid), finalViesti, user.userOid)
    } match {
      case Success(result) =>
        result match {
          case (Some(current), Some(newOrUpdated)) =>
            auditLog.logChanges(
              auditLog.getUser(request),
              Map("hakemusOid" -> hakemusOid),
              UpdateViesti,
              AuditUtil.getChanges(
                Some(mapper.writeValueAsString(current)),
                Some(mapper.writeValueAsString(newOrUpdated))
              )
            )
            ResponseEntity.status(HttpStatus.OK).body(mapper.writeValueAsString(newOrUpdated))
          case (None, Some(newViesti)) =>
            auditLog.logCreate(
              auditLog.getUser(request),
              Map("hakemusOid" -> hakemusOid),
              CreateViesti,
              newViesti.toString
            )
            ResponseEntity.status(HttpStatus.OK).body(mapper.writeValueAsString(newViesti))
          case _ =>
            LOG.warn(s"Viestin tallennus epäonnistui")
            errorMessageMapper.mapPlainErrorMessage(
              "Viestin tallennus epäonnistui",
              HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
      case Failure(e) =>
        LOG.error(s"Viestin tallennus epäonnistui, hakemusOid: $hakemusOid", e)
        errorMessageMapper.mapPlainErrorMessage(RESPONSE_400_DESCRIPTION, HttpStatus.BAD_REQUEST)
    }
  }

  @PutMapping(
    path = Array("viesti/{hakemusOid}/vahvista"),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Vahvista ja tallenna viesti",
    description =
      "PUT endpoint vahvistamiselle, kaikki käyttäjän muokattavat kentät korvataan (NULL arvo pyynnössä -> NULL tietokantaan).",
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

  def vahvistaViesti(
    @PathVariable("hakemusOid") hakemusOid: String,
    @RequestBody paatosBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] =
    tallennaViesti(hakemusOid, paatosBytes, request, true)

  @DeleteMapping(path = Array("viesti/{id}"))
  @Operation(
    summary = "Poista viesti",
    description = "DELETE endpoint yksittäisen viestin poistamiseen",
    responses = Array(
      new ApiResponse(
        responseCode = "204",
        description = RESPONSE_200_DESCRIPTION
      ),
      new ApiResponse(
        responseCode = "403",
        description = RESPONSE_403_DESCRIPTION
      ),
      new ApiResponse(
        responseCode = "404",
        description = RESPONSE_404_DESCRIPTION
      ),
      new ApiResponse(
        responseCode = "500",
        description = RESPONSE_500_DESCRIPTION
      )
    )
  )
  def poistaViesti(
    @PathVariable("id") id: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      viestiService.poistaViesti(UUID.fromString(id))
    } match {
      case Success(result) =>
        if (result == 0) {
          ResponseEntity.notFound().build()
        } else {
          auditLog.logChanges(
            auditLog.getUser(request),
            Map("id" -> id),
            DeleteViesti,
            AuditUtil.getChanges(None, None)
          )
          ResponseEntity.noContent().build()
        }
      case Failure(exception) =>
        LOG.error(s"Viestin poisto epäonnistui, id: $id", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }
}
