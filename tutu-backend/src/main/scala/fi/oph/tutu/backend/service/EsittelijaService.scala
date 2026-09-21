package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{Esittelija, UserOid}
import fi.oph.tutu.backend.repository.EsittelijaRepository
import org.springframework.stereotype.{Component, Service}

@Component
@Service
class EsittelijaService(esittelijaRepository: EsittelijaRepository, onrService: OnrService) {
  def haeEsittelijat: Seq[Esittelija] = {
    esittelijaRepository
      .haeKaikkiEsittelijat()
      .map(_.toEsittelija)
  }

  def haeEsittelijaNimi(esittelijaOid: String): String = {
    if (UserOid(esittelijaOid).isValid) {
      esittelijaRepository.haeEsittelijaOidilla(esittelijaOid) match {
        case Some(esittelijaDb) => esittelijaDb.toEsittelija.kokoNimi()
        case _ => onrService.haeHenkilo(esittelijaOid).toOption.map(_.toEsittelija.kokoNimi()).getOrElse(esittelijaOid)
      }
    } else {
      esittelijaOid
    }
  }
}
