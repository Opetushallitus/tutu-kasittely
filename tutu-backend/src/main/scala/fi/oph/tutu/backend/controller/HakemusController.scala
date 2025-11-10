package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.service.{HakemusService, HakemuspalveluService, UserService}
import fi.oph.tutu.backend.utils.AuditOperation.*
import fi.oph.tutu.backend.utils.{AuditLog, AuditUtil, AuthoritiesUtil, ErrorMessageMapper}
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.{Content, Schema}
import io.swagger.v3.oas.annotations.responses.ApiResponse
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.{HttpStatus, MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.{
  GetMapping,
  PatchMapping,
  PathVariable,
  PostMapping,
  PutMapping,
  RequestBody,
  RequestMapping,
  RequestParam,
  RestController
}

import java.util.UUID
import java.util.regex.Pattern
import scala.util.{Failure, Success, Try}

@RestController
@RequestMapping(path = Array("api"))
class HakemusController(
  hakemuspalveluService: HakemuspalveluService,
  hakemusService: HakemusService,
  userService: UserService,
  mapper: ObjectMapper,
  val auditLog: AuditLog
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[HakemusController])

  private val errorMessageMapper = new ErrorMessageMapper(mapper)

  @PostMapping(
    path = Array("ataru-hakemus"),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Luo uuden hakemuspalvelun hakemuksen",
    tags = Array("External"),
    description = "",
    requestBody = new io.swagger.v3.oas.annotations.parameters.RequestBody(
      content = Array(
        new Content(schema = new Schema(implementation = classOf[UusiAtaruHakemus]))
      )
    ),
    responses = Array(
      new ApiResponse(
        responseCode = "200",
        description = RESPONSE_200_DESCRIPTION,
        content = Array(
          new Content(schema = new Schema(implementation = classOf[UUID]))
        )
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
  def luoHakemus(
    @RequestBody hakemusBytes: Array[Byte],
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
        var hakemus: UusiAtaruHakemus = null
        try hakemus = mapper.readValue(hakemusBytes, classOf[UusiAtaruHakemus])
        catch {
          case e: Exception =>
            LOG.error("Hakemuksen luonti epäonnistui", e.getMessage)
            return errorMessageMapper.mapPlainErrorMessage(
              RESPONSE_400_DESCRIPTION,
              HttpStatus.BAD_REQUEST
            )
        }
        if (!hakemus.hakemusOid.isValid) {
          LOG.error(
            s"Hakemuksen luonti epäonnistui, virheellinen hakemusOid: ${hakemus.hakemusOid}"
          )
          errorMessageMapper.mapPlainErrorMessage(
            RESPONSE_400_DESCRIPTION,
            HttpStatus.BAD_REQUEST
          )
        } else {
          val (hakemusId, perustelu, paatos) =
            hakemusService.luoKokonainenHakemus(
              hakemus,
              PartialPerustelu(
                jatkoOpintoKelpoisuusLisatieto = Some("")
              ),
              Paatos(),
              "Hakemuspalvelu"
            )
          auditLog.logCreate(
            auditLog.getUser(request),
            Map("hakemusOid" -> hakemusId.toString),
            CreateHakemus,
            hakemus.toString
          )
          auditLog.logCreate(
            auditLog.getUser(request),
            Map("perusteluId" -> perustelu.id.toString),
            CreatePerustelu,
            perustelu.toString
          )
          auditLog.logCreate(
            auditLog.getUser(request),
            Map("paatosId" -> paatos.id.toString),
            CreatePaatos,
            paatos.toString
          )
          ResponseEntity.status(HttpStatus.OK).body(hakemusId)
        }
      }
    } catch {
      case e: Exception =>
        LOG.error("Hakemuksen luonti epäonnistui", e.getMessage)
        errorMessageMapper.mapErrorMessage(e)
    }
  }

  @GetMapping(
    path = Array("hakemus/{hakemusOid}"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  def haeHakemus(
    @PathVariable("hakemusOid") hakemusOid: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      hakemusService.haeHakemus(HakemusOid(hakemusOid))
    } match {
      case Success(value) =>
        value match {
          case None =>
            LOG.warn(s"Hakemusta ei löytynyt hakemusOid:illa: $hakemusOid")
            errorMessageMapper.mapPlainErrorMessage(
              "Hakemusta ei löytynyt",
              HttpStatus.NOT_FOUND
            )
          case Some(hakemus) =>
            auditLog.logRead("hakemus", hakemusOid, ReadHakemus, request)
            ResponseEntity
              .status(HttpStatus.OK)
              .body(mapper.writeValueAsString(hakemus))
        }
      case Failure(exception) =>
        LOG.error(s"Hakemuksen haku epäonnistui, hakemusOid: $hakemusOid", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @GetMapping(
    path = Array("hakemuslista"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  def listaaHakemukset(
    @RequestParam(required = false) nayta: String,
    @RequestParam(required = false) hakemuskoskee: String,
    @RequestParam(required = false) esittelija: String,
    @RequestParam(required = false) vaihe: String,
    @RequestParam(required = false) sort: String = SortDef.Undefined.toString,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val user    = userService.getEnrichedUserDetails(true)
      val userOid = nayta match {
        case "omat" => Option(user.userOid)
        case null   =>
          esittelija match {
            case null => None
            case _    => Option(esittelija)
          }
      }

      hakemusService.haeHakemusLista(
        userOid,
        Option(hakemuskoskee),
        Option(vaihe),
        sort
      )
    } match {
      case Success(hakemukset) =>
        val params = mapper.writeValueAsString(
          Map(
            "nayta"         -> Option(nayta).getOrElse(""),
            "hakemuskoskee" -> Option(hakemuskoskee).getOrElse(""),
            "esittelija"    -> Option(esittelija).getOrElse(""),
            "vaihe"         -> Option(vaihe).getOrElse("")
          )
        )
        auditLog.logRead("hakemuslista", params, ReadHakemukset, request)
        val response = mapper.writeValueAsString(hakemukset)
        ResponseEntity.status(HttpStatus.OK).body(response)
      case Failure(exception) =>
        LOG.error("Hakemuslistan haku epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @PutMapping(
    path = Array("hakemus/{hakemusOid}"),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Tallentaa hakemuksen kokonaan (korvaa kaikki käyttäjän muokattavat kentät)",
    description = "PUT endpoint täydelle entiteetille. NULL arvo pyynnössä -> NULL tietokantaan.",
    requestBody = new io.swagger.v3.oas.annotations.parameters.RequestBody(
      content = Array(
        new Content(schema = new Schema(implementation = classOf[HakemusUpdateRequest]))
      )
    ),
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
  def tallennaHakemus(
    @PathVariable("hakemusOid") hakemusOid: String,
    @RequestBody hakemusBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] =
    try {
      val user        = userService.getEnrichedUserDetails(true)
      val authorities = user.authorities

      if (!AuthoritiesUtil.hasTutuAuthorities(authorities)) {
        errorMessageMapper.mapPlainErrorMessage(
          RESPONSE_403_DESCRIPTION,
          HttpStatus.FORBIDDEN
        )
      } else {
        var hakemusUpdateRequest: HakemusUpdateRequest = null
        try hakemusUpdateRequest = mapper.readValue(hakemusBytes, classOf[HakemusUpdateRequest])
        catch {
          case e: Exception =>
            LOG.error(s"Hakemuksen tallennus epäonnistui: ${e.getMessage}", e)
            return errorMessageMapper.mapPlainErrorMessage(
              RESPONSE_400_DESCRIPTION,
              HttpStatus.BAD_REQUEST
            )
        }
        val vanhaHakemus = hakemusService.haeHakemus(HakemusOid(hakemusOid))
        hakemusService.tallennaHakemus(
          HakemusOid(hakemusOid),
          hakemusUpdateRequest,
          UserOid(user.userOid)
        )
        val uusiHakemus = hakemusService.haeHakemus(HakemusOid(hakemusOid))
        auditLog.logChanges(
          auditLog.getUser(request),
          Map("hakemusOid" -> hakemusOid),
          UpdateHakemus,
          AuditUtil.getChanges(
            vanhaHakemus.map(h => mapper.writeValueAsString(h)),
            uusiHakemus.map(h => mapper.writeValueAsString(h))
          )
        )
        ResponseEntity
          .status(HttpStatus.OK)
          .body(mapper.writeValueAsString(uusiHakemus))
      }
    } catch {
      case e: Exception =>
        LOG.error(s"Hakemuksen tallennus epäonnistui: ${e.getMessage}", e)
        errorMessageMapper.mapErrorMessage(e)
    }

  @GetMapping(path = Array("liite/metadata/{hakemusOid}"))
  def haeLiitteidenTiedot(
    @PathVariable("hakemusOid") hakemusOid: String,
    @RequestParam("avaimet") avaimet: String,
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val avainLista = avaimet.split(",")
      hakemuspalveluService.haeLiitteidenTiedot(
        HakemusOid(hakemusOid),
        avainLista
      )
    } match {
      case Success(result) =>
        result match {
          case None =>
            LOG.warn(s"Liitteitä ei löytynyt avaimilla: $avaimet")
            errorMessageMapper.mapPlainErrorMessage(
              "Liitteitä ei löytynyt",
              HttpStatus.NOT_FOUND
            )
          case Some(metadata) =>
            auditLog.logRead("liite/metadata", avaimet, ReadLiitteenTiedot, request)
            ResponseEntity.status(HttpStatus.OK).body(metadata)
        }
      case Failure(exception) =>
        LOG.error(s"Liitteiden haku epäonnistui, avaimet: $avaimet", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  @PatchMapping(path = Array("hakemus/{hakemusOid}/asiatunnus"))
  @Operation(
    summary = "Päivittää hakemuksen asiatunnuksen",
    description = "PATCH endpoint asiatunnuksen asettamiselle",
    requestBody = new io.swagger.v3.oas.annotations.parameters.RequestBody(
      content = Array(
        new Content(schema = new Schema(implementation = classOf[AsiatunnusUpdateRequest]))
      )
    ),
    responses = Array(
      new ApiResponse(
        responseCode = "200",
        description = RESPONSE_200_DESCRIPTION
      ),
      new ApiResponse(
        responseCode = "404",
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
  def paivitaAsiatunnus(
    @PathVariable("hakemusOid") hakemusOid: String,
    @RequestBody asiatunnusBytes: Array[Byte],
    request: jakarta.servlet.http.HttpServletRequest
  ): ResponseEntity[Any] = {
    try {
      val user              = userService.getEnrichedUserDetails(true)
      val authorities       = user.authorities
      val asiatunnusPattern = Pattern.compile("""OPH-\d+-\d{4}$""")

      if (!AuthoritiesUtil.hasTutuAuthorities(authorities)) {
        errorMessageMapper.mapPlainErrorMessage(
          RESPONSE_403_DESCRIPTION,
          HttpStatus.FORBIDDEN
        )
      } else {
        val asiatunnusUpdateRequest: AsiatunnusUpdateRequest =
          mapper.readValue(asiatunnusBytes, classOf[AsiatunnusUpdateRequest])
        val asiatunnus = asiatunnusUpdateRequest.asiatunnus
        if (asiatunnusPattern.matcher(asiatunnus).matches) {
          Try {
            hakemusService.paivitaAsiatunnus(HakemusOid(hakemusOid), asiatunnus, user.userOid)
          } match {
            case Success(result) =>
              if (result == 0)
                errorMessageMapper.mapPlainErrorMessage("Hakemusta ei löytynyt", HttpStatus.NOT_FOUND)
              else {
                auditLog.logChanges(
                  AuditLog.getUser(request),
                  Map("asiatunnus" -> asiatunnus),
                  UpdateAsiatunnus,
                  AuditUtil.getChanges(None, Some(asiatunnus))
                )
                ResponseEntity.status(HttpStatus.NO_CONTENT).body("")
              }
            case Failure(exception) =>
              errorMessageMapper.mapErrorMessage(exception)
          }
        } else {
          errorMessageMapper.mapPlainErrorMessage("Virheellinen asiatunnus", HttpStatus.BAD_REQUEST)
        }
      }
    } catch {
      case e: Exception =>
        LOG.error(s"Virhe asiatunnuksen päivittämisessä: ${e.getMessage}", e)
        errorMessageMapper.mapErrorMessage(e)
    }
  }
}
