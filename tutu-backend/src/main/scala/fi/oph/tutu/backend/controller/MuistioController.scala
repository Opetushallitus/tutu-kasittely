package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.domain.{HakemusOid, MuistioPostBody}
import fi.oph.tutu.backend.service.{MuistioService, UserService}
import fi.oph.tutu.backend.utils.AuditOperation.{CreateMuistio, ReadMuistio}
import fi.oph.tutu.backend.utils.{AuditLog, ErrorMessageMapper}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.{HttpStatus, MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.{
  GetMapping,
  PathVariable,
  PutMapping,
  RequestBody,
  RequestMapping,
  RequestParam,
  RestController
}

import scala.util.{Failure, Success, Try}

@RestController
@RequestMapping(path = Array("api"))
class MuistioController(
  muistioService: MuistioService,
  userService: UserService,
  mapper: ObjectMapper,
  val auditLog: AuditLog
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[MuistioController])

  private val errorMessageMapper = new ErrorMessageMapper(mapper)

  @GetMapping(
    path = Array("muistio/{hakemusOid}/{hakemuksenOsa}"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  def haeMuistio(
    @PathVariable("hakemusOid") hakemusOid: String,
    @PathVariable("hakemuksenOsa") hakemuksenOsa: String,
    @RequestParam("nakyvyys") nakyvyys: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val sisainen: Boolean       = nakyvyys == "sisainen"
      val _hakemusOid: HakemusOid = HakemusOid(hakemusOid)

      muistioService.haeMuistio(_hakemusOid, hakemuksenOsa, sisainen)
    } match {
      case Success(result) =>
        result match {
          case None =>
            LOG.warn(s"Muistiota ei löytynyt")
            ResponseEntity
              .status(HttpStatus.NO_CONTENT)
              .body("Muistiota ei löytynyt")
          case Some(muistio) =>
            val params = mapper.writeValueAsString(
              Map(
                "hakemusOid"    -> Option(hakemusOid).getOrElse(""),
                "hakemuksenOsa" -> Option(hakemuksenOsa).getOrElse(""),
                "nakyvyys"      -> Option(nakyvyys).getOrElse("")
              )
            )
            auditLog.logRead("muistio", params, ReadMuistio, request)
            ResponseEntity
              .status(HttpStatus.OK)
              .body(mapper.writeValueAsString(muistio))
        }
      case Failure(exception) =>
        LOG.error(s"Muistion haku epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @PutMapping(
    path = Array("muistio/{hakemusOid}/{hakemuksenOsa}"),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  def tallennaMuistio(
    @PathVariable("hakemusOid") hakemusOid: String,
    @PathVariable("hakemuksenOsa") hakemuksenOsa: String,
    @RequestBody muistioBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val user                             = userService.getEnrichedUserDetails(true)
      val muistioPostBody: MuistioPostBody =
        mapper.readValue(muistioBytes, classOf[MuistioPostBody])

      val sisainen: Boolean       = muistioPostBody.nakyvyys == "sisainen"
      val _hakemusOid: HakemusOid = HakemusOid(hakemusOid)

      muistioService.tallennaMuistio(
        _hakemusOid,
        hakemuksenOsa,
        sisainen,
        muistioPostBody.sisalto,
        user.userOid
      )
    } match {
      case Success(result) =>
        result match {
          case None =>
            LOG.warn(s"Muistiota ei löytynyt")
            errorMessageMapper.mapPlainErrorMessage(
              "Muistion tallennus epäonnistui",
              HttpStatus.INTERNAL_SERVER_ERROR
            )
          case Some(muistioId) =>
            val params = mapper
              .writeValueAsString(
                Map(
                  "hakemuksenOsa" -> hakemuksenOsa,
                  "muistio"       -> new String(muistioBytes)
                )
              )
            auditLog.logCreate(
              auditLog.getUser(request),
              Map("hakemusOid" -> hakemusOid),
              CreateMuistio,
              params
            )
            ResponseEntity.status(HttpStatus.OK).body(muistioId)
        }
      case Failure(e) =>
        LOG.error("Muistion tallennus epäonnistui", e.getMessage)
        errorMessageMapper.mapPlainErrorMessage(
          RESPONSE_400_DESCRIPTION,
          HttpStatus.BAD_REQUEST
        )
    }
  }
}
