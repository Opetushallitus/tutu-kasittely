package fi.oph.tutu.backend.controller

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
class FrontendResourceTest extends IntegrationTestBase {

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
  def returnsFrontendIndexForRootAndDeepLinks(): Unit = {
    mockMvc
      .perform(get("/tutu-frontend/"))
      .andExpect(status().isOk)
      .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
      .andExpect(content().string(containsString("Frontend index")))
      .andExpect(header().string("Cache-Control", containsString("no-cache")))
      .andExpect(header().string("Cache-Control", containsString("must-revalidate")))

    mockMvc
      .perform(get("/tutu-frontend/deep/link"))
      .andExpect(status().isOk)
      .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
      .andExpect(content().string(containsString("Frontend index")))

    mockMvc
      .perform(get("/tutu-frontend/hakemus/1.2.246.562.11.00000000000003494141/perustiedot"))
      .andExpect(status().isOk)
      .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
      .andExpect(content().string(containsString("Frontend index")))
  }

  @Test
  @WithMockUser(username = "testuser", roles = Array("USER"))
  def returnsImmutableAssetResponses(): Unit = {
    mockMvc
      .perform(get("/tutu-frontend/assets/app.js"))
      .andExpect(status().isOk)
      .andExpect(content().contentTypeCompatibleWith(MediaType.valueOf("text/javascript")))
      .andExpect(content().string(containsString("frontend asset")))
      .andExpect(header().string("Cache-Control", containsString("max-age=31536000")))
      .andExpect(header().string("Cache-Control", containsString("public")))
      .andExpect(header().string("Cache-Control", containsString("immutable")))
  }
}
