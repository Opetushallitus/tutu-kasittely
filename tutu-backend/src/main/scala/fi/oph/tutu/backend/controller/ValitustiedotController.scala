package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.domain.{HakemusOid, ValitusHO, ValitusKHO, ValitusOPH, Valitustiedot}
import fi.oph.tutu.backend.service.{HakemusService, UserService, ValitustiedotService}
import fi.oph.tutu.backend.utils.AuditOperation.{CreateValitustiedot, ReadValitustiedot, UpdateValitustiedot}
import fi.oph.tutu.backend.utils.{AuditLog, AuditUtil, ErrorMessageMapper}
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.{HttpStatus, MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.{
  GetMapping,
  PathVariable,
  PutMapping,
  RequestBody,
  RequestMapping,
  RestController
}

import scala.util.{Failure, Success, Try}

@RestController
@RequestMapping(path = Array("api"))
class ValitustiedotController(
  valitustiedotService: ValitustiedotService,
  hakemusService: HakemusService,
  userService: UserService,
  mapper: ObjectMapper,
  val auditLog: AuditLog
) {
  val LOG: Logger                = LoggerFactory.getLogger(classOf[ValitustiedotController])
  private val errorMessageMapper = new ErrorMessageMapper(mapper)

  @GetMapping(
    path = Array("valitustiedot/{hakemusOid}"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  def getValitustiedot(
    @PathVariable("hakemusOid") hakemusOid: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val user = userService.getEnrichedUserDetails(true)
      valitustiedotService.haeValitustiedot(HakemusOid(hakemusOid))
    } match {
      case Success(result) =>
        auditLog.logRead(
          "valitustiedot",
          mapper.writeValueAsString(Map("hakemusOid" -> hakemusOid)),
          ReadValitustiedot,
          request
        )
        result match {
          case Some(valitustiedot) =>
            ResponseEntity.status(HttpStatus.OK).body(mapper.writeValueAsString(valitustiedot))
          case None =>
            ResponseEntity
              .status(HttpStatus.OK)
              .body(
                mapper.writeValueAsString(
                  Valitustiedot(valitusOPH = ValitusOPH(), valitusHO = ValitusHO(), valitusKHO = ValitusKHO())
                )
              )
        }
      case Failure(exception) =>
        LOG.error(s"Valitustietojen haku epäonnistui hakemukselle $hakemusOid", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @PutMapping(
    path = Array("valitustiedot/{hakemusOid}"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Tallenna valitustiedot",
    description = "PUT endpoint täydelle entiteetille.",
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
  def tallennaValitustiedot(
    @PathVariable("hakemusOid") hakemusOid: String,
    @RequestBody valitustiedotBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val user          = userService.getEnrichedUserDetails(true)
      val valitustiedot = mapper.readValue(valitustiedotBytes, classOf[Valitustiedot])

      valitustiedotService.tallennaValitustiedot(HakemusOid(hakemusOid), valitustiedot, user.userOid)
    } match {
      case Success(result) =>
        result match {
          case (Some(current), Some(updatedValitustiedot)) =>
            auditLog.logChanges(
              auditLog.getUser(request),
              Map("hakemusOid" -> hakemusOid),
              UpdateValitustiedot,
              AuditUtil.getChanges(
                Some(mapper.writeValueAsString(current)),
                Some(mapper.writeValueAsString(updatedValitustiedot))
              )
            )
            ResponseEntity.status(HttpStatus.OK).body(mapper.writeValueAsString(updatedValitustiedot))
          case (None, Some(newValitustiedot)) =>
            auditLog.logCreate(
              auditLog.getUser(request),
              Map("hakemusOid" -> hakemusOid),
              CreateValitustiedot,
              mapper.writeValueAsString(newValitustiedot)
            )
            ResponseEntity.status(HttpStatus.OK).body(mapper.writeValueAsString(newValitustiedot))
          case _ =>
            LOG.warn(s"Valitustietojen tallennus epäonnistui")
            errorMessageMapper.mapPlainErrorMessage(
              "Viestin tallennus epäonnistui",
              HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
      case Failure(e) =>
        LOG.error(s"Valitustietojen tallennus epäonnistui, hakemusOid: $hakemusOid", e)
        errorMessageMapper.mapPlainErrorMessage(RESPONSE_400_DESCRIPTION, HttpStatus.BAD_REQUEST)
    }
  }
}
