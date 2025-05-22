package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{AtaruHakemus, Esittelija, HakemusListItem, HakemusOid}
import fi.oph.tutu.backend.repository.{EsittelijaRepository, HakemusRepository}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}

import java.util.UUID

@Component
@Service
class HakemusService(hakemusRepository: HakemusRepository, esittelijaRepository: EsittelijaRepository) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[HakemusService])

  def tallennaHakemus(hakemus: AtaruHakemus): UUID = {
    esittelijaRepository.haeEsittelijaMaakoodilla(hakemus.maakoodi) match {
      case Some(esittelija) =>
        hakemusRepository.tallennaHakemus(
          hakemus.hakemusOid,
          hakemus.syykoodi,
          Some(esittelija.esittelijaId),
          "Hakemuspalvelu"
        )
      case None => hakemusRepository.tallennaHakemus(hakemus.hakemusOid, hakemus.syykoodi, None, "Hakemuspalvelu")
    }
  }

  def haeHakemusLista(hakemusOidt: Seq[HakemusOid]): Seq[HakemusListItem] = {
    val hakemukset = hakemusRepository.haeHakemusLista(hakemusOidt)
    hakemukset
  }
}
