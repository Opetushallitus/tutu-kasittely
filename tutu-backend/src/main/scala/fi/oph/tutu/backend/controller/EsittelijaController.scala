package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.service.UserService
import fi.oph.tutu.backend.utils.AuditOperation.ReadEsittelija
import fi.oph.tutu.backend.utils.{AuditLog, ErrorMessageMapper}
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.{HttpStatus, MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.{GetMapping, RequestMapping, RestController}

import scala.util.{Failure, Success, Try}

@RestController
@RequestMapping(path = Array("api"))
class EsittelijaController(
  userService: UserService,
  mapper: ObjectMapper,
  val auditLog: AuditLog
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[EsittelijaController])

  private val errorMessageMapper = new ErrorMessageMapper(mapper)

  @GetMapping(
    path = Array("esittelijat"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Hae kaikki esittelijät",
    responses = Array(
      new ApiResponse(
        responseCode = "200",
        description = RESPONSE_200_DESCRIPTION
      ),
      new ApiResponse(
        responseCode = "500",
        description = RESPONSE_500_DESCRIPTION
      )
    )
  )
  def haeEsittelijat(
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      userService.haeEsittelijat
    } match {
      case Success(users) =>
        auditLog.logRead("esittelijat", "", ReadEsittelija, request)
        val response = mapper.writeValueAsString(users)
        ResponseEntity.status(HttpStatus.OK).body(response)
      case Failure(exception) =>
        LOG.error("Esittelijöiden haku epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }
}
