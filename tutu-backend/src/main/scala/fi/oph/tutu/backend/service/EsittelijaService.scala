package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{Esittelija, UserOid}
import fi.oph.tutu.backend.repository.EsittelijaRepository
import org.springframework.stereotype.{Component, Service}

@Component
@Service
class EsittelijaService(esittelijaRepository: EsittelijaRepository) {
  def haeEsittelijat: Seq[Esittelija] = {
    esittelijaRepository
      .haeKaikkiEsittelijat()
      .map(_.toEsittelija)
  }

  def haeEsittelijaNimi(esittelijaOid: String): Option[String] = {
    if (UserOid(esittelijaOid).isValid) {
      esittelijaRepository.haeEsittelijaOidilla(esittelijaOid) match {
        case Some(esittelija) => Some(s"${esittelija.kutsumanimi} ${esittelija.sukunimi}")
        case _                => Some(esittelijaOid)
      }
    } else {
      Some(esittelijaOid)
    }
  }
}
