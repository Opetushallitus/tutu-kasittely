package fi.oph.tutu.backend.security

import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component

import scala.jdk.CollectionConverters.CollectionHasAsScala

trait IAuthenticationFacade {
  def getAuthentication: Authentication
}

@Component("authFacade")
class AuthenticationFacade extends IAuthenticationFacade {

  @Override
  def getAuthentication: Authentication =
    SecurityContextHolder.getContext.getAuthentication

  def hasTutuAuthorities: Boolean = {
    val authentication = getAuthentication
    if (authentication == null) {
      false
    } else {
      val authorities = authentication.getAuthorities
      authorities != null && authorities.asScala.exists(
        _.getAuthority.startsWith(SecurityConstants.SECURITY_ROOLI_CRUD_FULL)
      )
    }
  }
}
