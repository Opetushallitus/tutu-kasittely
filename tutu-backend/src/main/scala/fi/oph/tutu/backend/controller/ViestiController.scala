package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.domain.{HakemusOid, OletusSisaltoTyyppi, Viesti}
import fi.oph.tutu.backend.service.{UserService, ViestiService}
import fi.oph.tutu.backend.utils.AuditOperation.*
import fi.oph.tutu.backend.utils.{AuditLog, AuditUtil, ErrorMessageMapper}
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.dao.InvalidDataAccessApiUsageException
import org.springframework.http.{HttpStatus, MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.*

import java.time.ZoneId
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
    @RequestParam(required = false, defaultValue = "vahvistettu:desc") sort: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val sortParams = resolveSortParams(sort)
      viestiService.haeViestiLista(HakemusOid(hakemusOid), sortParams)
    } match {
      case Success(result) =>
        auditLog.logRead(
          "viestilista",
          mapper.writeValueAsString(Map("hakemusOid" -> hakemusOid)),
          ReadViestit,
          request
        )
        ResponseEntity.status(HttpStatus.OK).body(mapper.writeValueAsString(result))
      case Failure(exception @ (_: IllegalArgumentException | _: InvalidDataAccessApiUsageException)) =>
        LOG.error(s"Virheellinen sort-parametri: $sort", exception)
        errorMessageMapper.mapPlainErrorMessage(
          s"Virheellinen sort-parametri: $sort",
          HttpStatus.BAD_REQUEST
        )
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
            LOG.warn(s"Viestiä ei löytynyt id:illä: $id")
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
    @RequestBody viestiBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] =
    tallennaViesti(hakemusOid, viestiBytes, request)

  private def tallennaViesti(
    hakemusOid: String,
    viestiBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest,
    merkitseVahvistetuksi: Boolean = false
  ): ResponseEntity[Any] = {
    Try {
      val user   = userService.getEnrichedUserDetails(true)
      val viesti = mapper.readValue(viestiBytes, classOf[Viesti])
      viestiService.tallennaViesti(HakemusOid(hakemusOid), viesti, user.userOid, merkitseVahvistetuksi)
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
              mapper.writeValueAsString(newViesti)
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
    @RequestBody viestiBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] =
    tallennaViesti(hakemusOid, viestiBytes, request, true)

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

  @GetMapping(
    path = Array("viesti/oletussisalto/{hakemusOid}/{tyyppi}"),
    produces = Array(MediaType.TEXT_HTML_VALUE)
  )
  def getOletusSisalto(
    @PathVariable("hakemusOid") hakemusOid: String,
    @PathVariable("tyyppi") tyyppi: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val user        = userService.getEnrichedUserDetails(true)
      val contentType = OletusSisaltoTyyppi.fromString(tyyppi)
      val timezone    = request.getHeader("X-Timezone")
      val zone        = Option(timezone).map(ZoneId.of).getOrElse(ZoneId.of("UTC"))
      viestiService.haeOletusSisalto(HakemusOid(hakemusOid), user.userOid, contentType, zone)
    } match {
      case Success(result) =>
        result match {
          case Some(content) =>
            ResponseEntity.status(HttpStatus.OK).body(content)
          case None =>
            LOG.warn(
              s"Hakemuksen tietoja ei löytynyt hakemusOid:illa: $hakemusOid, oletussisältöä ei voitu generoida tyypille: $tyyppi"
            )
            errorMessageMapper.mapPlainErrorMessage(
              "Hakemuksen tietoja ei löytynyt, oletussisältöä ei voitu generoida",
              HttpStatus.NOT_FOUND
            )
        }
      case Failure(iae: IllegalArgumentException) =>
        LOG.error(s"Virheellinen sisältötyyppi", iae)
        errorMessageMapper.mapPlainErrorMessage(
          iae.getMessage,
          HttpStatus.BAD_REQUEST
        )
      case Failure(exception) =>
        LOG.error(s"Oletussisällön haku epäonnistui, hakemusOid: $hakemusOid, tyyppi: $tyyppi", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }
}
