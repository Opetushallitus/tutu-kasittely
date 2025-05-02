package fi.oph.tutu.backend

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.controller.Hakemus
import org.hamcrest.Matchers.containsString
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.junit.jupiter.api.{Order, Test, TestInstance, TestMethodOrder}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@AutoConfigureMockMvc
@TestInstance(Lifecycle.PER_CLASS)
@ActiveProfiles(Array("test"))
@TestMethodOrder(classOf[OrderAnnotation])
class ControllerTest extends IntegrationTestBase {
  @Autowired
  private val mockMvc: MockMvc = null

  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)

  @Test
  @Order(1)
  def luoHakemusValidRequestReturns200(): Unit = {
    val hakemus     = Hakemus("1.2.246.562.00.00000000000000006666")
    val requestJson = mapper.writeValueAsString(hakemus)

    mockMvc
      .perform(
        post("/api/hakemus")
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isOk)

  }

  @Test
  @Order(2)
  def luoHakemusValidRequestReturns500WhenHakemusAlreadyExists(): Unit = {
    val hakemus     = Hakemus("1.2.246.562.00.00000000000000006666")
    val requestJson = mapper.writeValueAsString(hakemus)

    mockMvc
      .perform(
        post("/api/hakemus")
          .contentType(MediaType.APPLICATION_JSON)
          .content(requestJson)
      )
      .andExpect(status().isInternalServerError)
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(
        content().string(
          containsString(
            "Hakemuksen tallennus epäonnistui: " +
              "ERROR: duplicate key value violates unique constraint \"hakemus_hakemus_oid_key\""
          )
        )
      )
  }
  @Test
  @Order(3)
  def luoHakemusInvalidRequestReturns500(): Unit = {
    mockMvc
      .perform(
        post("/api/hakemus")
          .contentType(MediaType.APPLICATION_JSON)
          .content("Eipä ollu oid")
      )
      .andExpect(status().isInternalServerError)
  }
}
