package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.service.{EsittelijaService, UserService, ViestipohjaService}
import fi.oph.tutu.backend.utils.AuditLog
import fi.oph.tutu.backend.utils.AuditOperation.*
import fi.oph.tutu.backend.utils.AuditUtil.NO_CHANGES
import fi.vm.sade.auditlog.{Changes, User}
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.{MediaType, ResponseEntity}
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(path = Array("api"))
class ViestipohjaController(
  viestipohjaService: ViestipohjaService,
  userService: UserService,
  esittelijaService: EsittelijaService,
  mapper: ObjectMapper,
  val auditLog: AuditLog
) extends TekstipohjaControllerBase(viestipohjaService, userService, esittelijaService, auditLog, mapper) {

  def singlePohjaDescGenitiveCase     = "viestipohjan"
  def singleKategoriaDescGenitiveCase = "viestipohjakategorian"

  def pohjaListDescGenitiveCase     = "viestipohjien"
  def kategoriaListDescGenitiveCase = "viestipohjakategorioiden"

  override def auditlogPohjaCreate(user: User, pohjaId: String, newData: String): Unit =
    auditLog.logCreate(
      user,
      Map("viestipohjaId" -> pohjaId),
      CreateViestipohja,
      newData
    )

  override def auditlogPohjaUpdate(user: User, pohjaId: String, changes: Changes): Unit =
    auditLog.logChanges(
      user,
      Map("viestipohjaId" -> pohjaId),
      UpdateViestipohja,
      changes
    )

  override def auditlogPohjaDelete(user: User, pohjaId: String): Unit = auditLog.logChanges(
    user,
    Map("viestipohjaId" -> pohjaId),
    DeleteViestiPohja,
    NO_CHANGES
  )

  override def auditlogPohjaListRead(request: HttpServletRequest): Unit =
    auditLog.logRead("viestipohjat", "", ReadViestipohjat, request)

  override def auditlogPohjaRead(request: HttpServletRequest, pohjaId: String): Unit =
    auditLog.logRead("viestipohja", pohjaId, ReadViestipohja, request)

  override def auditlogKategoriaCreate(user: User, kategoriaId: String, newData: String): Unit =
    auditLog.logCreate(
      user,
      Map("viestipohjaKategoriaId" -> kategoriaId),
      CreateViestipohjaKategoria,
      newData
    )

  override def auditlogKategoriaUpdate(user: User, kategoriaId: String, changes: Changes): Unit =
    auditLog.logChanges(
      user,
      Map("viestipohjaKategoriaId" -> kategoriaId),
      UpdateViestipohjaKategoria,
      changes
    )

  override def auditlogKategoriaListRead(
    request: HttpServletRequest
  ): Unit = auditLog.logRead("viestipohjaKategoriat", "", ReadViestipohjaKategoriat, request)

  @GetMapping(
    path = Array("viestipohja"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Hae viestipohjalista",
    description = "GET endpoint viestipohjalistan hakemiseen",
    responses = Array(
      new ApiResponse(
        responseCode = "200",
        description = RESPONSE_200_DESCRIPTION
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
  def haeViestipohjaLista(request: HttpServletRequest): ResponseEntity[Any] =
    haeTekstipohjaLista(request)

  @GetMapping(
    path = Array("viestipohja/kategorioittain"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Hae viestipohjat kategorioittain",
    description = "GET endpoint joka palauttaa viestipohjat kategorioittain",
    responses = Array(
      new ApiResponse(
        responseCode = "200",
        description = RESPONSE_200_DESCRIPTION
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
  def haeViestipohjatKategorioittain(request: HttpServletRequest): ResponseEntity[Any] =
    haeTekstipohjatKategorioittain(request)

  @GetMapping(
    path = Array("viestipohja/{viestipohjaId}"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Hae viestipohja",
    description = "GET endpoint yksittäisen viestipohjan hakemiseen.",
    responses = Array(
      new ApiResponse(
        responseCode = "200",
        description = RESPONSE_200_DESCRIPTION
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
  def haeViestipohja(
    @PathVariable viestipohjaId: String,
    request: HttpServletRequest
  ): ResponseEntity[Any] = haeTekstipohja(viestipohjaId, request)

  @GetMapping(
    path = Array("viestipohja/kategoria"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Hae viestipohja kategoriat",
    description = "GET endpoint viestipohja kategorioiden hakemiseen.",
    responses = Array(
      new ApiResponse(
        responseCode = "200",
        description = RESPONSE_200_DESCRIPTION
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
  def haeViestipohjaKategoriat(request: HttpServletRequest): ResponseEntity[Any] = haeTekstipohjaKategoriat(request)

  @PutMapping(
    path = Array("viestipohja/kategoria"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Tallenna viestipohja kategoria",
    description = "PUT endpoint viestipohja kategorian luomiseen tai olemassaolevan päivittämiseen.",
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
  def tallennaViestipohjaKategoria(
    @RequestBody viestipohjaKategoriaBytes: Array[Byte],
    request: HttpServletRequest
  ): ResponseEntity[Any] = tallennaTekstipohjaKategoria(viestipohjaKategoriaBytes, request)

  @PutMapping(
    path = Array("viestipohja"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Tallenna viestipohja",
    description = "PUT endpoint viestipohjan luomiseen tai olemassaolevan päivittämiseen.",
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
  def tallennaViestipohja(
    @RequestBody viestipohjaBytes: Array[Byte],
    request: HttpServletRequest
  ): ResponseEntity[Any] = tallennaTekstipohja(viestipohjaBytes, request)

  @DeleteMapping(
    path = Array("viestipohja/{viestipohjaId}")
  )
  @Operation(
    summary = "Poista viestipohja",
    description = "DELETE endpoint viestipohjan poistamiselle.",
    responses = Array(
      new ApiResponse(
        responseCode = "204",
        description = RESPONSE_200_DESCRIPTION
      ),
      new ApiResponse(
        responseCode = "404",
        description = RESPONSE_404_DESCRIPTION
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
  def poistaViestipohja(
    @PathVariable("viestipohjaId") viestipohjaId: String,
    request: HttpServletRequest
  ): ResponseEntity[Any] = poistaTekstipohja(viestipohjaId, request)
}
