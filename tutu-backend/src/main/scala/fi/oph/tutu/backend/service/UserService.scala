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
  kayttooikeusService: KayttooikeusService,
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
          if (throwOnrException)
            throw e
          else
            None
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
    kayttooikeusService.haeEsittelijat match {
      case Left(error) =>
        throw KayttooikeusServiceException("Käyttöoikeusryhmän tietojen haku epäonnistui.", error)
      case Right(esittelijaOidit) =>
        // Get all esittelijat data in a single query
        val dbEsittelijat = esittelijaRepository.haeKaikkiEsittelijat()

        // Combine with ONR data for the active esittelijat
        esittelijaOidit.flatMap(oid => {
          onrService.haeHenkilo(oid) match {
            case Left(error) =>
              throw OnrServiceException(s"Henkilön tietojen haku epäonnistui OID:lla $oid", error)
            case Right(esittelija) =>
              val dbEsittelijaId = dbEsittelijat.find(_.esittelijaOid.toString == oid).map(_.esittelijaId)
              Some(
                Esittelija(
                  esittelija.oidHenkilo,
                  esittelija.kutsumanimi,
                  esittelija.sukunimi,
                  dbEsittelijaId
                )
              )
          }
        })
    }
  }
}
