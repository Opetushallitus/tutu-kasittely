package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.domain.{HakemusOid, Paatos, Paatosteksti}
import fi.oph.tutu.backend.service.{NotFoundException, PaatosService, UserService}
import fi.oph.tutu.backend.utils.AuditOperation.*
import fi.oph.tutu.backend.utils.{AuditLog, AuditUtil, ErrorMessageMapper}
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.{HttpStatus, MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.*

import scala.util.{Failure, Success, Try}

@RestController
@RequestMapping(path = Array("api"))
class PaatosController(
  paatosService: PaatosService,
  userService: UserService,
  mapper: ObjectMapper,
  val auditLog: AuditLog
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[PaatosController])

  private val errorMessageMapper = new ErrorMessageMapper(mapper)

  @GetMapping(
    path = Array("paatos/{hakemusOid}"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Hae päätös hakemuksen ja lomakkeen perusteella",
    responses = Array(
      new ApiResponse(
        responseCode = "200",
        description = RESPONSE_200_DESCRIPTION
      ),
      new ApiResponse(
        responseCode = "404",
        description = "Päätöstä ei löytynyt"
      ),
      new ApiResponse(
        responseCode = "500",
        description = RESPONSE_500_DESCRIPTION
      )
    )
  )
  def haePaatos(
    @PathVariable("hakemusOid") hakemusOid: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      paatosService.haePaatos(HakemusOid(hakemusOid))
    } match {
      case Success(result) =>
        result match {
          case None =>
            LOG.info(s"Päätöstä ei löytynyt")
            errorMessageMapper.mapPlainErrorMessage("Päätöstä ei löytynyt", HttpStatus.NOT_FOUND)
          case Some(paatos) =>
            auditLog.logRead("päätös", hakemusOid, ReadPaatos, request)
            ResponseEntity.status(HttpStatus.OK).body(mapper.writeValueAsString(paatos))
        }
      case Failure(exception) =>
        LOG.error(s"Päätöksen haku epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @PutMapping(
    path = Array("paatos/{hakemusOid}"),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Tallenna päätös osittain (päivittää vain pyynnössä olevat kentät)",
    description = "POST endpoint osittaisille päivityksille. Vain pyynnössä olevat kentät päivitetään.",
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
  def tallennaPaatos(
    @PathVariable("hakemusOid") hakemusOid: String,
    @RequestBody paatosBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val user           = userService.getEnrichedUserDetails(true)
      val paatos: Paatos = mapper.readValue(paatosBytes, classOf[Paatos])

      paatosService.tallennaPaatos(HakemusOid(hakemusOid), paatos, user.userOid)
    } match {
      case Success(result) =>
        result match {
          case (vanhaPaatos, Some(paivitettyPaatos)) =>
            auditLog.logChanges(
              auditLog.getUser(request),
              Map("hakemusOid" -> hakemusOid),
              UpdatePaatos,
              AuditUtil.getChanges(
                vanhaPaatos.map(vp => mapper.writeValueAsString(vp)),
                Some(mapper.writeValueAsString(paivitettyPaatos))
              )
            )
            ResponseEntity.status(HttpStatus.OK).body(mapper.writeValueAsString(paivitettyPaatos))

          case _ =>
            LOG.warn(s"Päätöksen tallennus epäonnistui")
            errorMessageMapper.mapPlainErrorMessage(
              "Päätöksen tallennus epäonnistui",
              HttpStatus.INTERNAL_SERVER_ERROR
            )

        }
      case Failure(e) =>
        LOG.error(s"Päätöksen tallennus epäonnistui, hakemusOid: $hakemusOid", e)
        errorMessageMapper.mapPlainErrorMessage(RESPONSE_400_DESCRIPTION, HttpStatus.BAD_REQUEST)

    }
  }

  @GetMapping(
    path = Array("paatos/{hakemusOid}/paatosteksti/generate"),
    produces = Array(MediaType.TEXT_HTML_VALUE)
  )
  @Operation(
    summary = "Generoi päätöstekstipohjan",
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
  def generatePaatosteksti(
    @PathVariable hakemusOid: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      paatosService.generatePaatosTeksti(HakemusOid(hakemusOid))
    } match {
      case Success(paatosTekstiJaKieli) =>
        auditLog.logRead("päätös", hakemusOid, ReadPaatosPreview, request)
        ResponseEntity.status(HttpStatus.OK).body(paatosTekstiJaKieli._1)
      case Failure(exception) =>
        LOG.error(s"Päätöstekstin generointi epäonnistui, hakemusOid: $hakemusOid", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @GetMapping(
    path = Array("paatos/{hakemusOid}/paatosteksti"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Generoi tai hakee olemassaolevan päätöstekstin",
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
  def haePaatosteksti(
    @PathVariable hakemusOid: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val user = userService.getEnrichedUserDetails(true)
      paatosService.haeTaiGeneroiPaatosteksti(HakemusOid(hakemusOid), user.userOid)
    } match {
      case Success(paatosteksti) =>
        auditLog.logRead("päätösteksti", hakemusOid, ReadPaatosteksti, request)
        ResponseEntity.status(HttpStatus.OK).body(mapper.writeValueAsString(paatosteksti))
      case Failure(exception) =>
        LOG.error(
          s"Päätöstekstin haku epäonnistui, hakemusOid: $hakemusOid",
          exception
        )
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @PutMapping(
    path = Array("paatos/{hakemusOid}/paatosteksti"),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Päivittää päätöstekstin",
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
        responseCode = "500",
        description = RESPONSE_500_DESCRIPTION
      )
    )
  )
  def tallennaPaatosteksti(
    @PathVariable hakemusOid: String,
    @RequestBody paatosBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    val user         = userService.getEnrichedUserDetails(true)
    val paatosteksti = mapper.readValue(paatosBytes, classOf[Paatosteksti])
    Try {
      paatosService.tallennaPaatosteksti(
        HakemusOid(hakemusOid),
        paatosteksti,
        user.userOid
      )
    } match {
      case Success(vanhaJaUusi) =>
        auditLogTallennus(vanhaJaUusi, hakemusOid, request)
        ResponseEntity.status(HttpStatus.OK).body(mapper.writeValueAsString(vanhaJaUusi._2))
      case Failure(exception: NotFoundException) =>
        LOG.error(
          s"Päätöstekstin tallennus epäonnistui, hakemusOid: $hakemusOid ${paatosteksti.id.map(id => s", paatostekstiId: $id").getOrElse("")}",
          exception
        )
        errorMessageMapper.mapErrorMessage(exception, HttpStatus.BAD_REQUEST)
      case Failure(exception) =>
        LOG.error(
          s"Päätöstekstin tallennus epäonnistui, hakemusOid: $hakemusOid ${paatosteksti.id.map(id => s", paatostekstiId: $id").getOrElse("")}",
          exception
        )
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @PutMapping(
    path = Array("paatos/{hakemusOid}/paatosteksti/vahvista"),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Päivittää päätöstekstin ja merkitsee sen vahvistetuksi",
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
        responseCode = "500",
        description = RESPONSE_500_DESCRIPTION
      )
    )
  )
  def vahvistaPaatosteksti(
    @PathVariable hakemusOid: String,
    @RequestBody paatosBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    val user         = userService.getEnrichedUserDetails(true)
    val paatosteksti = mapper.readValue(paatosBytes, classOf[Paatosteksti])
    Try {
      paatosService.vahvistaPaatosteksti(
        HakemusOid(hakemusOid),
        paatosteksti,
        user.userOid
      )
    } match {
      case Success(vanhaJaUusi) =>
        auditLogTallennus(vanhaJaUusi, hakemusOid, request)
        ResponseEntity.status(HttpStatus.OK).body(mapper.writeValueAsString(vanhaJaUusi._2))
      case Failure(exception: NotFoundException) =>
        LOG.error(
          s"Päätöstekstin vahvistus epäonnistui, hakemusOid: $hakemusOid ${paatosteksti.id.map(id => s", paatostekstiId: $id").getOrElse("")}",
          exception
        )
        errorMessageMapper.mapErrorMessage(exception, HttpStatus.BAD_REQUEST)
      case Failure(exception) =>
        LOG.error(
          s"Päätöstekstin vahvistus epäonnistui, hakemusOid: $hakemusOid ${paatosteksti.id.map(id => s", paatostekstiId: $id").getOrElse("")}",
          exception
        )
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  private def auditLogTallennus(
    vanhaJaUusi: (Option[Paatosteksti], Paatosteksti),
    hakemusOid: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): Unit = {
    vanhaJaUusi match {
      case (Some(vanha), uusi) =>
        auditLog.logChanges(
          auditLog.getUser(request),
          Map("hakemusOid" -> hakemusOid),
          UpdatePaatosteksti,
          AuditUtil.getChanges(
            Some(mapper.writeValueAsString(vanha)),
            Some(mapper.writeValueAsString(uusi))
          )
        )
      case _ =>
        auditLog.logCreate(
          auditLog.getUser(request),
          Map("hakemusOid" -> hakemusOid),
          CreatePaatosteksti,
          vanhaJaUusi._2
        )
    }
  }
}
