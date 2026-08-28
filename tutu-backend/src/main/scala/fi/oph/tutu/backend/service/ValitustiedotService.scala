package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{HakemusOid, Valitustiedot}
import fi.oph.tutu.backend.repository.{HakemusRepository, ValitustiedotRepository}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}

import java.util.UUID

@Component
@Service
class ValitustiedotService(
  valitustiedotRepository: ValitustiedotRepository,
  hakemusRepository: HakemusRepository,
  onrService: OnrService
) {

  val LOG: Logger = LoggerFactory.getLogger(classOf[ValitustiedotService])

  private def haeNimet(valitustiedot: Valitustiedot): Valitustiedot = {
    valitustiedot.copy(
      luoja = onrService.haeNimiOption(valitustiedot.luoja),
      muokkaaja = onrService.haeNimiOption(valitustiedot.muokkaaja)
    )
  }

  def haeValitustiedot(hakemusOid: HakemusOid): Option[Valitustiedot] = {
    valitustiedotRepository.haeValitustiedot(hakemusOid).map(vt => haeNimet(vt))
  }

  private def lisaaValitustiedot(
    hakemusOid: HakemusOid,
    valitustiedot: Valitustiedot,
    luoja: String
  ): Option[Valitustiedot] = {
    hakemusRepository.haeHakemus(hakemusOid) match {
      case Some(dbHakemus) =>
        Some(valitustiedotRepository.lisaaValitustiedot(valitustiedot.copy(hakemusId = Some(dbHakemus.id)), luoja))
      case None =>
        None
    }
  }

  private def paivitaValitustiedot(id: UUID, valitustiedot: Valitustiedot, muokkaaja: String): Option[Valitustiedot] = {
    valitustiedotRepository.paivitaValitustiedot(id, valitustiedot, muokkaaja)
  }

  def tallennaValitustiedot(
    hakemusOid: HakemusOid,
    valitustiedot: Valitustiedot,
    luojaTaiMuokkaaja: String
  ): (Option[Valitustiedot], Option[Valitustiedot]) = {
    haeValitustiedot(hakemusOid) match {
      case Some(oldValitustiedot) =>
        (
          Some(haeNimet(oldValitustiedot)),
          paivitaValitustiedot(oldValitustiedot.id.get, valitustiedot, luojaTaiMuokkaaja).map(vt => haeNimet(vt))
        )
      case None =>
        (None, lisaaValitustiedot(hakemusOid, valitustiedot, luojaTaiMuokkaaja).map(vt => haeNimet(vt)))
    }
  }
}
