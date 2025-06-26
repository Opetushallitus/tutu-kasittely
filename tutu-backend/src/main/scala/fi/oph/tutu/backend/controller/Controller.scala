package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.domain.{Hakemus, HakemusListItem, HakemusOid, PartialHakemus, SortDef, UserOid, UserResponse, UusiAtaruHakemus}
import fi.oph.tutu.backend.repository.HakemusRepository
import fi.oph.tutu.backend.service.{HakemusService, HakemuspalveluService, UserService}
import fi.oph.tutu.backend.utils.{AuditLog, AuthoritiesUtil}
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.{Content, Schema}
import io.swagger.v3.oas.annotations.responses.ApiResponse
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.{HttpStatus, MediaType, ResponseEntity}
import org.springframework.security.web.csrf.CsrfToken
import org.springframework.web.bind.annotation.*
import org.springframework.web.servlet.view.RedirectView

import java.util
import java.util.UUID

@RestController
@RequestMapping(path = Array("api"))
class Controller(
  hakemuspalveluService: HakemuspalveluService,
  hakemusService: HakemusService,
  hakemusRepository: HakemusRepository,
  userService: UserService,
  val auditLog: AuditLog = AuditLog
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[Controller])

  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)
  mapper.registerModule(new JavaTimeModule)
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(SerializationFeature.INDENT_OUTPUT, true)
  mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)

  final val RESPONSE_200_DESCRIPTION =
    "Pyyntö vastaanotettu"
  final val RESPONSE_400_DESCRIPTION = "Pyyntö virheellinen"
  final val RESPONSE_403_DESCRIPTION =
    "Käyttäjällä ei ole tarvittavia oikeuksia hakemusten luontiin"
  final val RESPONSE_500_DESCRIPTION = "Palvelinvirhe"

  @Value("${tutu.ui.url}")
  val tutuUiUrl: String = null

  @GetMapping(path = Array("healthcheck"))
  def healthcheck = "Tutu is alive and kicking!"

  @GetMapping(path = Array("login"))
  def login =
    RedirectView(tutuUiUrl)

  @GetMapping(path = Array("session"))
  def session: ResponseEntity[Map[String, String]] =
    // Palautetaan jokin paluuarvo koska client-kirjasto sellaisen haluaa
    ResponseEntity.ok(Map("status" -> "ok"))

  @GetMapping(path = Array("csrf"))
  def csrf(csrfToken: CsrfToken): String =
    mapper.writeValueAsString(csrfToken)

  @GetMapping(path = Array("user"))
  def user(): String = {
    val enrichedUserDetails = userService.getEnrichedUserDetails
    mapper.writeValueAsString(
      UserResponse(
        user =
          if (enrichedUserDetails == null)
            null
          else
            enrichedUserDetails
      )
    )
  }

  @PostMapping(
    path = Array("ataru-hakemus"),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Luo uuden hakemuspalvelun hakemuksen",
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
  def luoHakemus(@RequestBody hakemusBytes: Array[Byte]): ResponseEntity[Any] =
    try {
      val user        = userService.getEnrichedUserDetails
      val authorities = user.authorities

      if (!AuthoritiesUtil.hasTutuAuthorities(authorities)) {
        ResponseEntity
          .status(HttpStatus.FORBIDDEN)
          .body(RESPONSE_403_DESCRIPTION)
      } else {
        var hakemus: UusiAtaruHakemus = null
        try
          hakemus = mapper.readValue(hakemusBytes, classOf[UusiAtaruHakemus])
        catch {
          case e: Exception =>
            LOG.error("Hakemuksen luonti epäonnistui", e.getMessage)
            return ResponseEntity
              .status(HttpStatus.BAD_REQUEST)
              .body(RESPONSE_400_DESCRIPTION)
        }
        if (!hakemus.hakemusOid.isValid) {
          LOG.error(s"Hakemuksen luonti epäonnistui, virheellinen hakemusOid: ${hakemus.hakemusOid}")
          ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(RESPONSE_400_DESCRIPTION)
        } else {
          val hakemusOid = hakemusService.tallennaHakemus(hakemus)
          ResponseEntity.status(HttpStatus.OK).body(hakemusOid)
        }
      }
    } catch {
      case e: Exception =>
        LOG.error("Hakemuksen luonti epäonnistui", e.getMessage)
        ResponseEntity
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(RESPONSE_500_DESCRIPTION)
    }

  @GetMapping(path = Array("hakemus/{hakemusOid}"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
  def haeHakemus(
    @PathVariable("hakemusOid") hakemusOid: String,
    @RequestParam(required = false) hakemusMuutoshistoriaSort: String = SortDef.Undefined.toString
  ): ResponseEntity[Any] = {
    hakemusService.haeHakemus(HakemusOid(hakemusOid), SortDef.fromString(hakemusMuutoshistoriaSort)) match {
      case None =>
        LOG.warn(s"Hakemusta ei löytynyt hakemusOid: $hakemusOid")
        ResponseEntity.status(HttpStatus.NOT_FOUND).body("Hakemusta ei löytynyt")
      case Some(hakemus) =>
        ResponseEntity.status(HttpStatus.OK).body(mapper.writeValueAsString(hakemus))
    }

  }

  @GetMapping(path = Array("hakemuslista"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
  def listaaHakemukset(
    @RequestParam(required = false) nayta: String,
    @RequestParam(required = false) hakemuskoskee: String,
    @RequestParam(required = false) esittelija: String,
    @RequestParam(required = false) vaihe: String
  ): ResponseEntity[Any] = {
    val user = userService.getEnrichedUserDetails
    val userOid = nayta match {
      case "omat" => Option(user.userOid)
      case null =>
        esittelija match {
          case null => None
          case _    => Option(esittelija)
        }
    }
    val hakemukset: Seq[HakemusListItem] =
      hakemusService.haeHakemusLista(userOid, Option(hakemuskoskee), Option(vaihe))
    val response = mapper.writeValueAsString(hakemukset)
    ResponseEntity.status(HttpStatus.OK).body(response)
  }

  @GetMapping(path = Array("esittelijat"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
  def haeEsittelijat(): ResponseEntity[Any] = {
    val users    = userService.haeEsittelijat
    val response = mapper.writeValueAsString(users)
    ResponseEntity.status(HttpStatus.OK).body(response)
  }

  @PatchMapping(
    path = Array("hakemus/{hakemusOid}"),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Päivittää hakemuksen osan",
    description = "",
    requestBody = new io.swagger.v3.oas.annotations.parameters.RequestBody(
      content = Array(
        new Content(schema = new Schema(implementation = classOf[PartialHakemus]))
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
  def paivitaHakemus(
    @PathVariable("hakemusOid") hakemusOid: String,
    @RequestBody hakemusBytes: Array[Byte]
  ): ResponseEntity[Any] =
    try {
      val user        = userService.getEnrichedUserDetails
      val authorities = user.authorities

      if (!AuthoritiesUtil.hasTutuAuthorities(authorities)) {
        ResponseEntity
          .status(HttpStatus.FORBIDDEN)
          .body(RESPONSE_403_DESCRIPTION)
      } else {
        var partialHakemus: PartialHakemus = null
        try
          partialHakemus = mapper.readValue(hakemusBytes, classOf[PartialHakemus])
        catch {
          case e: Exception =>
            LOG.error("Hakemuksen päivitys epäonnistui", e.getMessage)
            return ResponseEntity
              .status(HttpStatus.BAD_REQUEST)
              .body(RESPONSE_400_DESCRIPTION)
        }
        hakemusService.paivitaHakemus(HakemusOid(hakemusOid), partialHakemus, UserOid(user.userOid))
        haeHakemus(hakemusOid)
      }
    } catch {
      case e: Exception =>
        LOG.error("Hakemuksen päivitys epäonnistui", e.getMessage)
        ResponseEntity
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(RESPONSE_500_DESCRIPTION)
    }
}
