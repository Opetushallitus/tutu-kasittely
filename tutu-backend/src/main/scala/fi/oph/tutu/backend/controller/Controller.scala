package fi.oph.tutu.backend.controller

import fi.oph.tutu.backend.service.HakemuspalveluService
import fi.oph.tutu.backend.utils.AuditLog
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.web.bind.annotation.{GetMapping, RequestMapping, RestController}

@RestController
@RequestMapping(path = Array("api"))
class Controller(
    hakemuspalveluService: HakemuspalveluService,
    val auditLog: AuditLog = AuditLog
) {
  val LOG = LoggerFactory.getLogger(classOf[Controller])

  @Value("${tutu.ui.url}")
  val tutuUiUrl: String = null

  @GetMapping(path = Array("healthcheck"))
  def healthcheck = "Tutu is alive and kicking!"

  // TODO: FOR TESTING, TO BE REMOVED LATERZ
  @GetMapping(path = Array("test"))
  def testi: Unit = {
    hakemuspalveluService.getHakemus("1.2.246.562.11.00000000000002349688") match {
      case Left(error: Throwable)  => LOG.error("Error fetching: ", error)
      case Right(response: String) => LOG.info(s"Response: $response")
    }
  }

}
