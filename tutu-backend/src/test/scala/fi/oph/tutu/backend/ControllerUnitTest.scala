package fi.oph.tutu.backend

import fi.oph.tutu.backend.controller.Controller
import fi.oph.tutu.backend.repository.HakemusRepository
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.utils.AuditLog
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.test.context.bean.`override`.mockito.MockitoBean

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

  // TODO: Yksikkötestien pohja
}
