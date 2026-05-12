package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.domain.{Viestipohja, ViestipohjaKategoria}
import fi.oph.tutu.backend.service.{UserService, ViestipohjaService}
import fi.oph.tutu.backend.utils.AuditOperation.{
  CreateViestipohja,
  CreateViestipohjaKategoria,
  DeleteViestiPohja,
  ReadViestipohja,
  ReadViestipohjaKategoriat,
  ReadViestipohjat,
  UpdateViestipohja,
  UpdateViestipohjaKategoria
}
import fi.oph.tutu.backend.utils.{AuditLog, AuditUtil, ErrorMessageMapper}
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.HttpStatus.{NOT_FOUND, NO_CONTENT, OK}
import org.springframework.http.{MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.{
  DeleteMapping,
  GetMapping,
  PathVariable,
  PutMapping,
  RequestBody,
  RequestMapping,
  RestController
}

import java.util.UUID
import scala.util.{Failure, Success, Try}

@RestController
@RequestMapping(path = Array("api"))
class ViestipohjaController(
  viestipohjaService: ViestipohjaService,
  userService: UserService,
  mapper: ObjectMapper,
  val auditLog: AuditLog
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[ViestipohjaController])

  private val errorMessageMapper = new ErrorMessageMapper(mapper)

  @GetMapping(
    path = Array("viestipohja"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Hae viestipohjalista",
    description = "GET endpoint viestipohjalistan hakemiseen",
    responses = Array(
      new ApiResponse(
        responseCode = "200",
        description = RESPONSE_200_DESCRIPTION
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
  def haeViestipohjaLista(request: jakarta.servlet.http.HttpServletRequest): ResponseEntity[Any] = {
    Try {
      viestipohjaService.haeViestipohjaLista()
    } match {
      case Success(result) =>
        auditLog.logRead("viestipohjat", "", ReadViestipohjat, request)
        ResponseEntity.status(OK).body(mapper.writeValueAsString(result))
      case Failure(exception) =>
        LOG.error(s"Viestipohjien haku epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @GetMapping(
    path = Array("viestipohja/{viestipohjaId}"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Hae viestipohja",
    description = "GET endpoint yksittäisen viestipohjan hakemiseen.",
    responses = Array(
      new ApiResponse(
        responseCode = "200",
        description = RESPONSE_200_DESCRIPTION
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
  def haeViestipohja(
    @PathVariable viestipohjaId: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      viestipohjaService.haeViestipohja(UUID.fromString(viestipohjaId))
    } match {
      case Success(Some(result)) =>
        auditLog.logRead("viestipohjat", viestipohjaId, ReadViestipohja, request)
        ResponseEntity.status(OK).body(mapper.writeValueAsString(result))
      case Success(None) =>
        ResponseEntity.status(NOT_FOUND).build()
      case Failure(exception) =>
        LOG.error(s"Viestipohjien haku epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @GetMapping(
    path = Array("viestipohja/kategoria"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Hae viestipohja kategoriat",
    description = "GET endpoint viestipohja kategorioiden hakemiseen.",
    responses = Array(
      new ApiResponse(
        responseCode = "200",
        description = RESPONSE_200_DESCRIPTION
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
  def haeViestipohjaKategoriat(request: jakarta.servlet.http.HttpServletRequest): ResponseEntity[Any] = {
    Try {
      viestipohjaService.haeViestipohjaKategoriat()
    } match {
      case Success(result) =>
        auditLog.logRead("viestipohjaKategoriat", "", ReadViestipohjaKategoriat, request)
        ResponseEntity.status(OK).body(mapper.writeValueAsString(result))
      case Failure(exception) =>
        LOG.error(s"Viestipohja kategorioiden haku epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @PutMapping(
    path = Array("viestipohja/kategoria"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Tallenna viestipohja kategoria",
    description = "PUT endpoint viestipohja kategorian luomiseen tai olemassaolevan päivittämiseen.",
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
  def tallennaViestipohjaKategoria(
    @RequestBody viestipohjaKategoriaBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val user                 = userService.getEnrichedUserDetails(true)
      val viestipohjaKategoria = mapper.readValue(viestipohjaKategoriaBytes, classOf[ViestipohjaKategoria])

      viestipohjaKategoria.id match {
        case Some(id) =>
          val oldKategoria = viestipohjaService.haeViestipohjaKategoria(id)
          if (oldKategoria.isEmpty) {
            None
          } else {
            val updatedKategoria =
              viestipohjaService.paivitaViestipohjaKategoria(id, viestipohjaKategoria, user.userOid)
            auditLog.logChanges(
              auditLog.getUser(request),
              Map("viestipohjaKategoriaId" -> id.toString),
              UpdateViestipohjaKategoria,
              AuditUtil.getChanges(
                oldKategoria.map(mapper.writeValueAsString),
                updatedKategoria.map(mapper.writeValueAsString)
              )
            )
            updatedKategoria
          }
        case None =>
          val newKategoria = viestipohjaService.lisaaViestipohjaKategoria(viestipohjaKategoria, user.userOid)
          auditLog.logCreate(
            auditLog.getUser(request),
            Map("viestipohjaKategoriaId" -> newKategoria.id.get.toString),
            CreateViestipohjaKategoria,
            mapper.writeValueAsString(newKategoria)
          )
          Some(newKategoria)
      }
    } match {
      case Success(Some(result)) =>
        ResponseEntity.status(OK).body(mapper.writeValueAsString(result))
      case Success(None) =>
        LOG.error(s"Viestipohja kategoriaa ei löytynyt")
        ResponseEntity.status(NOT_FOUND).build()
      case Failure(exception) =>
        LOG.error(s"Viestipohja kategorian tallentaminen epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @PutMapping(
    path = Array("viestipohja"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Tallenna viestipohja",
    description = "PUT endpoint viestipohjan luomiseen tai olemassaolevan päivittämiseen.",
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
  def tallennaViestipohja(
    @RequestBody viestipohjaBytes: Array[Byte],
    request: HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val user        = userService.getEnrichedUserDetails(true)
      val viestipohja = mapper.readValue(viestipohjaBytes, classOf[Viestipohja])
      viestipohja.id match {
        case Some(id) =>
          val oldViestipohja = viestipohjaService.haeViestipohja(id)
          if (oldViestipohja.isEmpty) {
            None
          } else {
            val updatedViestipohja = viestipohjaService.paivitaViestipohja(id, viestipohja, user.userOid)
            auditLog.logChanges(
              auditLog.getUser(request),
              Map("viestipohjaId" -> id.toString),
              UpdateViestipohja,
              AuditUtil.getChanges(
                oldViestipohja.map(mapper.writeValueAsString),
                updatedViestipohja.map(mapper.writeValueAsString)
              )
            )
            updatedViestipohja
          }
        case None =>
          val newViestipohja = viestipohjaService.lisaaViestipohja(viestipohja, user.userOid)
          auditLog.logCreate(
            auditLog.getUser(request),
            Map("viestipohjaId" -> newViestipohja.id.get.toString),
            CreateViestipohja,
            mapper.writeValueAsString(newViestipohja)
          )
          Some(newViestipohja)
      }
    } match {
      case Success(Some(result)) =>
        ResponseEntity.status(OK).body(mapper.writeValueAsString(result))
      case Success(None) =>
        LOG.error(s"Viestipohjaa ei löytynyt")
        ResponseEntity.status(NOT_FOUND).build()
      case Failure(exception) =>
        LOG.error(s"Viestipohjan tallentaminen epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @DeleteMapping(
    path = Array("viestipohja/{viestipohjaId}")
  )
  @Operation(
    summary = "Poista viestipohja",
    description = "DELETE endpoint viestipohjan poistamiselle.",
    responses = Array(
      new ApiResponse(
        responseCode = "204",
        description = RESPONSE_200_DESCRIPTION
      ),
      new ApiResponse(
        responseCode = "404",
        description = RESPONSE_404_DESCRIPTION
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
  def poistaViestipohja(
    @PathVariable("viestipohjaId") viestipohjaId: String,
    request: HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      viestipohjaService.poistaViestipohja(UUID.fromString(viestipohjaId))
    } match {
      case Success(1) =>
        auditLog.logChanges(
          auditLog.getUser(request),
          Map("viestipohjaId" -> viestipohjaId),
          DeleteViestiPohja,
          AuditUtil.getChanges(None, None)
        )
        ResponseEntity.status(NO_CONTENT).body("")
      case Success(0) =>
        LOG.error(s"Viestipohjaa ei löytynyt")
        ResponseEntity.status(NOT_FOUND).body("")
      case Failure(exception) =>
        LOG.error(s"Viestipohjan poistaminen epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }
}
