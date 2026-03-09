package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{Esittelija, User}
import fi.oph.tutu.backend.security.AuthenticationFacade
import fi.oph.tutu.backend.utils.AuthoritiesUtil
import fi.oph.tutu.backend.repository.EsittelijaRepository
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.{Component, Service}

@Component
@Service
class UserService(
  onrService: OnrService,
  authenticationFacade: AuthenticationFacade,
  esittelijaRepository: EsittelijaRepository
) {

  def getEnrichedUserDetails(throwOnrException: Boolean = false): User = {
    val principal = authenticationFacade.getAuthentication.getPrincipal
      .asInstanceOf[UserDetails]
    if (principal == null) {
      null
    } else {
      val username      = principal.getUsername
      val asiointikieli = onrService.haeAsiointikieli(username) match {
        case Left(e) =>
          if (throwOnrException) {
            throw e
          } else {
            None
          }
        case Right(v) => Some(v)
      }

      User(
        userOid = username,
        authorities = AuthoritiesUtil.getTutuAuthorities(principal.getAuthorities),
        asiointikieli = asiointikieli
      )
    }
  }

  def haeEsittelijat: Seq[Esittelija] = {
    esittelijaRepository
      .haeKaikkiEsittelijat()
      .map { e =>
        Esittelija(
          esittelijaOid = e.esittelijaOid.toString,
          etunimi = e.kutsumanimi.getOrElse(""),
          sukunimi = e.sukunimi.getOrElse(""),
          id = Some(e.esittelijaId)
        )
      }
  }

}
