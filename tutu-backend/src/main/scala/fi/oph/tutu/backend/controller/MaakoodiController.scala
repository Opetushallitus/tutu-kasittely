package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.module.SimpleModule
import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.service.{KoodistoService, MaakoodiService, UserService}
import fi.oph.tutu.backend.utils.AuditOperation.{ReadLiitteenTiedot, ReadMaakoodit}
import fi.oph.tutu.backend.utils.{AuditLog, ErrorMessageMapper}
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.{HttpStatus, MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.*

import scala.util.{Failure, Success, Try}

@RestController
@RequestMapping(path = Array("api"))
class MaakoodiController(
  maakoodiService: MaakoodiService,
  koodistoService: KoodistoService,
  userService: UserService,
  val auditLog: AuditLog
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[MaakoodiController])

  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)
  mapper.registerModule(new JavaTimeModule)
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(SerializationFeature.INDENT_OUTPUT, true)
  mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)

  private val errorMessageMapper = new ErrorMessageMapper(mapper)

  @GetMapping(path = Array("maakoodi"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
  @Operation(
    summary = "Listaa maakoodit ja esittelijöiden maajaon",
    responses = Array(
      new ApiResponse(responseCode = "200", description = "Pyyntö vastaanotettu"),
      new ApiResponse(responseCode = "500", description = "Palvelinvirhe")
    )
  )
  def listMaakoodit(
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      // Varmistetaan, että maakoodit on synkattu koodistosta ennen hakua
      koodistoService.getKoodisto("maatjavaltiot2")
      maakoodiService.listMaakoodit()
    } match {
      case Success(maakoodit) =>
        auditLog.logRead("maakoodit", "kaikki", ReadMaakoodit, request)
        val response = mapper.writeValueAsString(maakoodit)
        ResponseEntity.status(HttpStatus.OK).body(response)
      case Failure(exception) =>
        LOG.error("Maakoodien haku epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @PutMapping(path = Array("maakoodi"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
  @Operation(
    summary = "Päivittää maakoodin esittelijän",
    responses = Array(
      new ApiResponse(responseCode = "200", description = "Pyyntö vastaanotettu"),
      new ApiResponse(responseCode = "404", description = "Ei löytynyt"),
      new ApiResponse(responseCode = "500", description = "Palvelinvirhe")
    )
  )
  def updateMaakoodi(
    @RequestParam("id") id: String,
    @RequestParam(required = false, name = "esittelijaId") esittelijaId: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val maakoodiId = java.util.UUID.fromString(id)
      val esittelija = Option(esittelijaId).map(java.util.UUID.fromString)
      // val user       = userService.getEnrichedUserDetails(true)
      maakoodiService.updateMaakoodi(maakoodiId, esittelija, "user.userOid")
    } match {
      case Success(result) =>
        result match {
          case None =>
            ResponseEntity.status(HttpStatus.NOT_FOUND).body("")
          case Some(maakoodi) =>
            val response = mapper.writeValueAsString(maakoodi)
            ResponseEntity.status(HttpStatus.OK).body(response)
        }
      case Failure(exception) =>
        LOG.error("Maakoodin päivitys epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }
}
