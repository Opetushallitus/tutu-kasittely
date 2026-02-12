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

@Component class AuthenticationEventListener(auditLog: AuditLog) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[AuthenticationEventListener])

  @EventListener def onAuthenticationSuccess(
    event: AuthenticationSuccessEvent
  ): Unit = {
    val target = new Target.Builder()
      .setField("userOid", event.getAuthentication.getName)
      .build()
    val request = getCurrentHttpRequest
    audit.log(getUser(request), Login, target, Changes.EMPTY)
  }

  private def getCurrentHttpRequest: HttpServletRequest = {
    val requestAttributes =
      RequestContextHolder.getRequestAttributes
        .asInstanceOf[ServletRequestAttributes]
    requestAttributes.getRequest
  }
}
