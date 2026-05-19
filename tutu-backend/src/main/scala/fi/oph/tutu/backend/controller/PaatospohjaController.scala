package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.service.{PaatospohjaService, UserService, ViestipohjaService}
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
class PaatospohjaController(
  paatospohjaService: PaatospohjaService,
  userService: UserService,
  mapper: ObjectMapper,
  val auditLog: AuditLog
) extends TekstipohjaControllerBase(paatospohjaService, userService, auditLog, mapper) {

  def singlePohjaDescGenitiveCase     = "paatospohjan"
  def singleKategoriaDescGenitiveCase = "paatospohjakategorian"

  def pohjaListDescGenitiveCase     = "paatospohjien"
  def kategoriaListDescGenitiveCase = "paatospohjakategorioiden"

  override def auditlogPohjaCreate(user: User, pohjaId: String, newData: String): Unit =
    auditLog.logCreate(
      user,
      Map("paatospohjaId" -> pohjaId),
      CreatePaatospohja,
      newData
    )

  override def auditlogPohjaUpdate(user: User, pohjaId: String, changes: Changes): Unit =
    auditLog.logChanges(
      user,
      Map("paatospohjaId" -> pohjaId),
      UpdatePaatospohja,
      changes
    )

  override def auditlogPohjaDelete(user: User, pohjaId: String): Unit = auditLog.logChanges(
    user,
    Map("paatospohjaId" -> pohjaId),
    DeletePaatospohja,
    NO_CHANGES
  )

  override def auditlogPohjaListRead(request: HttpServletRequest): Unit =
    auditLog.logRead("paatospohjat", "", ReadPaatospohjat, request)

  override def auditlogPohjaRead(request: HttpServletRequest, pohjaId: String): Unit =
    auditLog.logRead("paatospohja", pohjaId, ReadPaatospohja, request)

  override def auditlogKategoriaCreate(user: User, kategoriaId: String, newData: String): Unit =
    auditLog.logCreate(
      user,
      Map("paatospohjaKategoriaId" -> kategoriaId),
      CreatePaatospohjaKategoria,
      newData
    )

  override def auditlogKategoriaUpdate(user: User, kategoriaId: String, changes: Changes): Unit =
    auditLog.logChanges(
      user,
      Map("paatospohjaKategoriaId" -> kategoriaId),
      UpdatePaatospohjaKategoria,
      changes
    )

  override def auditlogKategoriaListRead(
    request: HttpServletRequest
  ): Unit = auditLog.logRead("paatospohjaKategoriat", "", ReadPaatospohjaKategoriat, request)

  @GetMapping(
    path = Array("paatospohja"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Hae paatospohjalista",
    description = "GET endpoint paatospohjalistan hakemiseen",
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
  def haePaatospohjaLista(request: HttpServletRequest): ResponseEntity[Any] =
    haeTekstipohjaLista(request)

  @GetMapping(
    path = Array("paatospohja/kategorioittain"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Hae paatospohjat kategorioittain",
    description = "GET endpoint joka palauttaa paatospohjat kategorioittain",
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
  def haePaatospohjatKategorioittain(request: HttpServletRequest): ResponseEntity[Any] =
    haeTekstipohjatKategorioittain(request)

  @GetMapping(
    path = Array("paatospohja/{paatospohjaId}"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Hae paatospohja",
    description = "GET endpoint yksittäisen paatospohjan hakemiseen.",
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
  def haePaatospohja(
    @PathVariable paatospohjaId: String,
    request: HttpServletRequest
  ): ResponseEntity[Any] = haeTekstipohja(paatospohjaId, request)

  @GetMapping(
    path = Array("paatospohja/kategoria"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Hae paatospohja kategoriat",
    description = "GET endpoint paatospohja kategorioiden hakemiseen.",
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
  def haePaatospohjaKategoriat(request: HttpServletRequest): ResponseEntity[Any] = haeTekstipohjaKategoriat(request)

  @PutMapping(
    path = Array("paatospohja/kategoria"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Tallenna paatospohja kategoria",
    description = "PUT endpoint paatospohja kategorian luomiseen tai olemassaolevan päivittämiseen.",
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
  def tallennaPaatospohjaKategoria(
    @RequestBody paatospohjaKategoriaBytes: Array[Byte],
    request: HttpServletRequest
  ): ResponseEntity[Any] = tallennaTekstipohjaKategoria(paatospohjaKategoriaBytes, request)

  @PutMapping(
    path = Array("paatospohja"),
    produces = Array(MediaType.APPLICATION_JSON_VALUE),
    consumes = Array(MediaType.APPLICATION_JSON_VALUE)
  )
  @Operation(
    summary = "Tallenna paatospohja",
    description = "PUT endpoint paatospohjan luomiseen tai olemassaolevan päivittämiseen.",
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
  def tallennaPaatospohja(
    @RequestBody paatospohjaBytes: Array[Byte],
    request: HttpServletRequest
  ): ResponseEntity[Any] = tallennaTekstipohja(paatospohjaBytes, request)

  @DeleteMapping(
    path = Array("paatospohja/{paatospohjaId}")
  )
  @Operation(
    summary = "Poista paatospohja",
    description = "DELETE endpoint paatospohjan poistamiselle.",
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
  def poistaPaatospohja(
    @PathVariable("paatospohjaId") paatospohjaId: String,
    request: HttpServletRequest
  ): ResponseEntity[Any] = poistaTekstipohja(paatospohjaId, request)
}
