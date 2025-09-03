package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.module.SimpleModule
import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.service.MaakoodiService
import fi.oph.tutu.backend.utils.ErrorMessageMapper
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.{HttpStatus, MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.*

import scala.util.{Failure, Success, Try}

@RestController
@RequestMapping(path = Array("api"))
class MaakoodiController(
  maakoodiService: MaakoodiService
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[MaakoodiController])

  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)
  mapper.registerModule(new JavaTimeModule)
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(SerializationFeature.INDENT_OUTPUT, true)
  mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)

  private val errorMessageMapper = new ErrorMessageMapper(mapper)

  @GetMapping(path = Array("maakoodit"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
  @Operation(
    summary = "Listaa maakoodit",
    responses = Array(
      new ApiResponse(responseCode = "200", description = "Pyyntö vastaanotettu"),
      new ApiResponse(responseCode = "500", description = "Palvelinvirhe")
    )
  )
  def listMaakoodit(): ResponseEntity[Any] = {
    Try {
      maakoodiService.listMaakoodit()
    } match {
      case Success(maakoodit) =>
        val response = mapper.writeValueAsString(maakoodit)
        ResponseEntity.status(HttpStatus.OK).body(response)
      case Failure(exception) =>
        LOG.error("Maakoodien haku epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }
}
