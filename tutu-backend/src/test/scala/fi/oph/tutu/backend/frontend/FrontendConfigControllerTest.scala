package fi.oph.tutu.backend.frontend

import fi.oph.tutu.backend.IntegrationTestBase
import org.hamcrest.Matchers.containsString
import org.junit.jupiter.api.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.web.servlet.setup.{DefaultMockMvcBuilder, MockMvcBuilders, MockMvcConfigurer}
import org.springframework.web.context.WebApplicationContext

@AutoConfigureMockMvc
@ActiveProfiles(Array("test"))
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class FrontendConfigControllerTest extends IntegrationTestBase {

  @Autowired
  private val context: WebApplicationContext = null
  private var mockMvc: MockMvc               = null

  @BeforeAll def setup(): Unit = {
    val configurer: MockMvcConfigurer =
      SecurityMockMvcConfigurers.springSecurity()
    val intermediate: DefaultMockMvcBuilder =
      MockMvcBuilders.webAppContextSetup(context).apply(configurer)
    mockMvc = intermediate.build()
  }

  @Test
  @WithMockUser(username = "testuser", roles = Array("USER"))
  def returnsRuntimeConfigJs(): Unit =
    mockMvc
      .perform(get("/tutu-frontend/config.js"))
      .andExpect(status().isOk)
      .andExpect(content().contentType(MediaType.valueOf("application/javascript")))
      .andExpect(header().string("Cache-Control", containsString("no-store")))
      .andExpect(content().string(containsString("window.configuration = ")))
      .andExpect(content().string(containsString("\"VIRKAILIJA_URL\"")))
      .andExpect(content().string(containsString("\"TUTU_BACKEND\" : \"\"")))
      .andExpect(content().string(containsString("\"IS_TEST\" : true")))
      .andExpect(content().string(containsString("\"PUBLIC_TOLGEE_API_URL\"")))
      .andExpect(content().string(containsString("\"PUBLIC_TOLGEE_API_KEY\"")))
}
