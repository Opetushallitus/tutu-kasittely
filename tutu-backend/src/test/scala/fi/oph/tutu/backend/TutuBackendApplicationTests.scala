package fi.oph.tutu.backend

import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.{
  content,
  status
}

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles(Array("test"))
class TutuBackendApplicationTests extends IntegrationTestBase {
  @Autowired
  private val mvc: MockMvc = null

  @Test
  @throws[Exception]
  def get200ResponseFromHealthcheckUnautheticated(): Unit =
    mvc
      .perform(
        MockMvcRequestBuilders
          .get("/api/healthcheck")
          .accept(MediaType.APPLICATION_JSON)
      )
      .andExpect(status.isOk)
      .andExpect(content.string(equalTo("Tutu is alive and kicking!")))
}
