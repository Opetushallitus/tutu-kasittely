package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.User
import fi.oph.tutu.backend.security.AuthenticationFacade
import fi.oph.tutu.backend.utils.AuthoritiesUtil
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.{Component, Service}

@Component
@Service
class UserService(
  onrService: OnrService,
  authenticationFacade: AuthenticationFacade
) {

  def getEnrichedUserDetails: User = {
    val principal = authenticationFacade.getAuthentication.getPrincipal
      .asInstanceOf[UserDetails]
    if (principal == null) {
      null
    } else {
      val username = principal.getUsername
      val asiointikieli = onrService.getAsiointikieli(username) match {
        case Left(e)  => None
        case Right(v) => Some(v)
      }

      User(
        userOid = username,
        authorities = AuthoritiesUtil.getTutuAuthorities(principal.getAuthorities),
        asiointikieli = asiointikieli
      )
    }
  }
}
