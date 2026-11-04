package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.service.TilastoCsvService
import fi.oph.tutu.backend.utils.AuditOperation.ReadTilastokeskusCsv
import fi.oph.tutu.backend.utils.Utility.validateAikavali
import fi.oph.tutu.backend.utils.{AuditLog, ErrorMessageMapper, Utility}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.{HttpHeaders, HttpStatus, MediaType, ResponseEntity}
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.{GetMapping, RequestMapping, RequestParam, RestController}

import java.nio.charset.StandardCharsets
import java.time.ZonedDateTime
import scala.util.{Failure, Success, Try}

@RestController
@RequestMapping(path = Array("api"))
@PreAuthorize("@authFacade.hasTutuAuthorities")
class TilastoCsvController(mapper: ObjectMapper, val auditLog: AuditLog, tilastoCsvService: TilastoCsvService) {
  val LOG: Logger                = LoggerFactory.getLogger(classOf[TilastoCsvController])
  private val errorMessageMapper = new ErrorMessageMapper(mapper)

  @GetMapping(path = Array("tilastot/tilastokeskus-csv"))
  def downloadTilastokeskusCsv(
    @RequestParam("alkuPvm", required = false) alkuPvmStr: String,
    @RequestParam("loppuPvm", required = false) loppuPvmStr: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    val alkuPvm  = Option(alkuPvmStr)
    val loppuPvm = Option(loppuPvmStr)
    validateAikavali(alkuPvm, loppuPvm) match {
      case Some(virhe) =>
        LOG.warn(s"Virheellinen aikaväli CSV-latauksessa: $virhe")
        errorMessageMapper.mapPlainErrorMessage(virhe, HttpStatus.BAD_REQUEST)
      case None =>
        Try {
          tilastoCsvService.generateTilastokeskusCsv(alkuPvm, loppuPvm)
        } match {
          case Success(csv) =>
            auditLog.logRead(
              "tilastokeskus-csv",
              mapper.writeValueAsString(Map("alkuPvm" -> alkuPvm, "loppuPvm" -> loppuPvm)),
              ReadTilastokeskusCsv,
              request
            )
            ResponseEntity
              .ok()
              .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"tilastokeskus.csv\"")
              .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
              .body(csv.getBytes(StandardCharsets.UTF_8))
          case Failure(exception) =>
            LOG.error(
              s"CSV generointi Tilastokeskukselle epäonnistui, aikaväli ${alkuPvm.getOrElse("")} - ${loppuPvm.getOrElse("")}",
              exception
            )
            errorMessageMapper.mapErrorMessage(exception)
        }
    }
  }
}
