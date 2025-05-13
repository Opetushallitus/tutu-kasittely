package fi.oph.tutu.backend

import fi.oph.tutu.backend.repository.HakemusRepository
import fi.oph.tutu.backend.controller.Controller
import fi.oph.tutu.backend.controller.Hakemus
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.utils.{AuditLog, AuthoritiesUtil}
import fi.oph.tutu.backend.security.SecurityConstants
import org.junit.jupiter.api.*
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.*
import org.springframework.beans.factory.annotation.{Autowired, Qualifier}
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.HttpStatus
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.bean.`override`.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.assertj.*
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.web.servlet.setup.{DefaultMockMvcBuilder, MockMvcBuilders, MockMvcConfigurer}

import java.util.UUID


// TODO: Mockito Qualifiers!

@WebMvcTest(controllers = Array(classOf[Controller]))
class ControllerUnitTest {

  @MockitoBean
  private val hakemuspalveluService : HakemuspalveluService = null

  @MockitoBean
  private val userService : UserService = null

  @MockitoBean
  private val hakemusRepository : HakemusRepository = null

  @MockitoBean
  private val auditLog : AuditLog = null

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def haeAtaruHakemusValidRequestReturns200(@Autowired mvc : MockMvc): Unit = {

    val hakemusResult : String = """{
      "haku": null,
      "key": "1.2.246.562.11.00000000000002354669",
      "content": {
        "answers": [
          {
            "key": "1098b604-115b-4e59-ba11-073c0924e473",
            "value": "0",
            "fieldType": "singleChoice",
            "original-followup": null,
            "original-question": null,
            "duplikoitu-kysymys-hakukohde-oid": null,
            "duplikoitu-followup-hakukohde-oid": null
          }
        ]
      },
      "created": "2025-04-25T09:39:07.069Z",
      "state": "active",
      "modified": "2025-04-29T13:08:03.974Z",
      "submitted": "2025-04-25T09:39:07.069Z",
      "lang": "fi",
      "application-review-notes": null,
      "person-oid": null,
      "application-hakukohde-attachment-reviews": [
        {
          "attachment": "582be518-e3ea-4692-8a2c-8370b40213e9",
          "state": "not-checked",
          "hakukohde": "form"
        }
      ],
      "application-hakukohde-reviews": [
        {
          "requirement": "processing-state",
          "state": "processing-fee-paid",
          "hakukohde": "form"
        }
      ],
      "hakutoiveet": []
    }"""

    when(
      hakemuspalveluService.getAtaruHakemus("1")
    ).thenReturn(Right(hakemusResult))

    when(
      hakemusRepository.tallennaHakemus("", "")
    ).thenReturn(UUID.randomUUID())

    when(
      userService.getEnrichedUserDetails
    ).thenReturn(User("", List()))

    when(auditLog.toJson("")).thenReturn("")

    mvc.perform(
      get("/api/ataru-hakemus/1")
    ).andExpect(status().isOk)
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def haeAtaruHakemusValidRequestReturns404(@Autowired mvc : MockMvc): Unit = {

    when(
      hakemuspalveluService.getAtaruHakemus("2")
    ).thenReturn(Left(new Exception()))

    when(
      hakemusRepository.tallennaHakemus("", "")
    ).thenReturn(UUID.randomUUID())

    when(
      userService.getEnrichedUserDetails
    ).thenReturn(User("", List()))

    when(auditLog.toJson("")).thenReturn("")

    mvc.perform(
      get("/api/ataru-hakemus/2")
    ).andExpect(status().isNotFound)
  }
}
