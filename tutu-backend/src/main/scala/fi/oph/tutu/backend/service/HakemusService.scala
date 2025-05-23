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
    // TODO: haetaan hakemuslistaus atarun hakemuksista ja yhdistetään data
    hakemusRepository
      .haeHakemusLista(hakemusOidt)
      .map(item =>
        HakemusListItem(
          asiatunnus = item.asiatunnus,
          hakija = "Testi Hakija",
          vaihe = "Testi Vaihe",
          paatostyyppi = "Testi Paatostyyppi",
          aika = "2 kk",
          hakemusOid = item.hakemusOid,
          syykoodi = item.syykoodi,
          esittelijaOid = item.esittelijaOid
        )
      )
  }
}
