package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.domain.{HakemusOid, PartialPerustelu, Perustelu}
import fi.oph.tutu.backend.service.{PerusteluService, UserService}
import fi.oph.tutu.backend.utils.AuditOperation.{ReadPerustelu, UpdatePerustelu}
import fi.oph.tutu.backend.utils.{AuditLog, AuditUtil, ErrorMessageMapper}
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.{Content, Schema}
import io.swagger.v3.oas.annotations.responses.ApiResponse
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.{HttpStatus, MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.{
  GetMapping,
  PathVariable,
  PostMapping,
  PutMapping,
  RequestBody,
  RequestMapping,
  RestController
}

import scala.util.{Failure, Success, Try}

@RestController
@RequestMapping(path = Array("api"))
class PerusteluController(
  perusteluService: PerusteluService,
  userService: UserService,
  mapper: ObjectMapper,
  val auditLog: AuditLog
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[PerusteluController])

  private val errorMessageMapper = new ErrorMessageMapper(mapper)

  @GetMapping(
    path = Array("perustelu/{hakemusOid}"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  def haePerustelu(
    @PathVariable("hakemusOid") hakemusOid: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      perusteluService.haePerustelu(HakemusOid(hakemusOid))
    } match {
      case Success(result) =>
        result match {
          case None =>
            LOG.info(s"Perustelua ei löytynyt")
            errorMessageMapper.mapPlainErrorMessage(
              "Perustelua ei löytynyt",
              HttpStatus.NOT_FOUND
            )
          case Some(perustelu) =>
            auditLog.logRead("perustelu", hakemusOid, ReadPerustelu, request)
            ResponseEntity
              .status(HttpStatus.OK)
              .body(mapper.writeValueAsString(perustelu))
        }
      case Failure(exception) =>
        LOG.error(s"Perustelun haku epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @GetMapping(
    path = Array("perustelu/{hakemusOid}/perustelumuistio"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  def haePerusteluMuistio(@PathVariable hakemusOid: String): ResponseEntity[Any] = {
    Try {
      perusteluService.haePerusteluMuistio(HakemusOid(hakemusOid))
    } match {
      case Success(perusteluMuistio) =>
        val response = mapper.writeValueAsString(perusteluMuistio)
        ResponseEntity.status(HttpStatus.OK).body(response)
      case Failure(exception) =>
        LOG.error("Perustelumuistion haku epäonnistui", exception.getMessage)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @PostMapping(
    path = Array("perustelu/{hakemusOid}"),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Deprecated
  def tallennaPerustelu(
    @PathVariable("hakemusOid") hakemusOid: String,
    @RequestBody perusteluBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val user                        = userService.getEnrichedUserDetails(true)
      val perustelu: PartialPerustelu =
        mapper.readValue(perusteluBytes, classOf[PartialPerustelu])

      perusteluService.tallennaPerustelu(
        HakemusOid(hakemusOid),
        perustelu,
        user.userOid
      )
    } match {
      case Success(result) =>
        result match {
          case (vanhaPerustelu, Some(paivitettyPerustelu)) =>
            auditLog.logChanges(
              auditLog.getUser(request),
              Map("hakemusOid" -> hakemusOid),
              UpdatePerustelu,
              AuditUtil.getChanges(
                vanhaPerustelu.map(h => mapper.writeValueAsString(h)),
                Some(mapper.writeValueAsString(paivitettyPerustelu))
              )
            )
            ResponseEntity
              .status(HttpStatus.OK)
              .body(mapper.writeValueAsString(paivitettyPerustelu))
          case _ =>
            LOG.warn(s"Perustelun tallennus epäonnistui")
            errorMessageMapper.mapPlainErrorMessage(
              "Perustelun tallennus epäonnistui",
              HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
      case Failure(e) =>
        LOG.error("Perustelun tallennus epäonnistui", e.getMessage)
        errorMessageMapper.mapPlainErrorMessage(
          RESPONSE_400_DESCRIPTION,
          HttpStatus.BAD_REQUEST
        )
    }
  }

  @PutMapping(
    path = Array("perustelu/{hakemusOid}"),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Tallentaa perustelun kokonaan (korvaa kaikki käyttäjän muokattavat kentät)",
    description = "PUT endpoint täydelle entiteetille. NULL arvo pyynnössä -> NULL tietokantaan.",
    requestBody = new io.swagger.v3.oas.annotations.parameters.RequestBody(
      content = Array(
        new Content(schema = new Schema(implementation = classOf[Perustelu]))
      )
    ),
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
  def paivitaPerusteluKokonaan(
    @PathVariable("hakemusOid") hakemusOid: String,
    @RequestBody perusteluBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val user                 = userService.getEnrichedUserDetails(true)
      val perustelu: Perustelu =
        mapper.readValue(perusteluBytes, classOf[Perustelu])

      perusteluService.paivitaPerusteluKokonaan(
        HakemusOid(hakemusOid),
        perustelu,
        user.userOid
      )
    } match {
      case Success(result) =>
        result match {
          case (vanhaPerustelu, Some(paivitettyPerustelu)) =>
            auditLog.logChanges(
              auditLog.getUser(request),
              Map("hakemusOid" -> hakemusOid),
              UpdatePerustelu,
              AuditUtil.getChanges(
                vanhaPerustelu.map(h => mapper.writeValueAsString(h)),
                Some(mapper.writeValueAsString(paivitettyPerustelu))
              )
            )
            ResponseEntity
              .status(HttpStatus.OK)
              .body(mapper.writeValueAsString(paivitettyPerustelu))
          case _ =>
            LOG.warn(s"Perustelun päivitys epäonnistui")
            errorMessageMapper.mapPlainErrorMessage(
              "Perustelun päivitys epäonnistui",
              HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
      case Failure(e) =>
        LOG.error("Perustelun päivitys epäonnistui", e.getMessage)
        errorMessageMapper.mapPlainErrorMessage(
          RESPONSE_400_DESCRIPTION,
          HttpStatus.BAD_REQUEST
        )
    }
  }
}
