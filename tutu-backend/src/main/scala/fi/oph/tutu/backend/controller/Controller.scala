package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.utils.AuditLog
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.web.bind.annotation.{GetMapping, RequestMapping, RestController}

@RestController
@RequestMapping(path = Array("api"))
class Controller(
    val auditLog: AuditLog = AuditLog
) {
  val LOG = LoggerFactory.getLogger(classOf[Controller])

  @Value("${tutu.ui.url}")
  val tutuUiUrl: String = null

  @GetMapping(path = Array("healthcheck"))
  def healthcheck = "Tutu is alive and kicking!"
}
