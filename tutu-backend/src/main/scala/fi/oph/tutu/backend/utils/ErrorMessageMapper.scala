package fi.oph.tutu.backend.utils

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.domain.ErrorMessage
import fi.oph.tutu.backend.service.{HakemuspalveluServiceException, KayttooikeusServiceException, OnrServiceException}
import org.springframework.http.{HttpStatus, MediaType, ResponseEntity}

class ErrorMessageMapper(val objectMapper: ObjectMapper) {
  def mapErrorMessage(error: Throwable, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR): ResponseEntity[Any] = {
    val origin = error match {
      case hse: HakemuspalveluServiceException => "hakemuspalvelu"
      case onr: OnrServiceException            => "oppijanumerorekisteri"
      case kos: KayttooikeusServiceException   => "kayttooikeuspalvelu"
      case _                                   => ""
    }
    val body = objectMapper.writeValueAsString(ErrorMessage(origin, error.getMessage))
    ResponseEntity
      .status(status)
      .contentType(MediaType.valueOf("application/json;charset=UTF-8"))
      .body(body)
  }

  def mapPlainErrorMessage(
    errorMessage: String,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR
  ): ResponseEntity[Any] = {
    val body = objectMapper.writeValueAsString(ErrorMessage("", errorMessage))
    ResponseEntity
      .status(status)
      .contentType(MediaType.valueOf("text/plain; charset=UTF-8"))
      .body(body)
  }
}
