package fi.oph.tutu.backend

import fi.oph.tutu.backend.controller.Controller
import fi.oph.tutu.backend.repository.HakemusRepository
import fi.oph.tutu.backend.security.SecurityConstants
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.utils.AuditLog
import org.junit.jupiter.api.*
import org.mockito.Mockito.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.context.bean.`override`.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(controllers = Array(classOf[Controller]))
class ControllerUnitTest {

  @MockitoBean
  private var hakemuspalveluService: HakemuspalveluService = _

  @MockitoBean
  private var hakemusRepository: HakemusRepository = _

  @MockitoBean
  val hakemusService: HakemusService = null

  @MockitoBean
  private var userService: UserService = _

  @MockitoBean
  private var auditLog: AuditLog = _

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def haeAtaruHakemusValidRequestReturns200(@Autowired mvc: MockMvc): Unit = {

    val hakemusResult: String = """{
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
      hakemuspalveluService.haeHakemus("1")
    ).thenReturn(Right(hakemusResult))

    when(hakemusRepository.toString).thenCallRealMethod()
    when(userService.toString).thenCallRealMethod()
    when(auditLog.toString).thenCallRealMethod()

    mvc
      .perform(
        get("/api/hakemus/1")
      )
      .andExpect(status().isOk)
  }

  @Test
  @WithMockUser(value = "kayttaja", authorities = Array(SecurityConstants.SECURITY_ROOLI_ESITTELIJA_FULL))
  def haeAtaruHakemusValidRequestReturns404(@Autowired mvc: MockMvc): Unit = {

    when(
      hakemuspalveluService.haeHakemus("2")
    ).thenReturn(Left(new Exception()))

    when(hakemusRepository.toString).thenCallRealMethod()
    when(userService.toString).thenCallRealMethod()
    when(auditLog.toString).thenCallRealMethod()

    mvc
      .perform(
        get("/api/hakemus/2")
      )
      .andExpect(status().isNotFound)
  }
}
