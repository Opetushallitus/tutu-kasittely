package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.service.{UserService, YkViestiService}
import fi.oph.tutu.backend.utils.AuditOperation.*
import fi.oph.tutu.backend.utils.{AuditLog, AuditUtil, AuthoritiesUtil, ErrorMessageMapper}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.{HttpStatus, MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.{
  GetMapping,
  PatchMapping,
  PathVariable,
  PostMapping,
  RequestBody,
  RequestMapping,
  RequestParam,
  RestController
}

import java.time.LocalDateTime
import java.util.UUID
import java.util.regex.Pattern
import scala.util.{Failure, Success, Try}

@RestController
@RequestMapping(path = Array("api"))
class YkViestiController(
  ykViestiService: YkViestiService,
  userService: UserService,
  mapper: ObjectMapper,
  val auditLog: AuditLog
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[HakemusController])

  private val errorMessageMapper = new ErrorMessageMapper(mapper)

  @GetMapping(
    path = Array("ykViestiOnkoViesteja"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  def ykViestiOnkoViesteja(
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val user    = userService.getEnrichedUserDetails(true)
      val userOid = user.userOid

      ykViestiService.isYkViesteja(userOid)
    } match {
      case Success(viesteja) =>
        val response = mapper.writeValueAsString(viesteja)
        ResponseEntity.status(HttpStatus.OK).body(response)
      case Failure(exception) =>
        LOG.error("Yhteisen käsittelyn viestien tilan haku epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @GetMapping(
    path = Array("ykSaapuneetViestit"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  def haeYkSaapuneetViestit(
    @RequestParam(required = false) lahetetty: String,
    @RequestParam(required = false) hakija: String,
    @RequestParam(required = false) asiatunnus: String,
    @RequestParam(required = false) sort: String = SortDef.Undefined.toString,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val user      = userService.getEnrichedUserDetails(true)
      val userOid   = user.userOid
      val sortParam = resolveSortParams(sort)

      ykViestiService.haeYkSaapuneetViestit(
        userOid,
        sortParam
      )
    } match {
      case Success(ykviestit) =>
        val response = mapper.writeValueAsString(ykviestit)
        ResponseEntity.status(HttpStatus.OK).body(response)
      case Failure(exception) =>
        LOG.error("Yhteisen käsittelyn saapuneiden viestien listan haku epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @GetMapping(
    path = Array("ykLahetetytViestit"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  def haeYkLahetetytViestit(
    @RequestParam(required = false) lahetetty: String,
    @RequestParam(required = false) hakija: String,
    @RequestParam(required = false) asiatunnus: String,
    @RequestParam(required = false) sort: String = SortDef.Undefined.toString,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val user      = userService.getEnrichedUserDetails(true)
      val userOid   = user.userOid
      val sortParam = resolveSortParams(sort)

      ykViestiService.haeYkLahetetytViestit(
        userOid,
        sortParam
      )
    } match {
      case Success(ykviestit) =>
        val response = mapper.writeValueAsString(ykviestit)
        ResponseEntity.status(HttpStatus.OK).body(response)
      case Failure(exception) =>
        LOG.error("Yhteisen käsittelyn lähetettyjen viestien listan haku epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @GetMapping(
    path = Array("hakemus/{hakemusOid}/yhteinenkasittely"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  def haeHakemuksenYkViestit(
    @PathVariable("hakemusOid") hakemusOid: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      Seq()
    } match {
      case Success(ykViestit) =>
        val response = mapper.writeValueAsString(ykViestit)
        ResponseEntity.status(HttpStatus.OK).body(response)
      case Failure(exception) =>
        LOG.error("Hakemuksen yhteisen käsittelyn viestien haku epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @PostMapping(
    path = Array("hakemus/{hakemusOid}/yhteinenkasittely"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  def luoHakemuksenYkViesti(
    @PathVariable("hakemusOid") hakemusOid: String,
    @RequestBody ykViestiBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      Seq()
    } match {
      case Success(_) =>
        ResponseEntity.noContent().build()
      case Failure(exception) =>
        LOG.error("Hakemuksen yhteisen käsittelyn viestin luonti", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @PatchMapping(
    path = Array("hakemus/{hakemusOid}/yhteinenkasittely/{viestiId}"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  def vastaaHakemuksenYkViestiin(
    @PathVariable("hakemusOid") hakemusOid: String,
    @PathVariable("viestiId") viestiId: String,
    @RequestBody ykVastausBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      Seq()
    } match {
      case Success(_) =>
        ResponseEntity.noContent().build()
      case Failure(exception) =>
        LOG.error("Hakemuksen yhteisen käsittelyn viestiin vastaaminen", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }
}
