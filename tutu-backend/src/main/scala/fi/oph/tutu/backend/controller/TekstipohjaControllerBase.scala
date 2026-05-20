package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.domain.{Tekstipohja, TekstipohjaKategoria}
import fi.oph.tutu.backend.service.{TekstipohjaServiceBase, UserService}
import fi.oph.tutu.backend.utils.{AuditLog, AuditUtil, ErrorMessageMapper}
import fi.vm.sade.auditlog.{Changes, User}
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.HttpStatus.{NOT_FOUND, NO_CONTENT, OK}
import org.springframework.http.ResponseEntity

import java.util.UUID
import scala.util.{Failure, Success, Try}

trait TekstipohjaControllerBase(
  service: TekstipohjaServiceBase,
  userService: UserService,
  auditLog: AuditLog,
  mapper: ObjectMapper
) {
  def auditlogPohjaCreate(user: User, pohjaId: String, newData: String): Unit
  def auditlogPohjaUpdate(user: User, pohjaId: String, changes: Changes): Unit
  def auditlogPohjaDelete(user: User, pohjaId: String): Unit
  def auditlogPohjaListRead(request: HttpServletRequest): Unit
  def auditlogPohjaRead(request: HttpServletRequest, pohjaId: String): Unit

  def auditlogKategoriaCreate(user: User, kategoriaId: String, newData: String): Unit
  def auditlogKategoriaUpdate(user: User, kategoriaId: String, changes: Changes): Unit
  def auditlogKategoriaListRead(request: HttpServletRequest): Unit

  def singlePohjaDescGenitiveCase: String
  def singleKategoriaDescGenitiveCase: String
  def pohjaListDescGenitiveCase: String
  def kategoriaListDescGenitiveCase: String

  val LOG: Logger                = LoggerFactory.getLogger(classOf[TekstipohjaControllerBase])
  private val errorMessageMapper = new ErrorMessageMapper(mapper)

  def haeTekstipohjaLista(request: HttpServletRequest): ResponseEntity[Any] = {
    Try {
      service.haeTekstipohjaLista()
    } match {
      case Success(result) =>
        auditlogPohjaListRead(request)
        ResponseEntity.status(OK).body(mapper.writeValueAsString(result))
      case Failure(exception) =>
        LOG.error(s"$pohjaListDescGenitiveCase haku epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  def haeTekstipohjatKategorioittain(request: HttpServletRequest): ResponseEntity[Any] = {
    Try {
      service.haeTekstipohjatKategorioittain()
    } match {
      case Success(result) =>
        auditlogPohjaListRead(request)
        ResponseEntity.status(OK).body(mapper.writeValueAsString(result))
      case Failure(exception) =>
        LOG.error(s"$pohjaListDescGenitiveCase haku kategorioittain epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  def haeTekstipohja(
    tekstipohjaId: String,
    request: HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      service.haeTekstipohja(UUID.fromString(tekstipohjaId))
    } match {
      case Success(Some(result)) =>
        auditlogPohjaRead(request, tekstipohjaId)
        ResponseEntity.status(OK).body(mapper.writeValueAsString(result))
      case Success(None) =>
        ResponseEntity.status(NOT_FOUND).build()
      case Failure(exception) =>
        LOG.error(s"$singlePohjaDescGenitiveCase haku epäonnistui, id: $tekstipohjaId", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  def haeTekstipohjaKategoriat(request: HttpServletRequest): ResponseEntity[Any] = {
    Try {
      service.haeTekstipohjaKategoriat()
    } match {
      case Success(result) =>
        auditlogKategoriaListRead(request)
        ResponseEntity.status(OK).body(mapper.writeValueAsString(result))
      case Failure(exception) =>
        LOG.error(s"$kategoriaListDescGenitiveCase haku epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  def tallennaTekstipohjaKategoria(
    tekstipohjaKategoriaBytes: Array[Byte],
    request: HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val user                 = userService.getEnrichedUserDetails(true)
      val tekstipohjaKategoria = mapper.readValue(tekstipohjaKategoriaBytes, classOf[TekstipohjaKategoria])

      tekstipohjaKategoria.id match {
        case Some(id) =>
          val oldKategoria = service.haeTekstipohjaKategoria(id)
          if (oldKategoria.isEmpty) {
            None
          } else {
            val updatedKategoria =
              service.paivitaTekstipohjaKategoria(id, tekstipohjaKategoria, user.userOid)
            auditlogKategoriaUpdate(
              auditLog.getUser(request),
              id.toString,
              AuditUtil.getChanges(
                oldKategoria.map(mapper.writeValueAsString),
                updatedKategoria.map(mapper.writeValueAsString)
              )
            )
            updatedKategoria
          }
        case None =>
          val newKategoria = service.lisaaTekstipohjaKategoria(tekstipohjaKategoria, user.userOid)
          auditlogKategoriaCreate(
            auditLog.getUser(request),
            newKategoria.id.get.toString,
            mapper.writeValueAsString(newKategoria)
          )
          Some(newKategoria)
      }
    } match {
      case Success(Some(result)) =>
        ResponseEntity.status(OK).body(mapper.writeValueAsString(result))
      case Success(None) =>
        LOG.error(s"Päivitettävän $singleKategoriaDescGenitiveCase tietoja ei löytynyt")
        ResponseEntity.status(NOT_FOUND).build()
      case Failure(exception) =>
        LOG.error(s"$singleKategoriaDescGenitiveCase tallennus epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  def tallennaTekstipohja(
    tekstipohjaBytes: Array[Byte],
    request: HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      val user        = userService.getEnrichedUserDetails(true)
      val tekstipohja = mapper.readValue(tekstipohjaBytes, classOf[Tekstipohja])
      tekstipohja.id match {
        case Some(id) =>
          val oldTekstipohja = service.haeTekstipohja(id)
          if (oldTekstipohja.isEmpty) {
            None
          } else {
            val updatedTekstipohja = service.paivitaTekstipohja(id, tekstipohja, user.userOid)
            auditlogPohjaUpdate(
              auditLog.getUser(request),
              id.toString,
              AuditUtil.getChanges(
                oldTekstipohja.map(mapper.writeValueAsString),
                updatedTekstipohja.map(mapper.writeValueAsString)
              )
            )
            updatedTekstipohja
          }
        case None =>
          val newTekstipohja = service.lisaaTekstipohja(tekstipohja, user.userOid)
          auditlogPohjaCreate(
            auditLog.getUser(request),
            newTekstipohja.id.get.toString,
            mapper.writeValueAsString(newTekstipohja)
          )
          Some(newTekstipohja)
      }
    } match {
      case Success(Some(result)) =>
        ResponseEntity.status(OK).body(mapper.writeValueAsString(result))
      case Success(None) =>
        LOG.error(s"Päivitettävän $singlePohjaDescGenitiveCase tietoja ei löytynyt")
        ResponseEntity.status(NOT_FOUND).build()
      case Failure(exception) =>
        LOG.error(s"$singlePohjaDescGenitiveCase tallennus epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }

  def poistaTekstipohja(
    tekstipohjaId: String,
    request: HttpServletRequest
  ): ResponseEntity[Any] = {
    Try {
      service.poistaTekstipohja(UUID.fromString(tekstipohjaId))
    } match {
      case Success(0) =>
        LOG.error(s"Poistettavan $singlePohjaDescGenitiveCase tietoja ei löytynyt")
        ResponseEntity.status(NOT_FOUND).body("")
      case Success(_) =>
        auditlogPohjaDelete(
          auditLog.getUser(request),
          tekstipohjaId
        )
        ResponseEntity.status(NO_CONTENT).body("")
      case Failure(exception) =>
        LOG.error(s"$singlePohjaDescGenitiveCase poisto epäonnistui", exception)
        errorMessageMapper.mapErrorMessage(exception)
    }
  }
}
