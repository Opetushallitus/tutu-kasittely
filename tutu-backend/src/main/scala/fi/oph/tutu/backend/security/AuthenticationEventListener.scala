package fi.oph.tutu.backend.security

import fi.oph.tutu.backend.utils.AuditLog
import fi.oph.tutu.backend.utils.AuditLog.{audit, getUser}
import fi.oph.tutu.backend.utils.AuditOperation.Login
import fi.vm.sade.auditlog.{Changes, Target}
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.context.event.EventListener
import org.springframework.security.authentication.event.AuthenticationSuccessEvent
import org.springframework.stereotype.Component
import org.springframework.web.context.request.{RequestContextHolder, ServletRequestAttributes}
import scala.jdk.CollectionConverters._

@Component class AuthenticationEventListener(auditLog: AuditLog) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[AuthenticationEventListener])

  @EventListener def onAuthenticationSuccess(
    event: AuthenticationSuccessEvent
  ): Unit = {
    val target = new Target.Builder()
      .setField("userOid", event.getAuthentication.getName)
      .build()
    val request = getCurrentHttpRequest

    if (request != null) {
      val headerLines = request.getHeaderNames.asScala.toSeq.sorted.map { name =>
        val value     = request.getHeaders(name).asScala.mkString(", ")
        val safeValue = if (name.equalsIgnoreCase("authorization")) "***" else value
        s"$name: $safeValue"
      }
      LOG.info(s"Request headers (${headerLines.size}):")
      headerLines.foreach(line => LOG.info(line))
    } else {
      LOG.warn("No HttpServletRequest bound to current thread; cannot log headers.")
    }

    audit.log(getUser(request), Login, target, Changes.EMPTY)
    val username = event.getAuthentication.getName
  }

  private def getCurrentHttpRequest: HttpServletRequest = {
    val requestAttributes =
      RequestContextHolder.getRequestAttributes
        .asInstanceOf[ServletRequestAttributes]
    requestAttributes.getRequest
  }
}
