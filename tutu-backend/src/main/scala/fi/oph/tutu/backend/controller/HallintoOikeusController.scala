package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.domain.HallintoOikeus
import fi.oph.tutu.backend.exception.{HallintoOikeusNotFoundException, HallintoOikeusServiceException}
import fi.oph.tutu.backend.service.HallintoOikeusService
import fi.oph.tutu.backend.utils.{AuditLog, ErrorMessageMapper}
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.{Content, Schema}
import io.swagger.v3.oas.annotations.responses.{ApiResponse, ApiResponses}
import io.swagger.v3.oas.annotations.tags.Tag
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.{HttpStatus, MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.{GetMapping, PathVariable, RequestMapping, RequestParam, RestController}

import scala.util.{Failure, Success, Try}

@RestController
@RequestMapping(path = Array("api/hallinto-oikeus"))
@Tag(name = "Hallinto-oikeus", description = "Hallinto-oikeuksien tietojen hallinta")
class HallintoOikeusController(
  hallintoOikeusService: HallintoOikeusService,
  mapper: ObjectMapper,
  val auditLog: AuditLog
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[HallintoOikeusController])

  private val errorMessageMapper = new ErrorMessageMapper(mapper)

  @Operation(
    summary = "Hae hallinto-oikeus kunnan perusteella",
    description = "Hakee hallinto-oikeuden kuntakoodin perusteella maakunta-mappingin kautta. " +
      "Palauttaa hallinto-oikeuden yhteystiedot kaikilla kielillä (fi, sv, en).",
    tags = Array("Hallinto-oikeus")
  )
  @ApiResponses(
    value = Array(
      new ApiResponse(
        responseCode = "200",
        description = "Hallinto-oikeus löytyi onnistuneesti",
        content = Array(
          new Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            schema = new Schema(implementation = classOf[HallintoOikeus])
          )
        )
      ),
      new ApiResponse(
        responseCode = "404",
        description = "Kuntaa tai hallinto-oikeutta ei löytynyt annetulla kuntakoodilla"
      ),
      new ApiResponse(
        responseCode = "500",
        description = "Sisäinen palvelinvirhe hallinto-oikeuden haussa"
      )
    )
  )
  @GetMapping(
    path = Array("kunta/{kuntaKoodi}"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  def getByKunta(
    @Parameter(
      description = "Kuntakoodi (esim. '091' Helsingille, '853' Turulle)",
      required = true,
      example = "091"
    )
    @PathVariable("kuntaKoodi") kuntaKoodi: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      hallintoOikeusService.haeHallintoOikeusByKunta(kuntaKoodi)
    } match {
      case Success(hallintoOikeus) =>
        LOG.info(s"Hallinto-oikeus haettu onnistuneesti kuntakoodilla $kuntaKoodi")
        ResponseEntity.ok(hallintoOikeus)
      case Failure(e: HallintoOikeusNotFoundException) =>
        LOG.warn(s"Hallinto-oikeutta ei löytynyt kuntakoodilla $kuntaKoodi: ${e.getMessage}")
        ResponseEntity
          .status(HttpStatus.NOT_FOUND)
          .body(errorMessageMapper.mapErrorMessage(e))
      case Failure(e: HallintoOikeusServiceException) =>
        LOG.error(s"Palveluvirhe hallinto-oikeuden haussa kuntakoodilla $kuntaKoodi: ${e.getMessage}", e)
        ResponseEntity
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(errorMessageMapper.mapErrorMessage(e))
      case Failure(exception) =>
        LOG.error(s"Odottamaton virhe hallinto-oikeuden haussa kuntakoodilla $kuntaKoodi", exception)
        ResponseEntity
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(errorMessageMapper.mapErrorMessage(exception))
    }
  }

}
