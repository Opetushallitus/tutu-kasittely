package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.core.`type`.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.domain.{HakemusOid, Tutkinto, UserOid}
import fi.oph.tutu.backend.service.{HakemusModifyOperationResolver, TutkintoService, UserService}
import fi.oph.tutu.backend.utils.AuditOperation.{DeleteTutkinto, ReadTutkinnot, TallennaTutkinnot, UpdateTutkinto}
import fi.oph.tutu.backend.utils.{AuditLog, AuditUtil, ErrorMessageMapper}
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.{ArraySchema, Content, Schema}
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
  RestController
}

import scala.util.{Failure, Success, Try}
import java.util.UUID

@RestController
@RequestMapping(path = Array("api"))
class TutkintoController(
  tutkintoService: TutkintoService,
  userService: UserService,
  mapper: ObjectMapper,
  val auditLog: AuditLog
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[TutkintoController])

  private val errorMessageMapper = new ErrorMessageMapper(mapper)

  @GetMapping(
    path = Array("hakemus/{hakemusOid}/tutkinto/"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Hakee kaikki hakemuksen tutkinnot",
    description = "GET endpoint kaikille hakemuksen tutkinnoille",
    responses = Array(
      new ApiResponse(
        responseCode = "200",
        description = RESPONSE_200_DESCRIPTION,
        content = Array(
          new Content(array = new ArraySchema(schema = new Schema(implementation = classOf[Tutkinto])))
        )
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
  def haeTutkinnot(
    @PathVariable("hakemusOid") hakemusOid: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      tutkintoService.haeTutkinnot(HakemusOid(hakemusOid))
    } match {
      case Success(result) =>
        auditLog.logRead("Tutkinnot", hakemusOid, ReadTutkinnot, request)
        ResponseEntity.status(HttpStatus.OK).body(mapper.writeValueAsString(result))
      case Failure(exception) =>
        LOG.error(s"Tutkintojen haku epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @PutMapping(
    path = Array("hakemus/{hakemusOid}/tutkinto/"),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Tallentaa kaikki hakemuksen tutkinnot",
    description = "PUT endpoint kaikille hakemuksen tutkinnoille",
    requestBody = new io.swagger.v3.oas.annotations.parameters.RequestBody(
      content = Array(
        new Content(array = new ArraySchema(schema = new Schema(implementation = classOf[Tutkinto])))
      )
    ),
    responses = Array(
      new ApiResponse(
        responseCode = "200",
        description = RESPONSE_200_DESCRIPTION,
        content = Array(
          new Content(array = new ArraySchema(schema = new Schema(implementation = classOf[Tutkinto])))
        )
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
  def tallennaTutkinnot(
    @PathVariable("hakemusOid") hakemusOid: String,
    @RequestBody tutkintoBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val user                     = userService.getEnrichedUserDetails(true)
      val tutkinnot: Seq[Tutkinto] = mapper.readValue(tutkintoBytes, new TypeReference[Seq[Tutkinto]] {})
      val tallennetutTutkinnot     = tutkintoService.haeTutkinnot(HakemusOid(hakemusOid))

      tutkintoService.tallennaTutkinnot(
        HakemusModifyOperationResolver.resolveTutkintoModifyOperations(tallennetutTutkinnot, tutkinnot),
        UserOid(user.userOid)
      )
      (tallennetutTutkinnot, tutkinnot)
    } match {
      case Success((tallennetutTutkinnot, tutkinnot)) =>
        auditLog.logChanges(
          auditLog.getUser(request),
          Map("hakemusOid" -> hakemusOid),
          TallennaTutkinnot,
          AuditUtil.getChanges(
            Some(mapper.writeValueAsString(tallennetutTutkinnot)),
            Some(mapper.writeValueAsString(tutkinnot))
          )
        )
        ResponseEntity.status(HttpStatus.OK).body(mapper.writeValueAsString(tutkinnot))
      case Failure(e) =>
        LOG.error("Tutkintojen tallentaminen epäonnistui", e)
        errorMessageMapper.mapPlainErrorMessage(
          RESPONSE_400_DESCRIPTION,
          HttpStatus.BAD_REQUEST
        )
    }
  }

  @PutMapping(
    path = Array("hakemus/{hakemusOid}/tutkinto/{tutkintoId}"),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Päivitä yksittäinen tutkinto",
    description = "PUT endpoint yksittäisen tutkinnon päivittämiseen",
    requestBody = new io.swagger.v3.oas.annotations.parameters.RequestBody(
      content = Array(
        new Content(schema = new Schema(implementation = classOf[Tutkinto]))
      )
    ),
    responses = Array(
      new ApiResponse(
        responseCode = "200",
        description = RESPONSE_200_DESCRIPTION,
        content = Array(
          new Content(schema = new Schema(implementation = classOf[Tutkinto]))
        )
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
        responseCode = "404",
        description = RESPONSE_404_DESCRIPTION
      ),
      new ApiResponse(
        responseCode = "500",
        description = RESPONSE_500_DESCRIPTION
      )
    )
  )
  def tallennaTutkinto(
    @PathVariable("hakemusOid") hakemusOid: String,
    @PathVariable("tutkintoId") tutkintoId: String,
    @RequestBody tutkintoBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    tutkintoService.haeTutkinto(UUID.fromString(tutkintoId)) match {
      case None                => ResponseEntity.status(HttpStatus.NOT_FOUND).build()
      case Some(vanhaTutkinto) =>
        Try {
          val user               = userService.getEnrichedUserDetails(true)
          val tutkinto: Tutkinto = mapper.readValue(tutkintoBytes, classOf[Tutkinto])
          tutkintoService.paivitaTutkinto(tutkinto, UserOid(user.userOid))
          tutkinto
        } match {
          case Success(tutkinto: Tutkinto) =>
            auditLog.logChanges(
              auditLog.getUser(request),
              Map("hakemusOid" -> hakemusOid, "tutkintoId" -> tutkintoId),
              UpdateTutkinto,
              AuditUtil.getChanges(
                Some(mapper.writeValueAsString(vanhaTutkinto)),
                Some(mapper.writeValueAsString(tutkinto))
              )
            )
            ResponseEntity.status(HttpStatus.OK).body(mapper.writeValueAsString(tutkinto))
          case Failure(e) =>
            LOG.error("Tutkinnon tallentaminen epäonnistui", e)
            errorMessageMapper.mapPlainErrorMessage(
              RESPONSE_400_DESCRIPTION,
              HttpStatus.BAD_REQUEST
            )
        }
    }
  }

  @DeleteMapping(path = Array("hakemus/{hakemusOid}/tutkinto/{tutkintoId}"))
  @Operation(
    summary = "Poistaa tutkinnon",
    description = "DELETE endpoint yksittäisen tutkinnon poistamiseen",
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
  def poistaTutkinto(
    @PathVariable tutkintoId: String,
    @PathVariable hakemusOid: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      tutkintoService.poistaTutkinto(UUID.fromString(tutkintoId))
    } match {
      case Success(result) =>
        if (result == 0) {
          ResponseEntity.notFound().build()
        } else {
          auditLog.logChanges(
            auditLog.getUser(request),
            Map("hakemusOid" -> hakemusOid, "tutkintoId" -> tutkintoId),
            DeleteTutkinto,
            AuditUtil.getChanges(
              None,
              None
            )
          )
          ResponseEntity.noContent().build()
        }
      case Failure(e) =>
        LOG.error("Tutkinnon poistaminen epäonnistui", e)
        errorMessageMapper.mapErrorMessage(e)
    }
  }
}
