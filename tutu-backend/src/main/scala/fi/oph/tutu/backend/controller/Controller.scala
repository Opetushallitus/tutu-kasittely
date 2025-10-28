package fi.oph.tutu.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.tutu.backend.domain.UserResponse
import fi.oph.tutu.backend.service.UserService
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseEntity
import org.springframework.security.web.csrf.CsrfToken
import org.springframework.web.bind.annotation.{GetMapping, RequestMapping, RestController}
import org.springframework.web.servlet.view.RedirectView

@RestController
@RequestMapping(path = Array("api"))
class Controller(
  userService: UserService,
  mapper: ObjectMapper
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[Controller])

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
  def csrf(csrfToken: CsrfToken): String = {
    mapper.writeValueAsString(csrfToken)
  }

  @GetMapping(path = Array("user"))
  def user(): String = {
    val enrichedUserDetails = userService.getEnrichedUserDetails()
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
}
