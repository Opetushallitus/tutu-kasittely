package fi.oph.tutu.backend.controller.migration

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.service.UserService
import fi.oph.tutu.backend.service.migration.VanhaTutuService
import fi.oph.tutu.backend.service.migration.MigrationService
import fi.oph.tutu.backend.utils.{AuditLog, AuditOperation, ErrorMessageMapper}
import fi.vm.sade.auditlog.Changes
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.{HttpStatus, MediaType, ResponseEntity}
import org.springframework.web.bind.annotation._

import scala.util.{Failure, Success, Try}

@RestController
@RequestMapping(path = Array("api"))
class VanhaTutuController(
  migrationService: MigrationService,
  vanhaTutuService: VanhaTutuService,
  val auditLog: AuditLog,
  userService: UserService
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[VanhaTutuController])

  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)
  mapper.registerModule(new JavaTimeModule)
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(SerializationFeature.INDENT_OUTPUT, true)
  mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)

  private val errorMessageMapper = new ErrorMessageMapper(mapper)

  /**
   * Käynnistää migraation S3-tiedostosta.
   *
   * Hakee XML-tiedoston S3:sta annetulla avaimella ja käynnistää migraatioprosessin.
   * Migraatio on idempotentti - sama tiedosto voidaan käsitellä useita kertoja turvallisesti.
   *
   * Dev-ympäristöissä mock-dokumenttipalvelu palauttaa aina mock XML-tiedoston.
   */
  @GetMapping(path = Array("migration/start"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
  @Operation(
    summary = "Käynnistää migraation annetusta tiedostosta, key on tiedoston S3 tunniste",
    responses = Array(
      new ApiResponse(responseCode = "200", description = "Migraatio onnistui"),
      new ApiResponse(responseCode = "500", description = "Palvelinvirhe")
    )
  )
  def startMigration(
    @RequestParam("key") key: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    val user      = userService.getEnrichedUserDetails(true)
    val auditUser = auditLog.getUser(request)
    migrationService.orchestrateMigration(key) match {
      case Success(_) =>
        auditLog.logChanges(
          auditUser,
          Map("key" -> key),
          AuditOperation.StartMigration,
          new Changes.Builder().added("key", key).build()
        )
        val response = mapper.writeValueAsString(Map("status" -> "success"))
        ResponseEntity.status(HttpStatus.OK).body(response)
      case Failure(exception) =>
        LOG.error("Migraatio epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  /**
   * Hakee migroidun vanha tutu -tiedon ID:n perusteella.
   *
   * Palauttaa JSON-muodossa tallennetun tiedon, joka on migroitu
   * FileMaker XML:stä tietokantaan.
   *
   * @param id Migroidun tietueen UUID
   */
  @GetMapping(path = Array("vanha-tutu/{id}"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
  @Operation(
    summary = "Hakee vanha tutu -tiedot ID:n perusteella",
    responses = Array(
      new ApiResponse(responseCode = "200", description = "Haku onnistui"),
      new ApiResponse(responseCode = "404", description = "Tietuetta ei löytynyt"),
      new ApiResponse(responseCode = "500", description = "Palvelinvirhe")
    )
  )
  def getVanhaTutuById(
    @PathVariable("id") id: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val uuid = java.util.UUID.fromString(id)
      uuid
    } match {
      case Success(uuid) =>
        vanhaTutuService.haeVanhaTutuById(uuid) match {
          case Success(Some(data)) =>
            auditLog.logRead("vanha-tutu", s"vanha-tutu/$id", AuditOperation.ReadVanhaTutu, request)
            ResponseEntity.status(HttpStatus.OK).body(data)
          case Success(None) =>
            LOG.warn(s"Vanha tutu -tietuetta ei löytynyt id:llä: $id")
            val errorBody = mapper.writeValueAsString(Map("error" -> "Tietuetta ei löytynyt"))
            ResponseEntity
              .status(HttpStatus.NOT_FOUND)
              .contentType(MediaType.APPLICATION_JSON)
              .body(errorBody)
          case Failure(exception) =>
            LOG.error(s"Vanhan tutun haku epäonnistui, id: $id", exception)
            errorMessageMapper.mapErrorMessage(exception)
        }
      case Failure(exception) =>
        LOG.error(s"Virheellinen UUID-muoto, id: $id", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }
}
