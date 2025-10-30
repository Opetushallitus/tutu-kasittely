package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.service.KoodistoService
import fi.oph.tutu.backend.utils.ErrorMessageMapper
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.{HttpStatus, MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.{GetMapping, PathVariable, RequestMapping, RestController}

import scala.util.{Failure, Success, Try}

@RestController
@RequestMapping(path = Array("api"))
class KoodistoController(
  koodistoService: KoodistoService,
  mapper: ObjectMapper
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[KoodistoController])

  private val errorMessageMapper = new ErrorMessageMapper(mapper)

  @GetMapping(
    path = Array("koodisto/{koodisto}"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Hae koodisto nimen perusteella",
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
  def haeKoodisto(
    @PathVariable("koodisto") koodisto: String
  ): ResponseEntity[Any] = {
    Try {
      koodistoService.getKoodisto(koodisto)
    } match {
      case Success(koodisto) =>
        val response = mapper.writeValueAsString(koodisto)
        ResponseEntity.status(HttpStatus.OK).body(response)
      case Failure(exception) =>
        LOG.error("Koodiston haku epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }
}
