package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.service.{EsittelijaService, UserService, YkViestiService}
import fi.oph.tutu.backend.utils.{AuditLog, AuthoritiesUtil, ErrorMessageMapper}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.{HttpStatus, MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.{
  DeleteMapping,
  GetMapping,
  PatchMapping,
  PathVariable,
  PostMapping,
  RequestBody,
  RequestMapping,
  RequestParam,
  RestController
}

import scala.util.{Failure, Success, Try}
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse

@RestController
@RequestMapping(path = Array("api"))
class YkViestiController(
  ykViestiService: YkViestiService,
  userService: UserService,
  esittelijaService: EsittelijaService,
  mapper: ObjectMapper,
  val auditLog: AuditLog
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[YkViestiController])

  private val errorMessageMapper = new ErrorMessageMapper(mapper)

  private def haeNimet(ykViesti: YkViesti): YkViesti =
    ykViesti.copy(
      vastaanottaja = ykViesti.vastaanottajaOid.map(esittelijaService.haeEsittelijaNimi),
      jatkoKasittelyt = ykViesti.jatkoKasittelyt.map(haeNimet)
    )

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
    @RequestParam(required = false, defaultValue = "") sort: String,
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
    @RequestParam(required = false, defaultValue = "") sort: String,
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
  def haeHakemuksenYkViestiketjut(
    @PathVariable("hakemusOid") hakemusOid: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    try {
      val user        = userService.getEnrichedUserDetails(true)
      val authorities = user.authorities

      if (!AuthoritiesUtil.hasTutuAuthorities(authorities)) {
        errorMessageMapper.mapPlainErrorMessage(
          RESPONSE_403_DESCRIPTION,
          HttpStatus.FORBIDDEN
        )
      } else {
        Try {
          ykViestiService.haeHakemuksenYkViestiketjut(hakemusOid)
        } match {
          case Success(ykViestit) =>
            val response = mapper.writeValueAsString(
              ykViestit.map { ketju =>
                ketju.copy(
                  aloitusViesti = haeNimet(ketju.aloitusViesti),
                  jatkoKasittelyt = ketju.jatkoKasittelyt.map(haeNimet)
                )
              }
            )
            ResponseEntity.status(HttpStatus.OK).body(response)
          case Failure(exception) =>
            LOG.error("Hakemuksen yhteisen käsittelyn viestien haku epäonnistui", exception)
            errorMessageMapper.mapErrorMessage(exception)
        }
      }
    } catch {
      case e: Exception =>
        LOG.error(s"Hakemuksen yhteisen käsittelyn viestien haku epäonnistui: ${e.getMessage}", e)
        errorMessageMapper.mapErrorMessage(e)
    }
  }

  @PostMapping(
    path = Array("hakemus/{hakemusOid}/yhteinenkasittely"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  def luoHakemuksenYkViesti(
    @PathVariable("hakemusOid") hakemusOid: String,
    @RequestBody ykKysymysBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    try {
      val user        = userService.getEnrichedUserDetails(true)
      val authorities = user.authorities

      if (!AuthoritiesUtil.hasTutuAuthorities(authorities)) {
        errorMessageMapper.mapPlainErrorMessage(
          RESPONSE_403_DESCRIPTION,
          HttpStatus.FORBIDDEN
        )
      } else {
        var ykKysymys: YkKysymysDTO = null
        try ykKysymys = mapper.readValue(ykKysymysBytes, classOf[YkKysymysDTO])
        catch {
          case e: Exception =>
            LOG.error(s"Yhteisen käsittelyn viestin luominen epäonnistui: ${e.getMessage}", e)
            return errorMessageMapper.mapPlainErrorMessage(
              RESPONSE_400_DESCRIPTION,
              HttpStatus.BAD_REQUEST
            )
        }
        if (ykKysymys.vastaanottajaOid.isEmpty || ykKysymys.viesti.isEmpty) {
          LOG.error(s"Yhteisen käsittelyn viestin luominen epäonnistui: virheelliset parametrit")
          return errorMessageMapper.mapPlainErrorMessage(
            RESPONSE_400_DESCRIPTION,
            HttpStatus.BAD_REQUEST
          )
        }

        Try {
          ykViestiService.tallennaHakemuksenYkViesti(
            hakemusOid,
            user,
            ykKysymys
          )
        } match {
          case Success(_) =>
            ResponseEntity.noContent().build()
          case Failure(exception) =>
            LOG.error("Yhteisen käsittelyn viestin luominen epäonnistui", exception)
            errorMessageMapper.mapErrorMessage(exception)
        }
      }
    } catch {
      case e: Exception =>
        LOG.error(s"Yhteisen käsittelyn viestin luominen epäonnistui: ${e.getMessage}", e)
        errorMessageMapper.mapErrorMessage(e)
    }
  }

  @PostMapping(
    path = Array("hakemus/{hakemusOid}/yhteinenkasittely/{viestiId}"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  def vastausviestiYkViestiin(
    @PathVariable("hakemusOid") hakemusOid: String,
    @PathVariable("viestiId") viestiId: String,
    @RequestBody ykVastausBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    try {
      val user        = userService.getEnrichedUserDetails(true)
      val authorities = user.authorities

      if (!AuthoritiesUtil.hasTutuAuthorities(authorities)) {
        errorMessageMapper.mapPlainErrorMessage(
          RESPONSE_403_DESCRIPTION,
          HttpStatus.FORBIDDEN
        )
      } else {
        var ykVastaus: YkVastausDTO = null
        try ykVastaus = mapper.readValue(ykVastausBytes, classOf[YkVastausDTO])
        catch {
          case e: Exception =>
            LOG.error(s"Yhteisen käsittelyn viestiin vastaaminen epäonnistui: ${e.getMessage}", e)
            return errorMessageMapper.mapPlainErrorMessage(
              RESPONSE_400_DESCRIPTION,
              HttpStatus.BAD_REQUEST
            )
        }

        if (ykVastaus.id.isEmpty || ykVastaus.vastaus.isEmpty) {
          LOG.error(s"Yhteisen käsittelyn viestiin vastaaminen epäonnistui: virheelliset parametrit")
          return errorMessageMapper.mapPlainErrorMessage(
            RESPONSE_400_DESCRIPTION,
            HttpStatus.BAD_REQUEST
          )
        }

        Try {
          ykViestiService.tallennaHakemuksenYkViesti(
            hakemusOid,
            user,
            ykKysymys = YkKysymysDTO(
              parentId = Some(viestiId),
              viesti = ykVastaus.vastaus,
              vastaanottajaOid = None
            )
          )
        } match {
          case Success(_) =>
            ResponseEntity.noContent().build()
          case Failure(exception) =>
            LOG.error("Yhteisen käsittelyn viestiin vastaaminen epäonnistui", exception)
            errorMessageMapper.mapErrorMessage(exception)
        }
      }
    } catch {
      case e: Exception =>
        LOG.error(s"Yhteisen käsittelyn viestiin vastaaminen epäonnistui: ${e.getMessage}", e)
        errorMessageMapper.mapErrorMessage(e)
    }
  }

  @PatchMapping(
    path = Array("hakemus/{hakemusOid}/yhteinenkasittely/{viestiId}/obsolete"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  def vastaaHakemuksenYkViestiin(
    @PathVariable("hakemusOid") hakemusOid: String,
    @PathVariable("viestiId") viestiId: String,
    @RequestBody ykVastausBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    try {
      val user        = userService.getEnrichedUserDetails(true)
      val authorities = user.authorities

      if (!AuthoritiesUtil.hasTutuAuthorities(authorities)) {
        errorMessageMapper.mapPlainErrorMessage(
          RESPONSE_403_DESCRIPTION,
          HttpStatus.FORBIDDEN
        )
      } else {
        var ykVastaus: YkVastausDTO = null
        try ykVastaus = mapper.readValue(ykVastausBytes, classOf[YkVastausDTO])
        catch {
          case e: Exception =>
            LOG.error(s"Hakemuksen yhteisen käsittelyn viestiin vastaaminen epäonnistui: ${e.getMessage}", e)
            return errorMessageMapper.mapPlainErrorMessage(
              RESPONSE_400_DESCRIPTION,
              HttpStatus.BAD_REQUEST
            )
        }

        if (ykVastaus.id.isEmpty || ykVastaus.vastaus.isEmpty) {
          LOG.error(s"Hakemuksen yhteisen käsittelyn viestiin vastaaminen epäonnistui: virheelliset parametrit")
          return errorMessageMapper.mapPlainErrorMessage(
            RESPONSE_400_DESCRIPTION,
            HttpStatus.BAD_REQUEST
          )
        }

        Try {
          ykViestiService.vastaaHakemuksenYkViestiin(
            hakemusOid,
            user,
            ykVastaus
          )
        } match {
          case Success(_) =>
            ResponseEntity.noContent().build()
          case Failure(exception) =>
            LOG.error("Hakemuksen yhteisen käsittelyn viestiin vastaaminen epäonnistui", exception)
            errorMessageMapper.mapErrorMessage(exception)
        }
      }
    } catch {
      case e: Exception =>
        LOG.error(s"Hakemuksen yhteisen käsittelyn viestiin vastaaminen epäonnistui: ${e.getMessage}", e)
        errorMessageMapper.mapErrorMessage(e)
    }
  }

  @PatchMapping(
    path = Array("hakemus/{hakemusOid}/yhteinenkasittely/{viestiId}/luettu"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  def merkitseYkViestiLuetuksi(
    @PathVariable("hakemusOid") hakemusOid: String,
    @PathVariable("viestiId") viestiId: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    try {
      val user        = userService.getEnrichedUserDetails(true)
      val authorities = user.authorities

      if (!AuthoritiesUtil.hasTutuAuthorities(authorities)) {
        errorMessageMapper.mapPlainErrorMessage(
          RESPONSE_403_DESCRIPTION,
          HttpStatus.FORBIDDEN
        )
      } else {
        Try {
          ykViestiService.merkitseYkViestiLuetuksi(
            hakemusOid,
            viestiId,
            user
          )
        } match {
          case Success(_) =>
            ResponseEntity.noContent().build()
          case Failure(exception) =>
            LOG.error("Yhteisen käsittelyn viestiin luetuksi merkitseminen epäonnistui", exception)
            errorMessageMapper.mapErrorMessage(exception)
        }
      }
    } catch {
      case e: Exception =>
        LOG.error(s"Yhteisen käsittelyn viestiin luetuksi merkitseminen epäonnistui: ${e.getMessage}", e)
        errorMessageMapper.mapErrorMessage(e)
    }
  }

  @DeleteMapping(
    path = Array("hakemus/{hakemusOid}/yhteinenkasittely/{viestiId}")
  )
  @Operation(
    summary =
      "Poistaa yhteisen käsittelyn viestin, jos viestiä ei ole lähetetty ja poistaja on viestin alkuperäinen luoja",
    description = "",
    responses = Array(
      new ApiResponse(
        responseCode = "204",
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
  def poistaYkViesti(
    @PathVariable("hakemusOid") hakemusOid: String,
    @PathVariable("viestiId") viestiId: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    try {
      val user        = userService.getEnrichedUserDetails(true)
      val authorities = user.authorities
      if (!AuthoritiesUtil.hasTutuAuthorities(authorities)) {
        errorMessageMapper.mapPlainErrorMessage(
          RESPONSE_403_DESCRIPTION,
          HttpStatus.FORBIDDEN
        )
      } else {
        Try {
          ykViestiService.poistaYkViesti(
            HakemusOid(hakemusOid),
            viestiId,
            UserOid(user.userOid)
          )
        } match {
          case Success(_) =>
            ResponseEntity.noContent().build()
          case Failure(exception) =>
            LOG.error("Yhteisen käsittelyn viestin poistaminen epäonnistui", exception)
            errorMessageMapper.mapErrorMessage(exception)
        }
      }
    } catch {
      case e: Exception =>
        LOG.error(s"Yhteisen käsittelyn viestin poistaminen epäonnistui: ${e.getMessage}", e)
        errorMessageMapper.mapErrorMessage(e)
    }
  }
}
