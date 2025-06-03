package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{Esittelija, User}
import fi.oph.tutu.backend.security.AuthenticationFacade
import fi.oph.tutu.backend.utils.AuthoritiesUtil
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.{Component, Service}

@Component
@Service
class UserService(
  onrService: OnrService,
  authenticationFacade: AuthenticationFacade,
  kayttooikeusService: KayttooikeusService
) {

  def getEnrichedUserDetails: User = {
    val principal = authenticationFacade.getAuthentication.getPrincipal
      .asInstanceOf[UserDetails]
    if (principal == null) {
      null
    } else {
      val username = principal.getUsername
      val asiointikieli = onrService.haeAsiointikieli(username) match {
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

  def getEsittelijat: Seq[Esittelija] = {
    kayttooikeusService.haeEsittelijat match {
      case Left(error) =>
        throw new RuntimeException("Käyttöoikeusryhmän tietojen haku epäonnistui.", error)
      case Right(esittelijaOidit) =>
        val esittelijat = esittelijaOidit.map(oid =>
          onrService.haeHenkilo(oid) match {
            case Left(error) =>
              throw new RuntimeException(s"Henkilön tietojen haku epäonnistui OID:llä $oid", error)
            case Right(esittelija) => Esittelija(esittelija.oidHenkilo, esittelija.kutsumanimi, esittelija.sukunimi)
          }
        )
        esittelijat
    }
  }
}
