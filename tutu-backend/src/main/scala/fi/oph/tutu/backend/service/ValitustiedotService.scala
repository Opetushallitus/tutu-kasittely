package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{HakemusOid, ValitusHaO, ValitusKHO, ValitusLausuntopyynto, Valitustiedot}
import fi.oph.tutu.backend.exception.ValitustiedotValidationException
import fi.oph.tutu.backend.repository.{HakemusRepository, ValitustiedotRepository}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}

import java.time.LocalDateTime
import java.util.UUID

@Component
@Service
class ValitustiedotService(
  valitustiedotRepository: ValitustiedotRepository,
  hakemusRepository: HakemusRepository,
  hakemusService: HakemusService,
  onrService: OnrService
) {

  val LOG: Logger = LoggerFactory.getLogger(classOf[ValitustiedotService])

  private def validoiValitusKHOPvm(valitusKHO: ValitusKHO): Unit = {
    (valitusKHO.valitettu, valitusKHO.valitusPvm, valitusKHO.ratkaisuPvm) match {
      case (valitettu, Some(_), _) if !valitettu.contains(true) =>
        throw new ValitustiedotValidationException("KHO:n valituspäivä ei voi olla asetettu ilman valitusta")
      case (valitettu, _, Some(_)) if !valitettu.contains(true) =>
        throw new ValitustiedotValidationException("KHO:n ratkaisupäivä ei voi olla asetettu ilman valitusta")
      case (_, None, Some(_)) =>
        throw new ValitustiedotValidationException("KHO:n ratkaisupäivä ei voi olla asetettu ilman valituspäivää")
      case (_, Some(valitusPvm), Some(ratkaisuPvm)) if ratkaisuPvm.isBefore(valitusPvm) =>
        throw new ValitustiedotValidationException("KHO:n ratkaisupäivä ei voi olla ennen valituspäivää")
      case _ =>
    }
  }

  private def validoiValitusHaOPvm(valitusHaO: ValitusHaO): Unit = {
    (valitusHaO.valitettu, valitusHaO.valitusPvm, valitusHaO.ratkaisuPvm) match {
      case (valitettu, Some(_), _) if !valitettu.contains(true) =>
        throw new ValitustiedotValidationException("HaO:n valituspäivä ei voi olla asetettu ilman valitusta")
      case (valitettu, _, Some(_)) if !valitettu.contains(true) =>
        throw new ValitustiedotValidationException("HaO:n ratkaisupäivä ei voi olla asetettu ilman valitusta")
      case (_, None, Some(_)) =>
        throw new ValitustiedotValidationException("HaO:n ratkaisupäivä ei voi olla asetettu ilman valituspäivää")
      case (_, Some(valitusPvm), Some(ratkaisuPvm)) if ratkaisuPvm.isBefore(valitusPvm) =>
        throw new ValitustiedotValidationException("HaO:n ratkaisupäivä ei voi olla ennen valituspäivää")
      case _ =>
    }
  }

  private def validoiLausuntopyyntoTila(
    tuomioistuinTunnus: String,
    valitettu: Option[Boolean],
    lausuntopyynto: Option[Boolean]
  ): Unit = {
    (valitettu, lausuntopyynto) match {
      case (valitettu, Some(true)) if !valitettu.contains(true) =>
        throw new ValitustiedotValidationException(
          s"$tuomioistuinTunnus:n lausuntopyyntö ei voi olla asetettu ilman valitusta"
        )
      case _ =>
    }
  }

  private def validoiLausuntopyyntoSaapumisPvm(
    tuomioistuinTunnus: String,
    lausuntopyynto: Option[Boolean],
    lausuntopyynnonSaapumisPvm: Option[LocalDateTime]
  ): Unit = {
    (lausuntopyynto, lausuntopyynnonSaapumisPvm) match {
      case (lausuntopyynto, Some(_)) if !lausuntopyynto.contains(true) =>
        throw new ValitustiedotValidationException(
          s"$tuomioistuinTunnus:n lausuntopyynnön saapumispäivä ei voi olla asetettu ilman lausuntopyyntöä"
        )
      case _ =>
    }
  }

  private def validoiLausuntopyyntoMaaraaikaPvm(
    tuomioistuinTunnus: String,
    lausuntopyynnonSaapumisPvm: Option[LocalDateTime],
    lausunnonMaaraaikaPvm: Option[LocalDateTime]
  ): Unit = {
    (lausuntopyynnonSaapumisPvm, lausunnonMaaraaikaPvm) match {
      case (None, Some(_)) =>
        throw new ValitustiedotValidationException(
          s"$tuomioistuinTunnus:n lausunnon määräaika ei voi olla asetettu ilman lausuntopyynnön saapumispäivää"
        )
      case (Some(saapumisPvm), Some(maaraaikaPvm)) if maaraaikaPvm.isBefore(saapumisPvm) =>
        throw new ValitustiedotValidationException(
          s"$tuomioistuinTunnus:n lausunnon määräaika ei voi olla ennen lausuntopyynnön saapumispäivää"
        )
      case _ =>
    }
  }

  private def validoiLausuntoAnnettuPvm(
    tuomioistuinTunnus: String,
    lausuntopyynnonSaapumisPvm: Option[LocalDateTime],
    lausuntoAnnettuPvm: Option[LocalDateTime]
  ): Unit = {
    (lausuntopyynnonSaapumisPvm, lausuntoAnnettuPvm) match {
      case (None, Some(_)) =>
        throw new ValitustiedotValidationException(
          s"$tuomioistuinTunnus:n lausunto annettu -päivämäärä ei voi olla asetettu ilman lausuntopyynnön saapumispäivää"
        )
      case (Some(saapumisPvm), Some(annettuPvm)) if annettuPvm.isBefore(saapumisPvm) =>
        throw new ValitustiedotValidationException(
          s"$tuomioistuinTunnus:n lausunto annettu -päivämäärä ei voi olla ennen lausuntopyynnön saapumispäivää"
        )
      case _ =>
    }
  }

  private def validoiValitusLausuntopyynto(
    tuomioistuinTunnus: String,
    valitettu: Option[Boolean],
    lausuntopyyntoValittu: Option[Boolean],
    lausuntopyynto: Option[ValitusLausuntopyynto]
  ): Unit = {
    validoiLausuntopyyntoTila(tuomioistuinTunnus, valitettu, lausuntopyyntoValittu)
    validoiLausuntopyyntoSaapumisPvm(tuomioistuinTunnus, lausuntopyyntoValittu, lausuntopyynto.flatMap(_.saapumisPvm))
    validoiLausuntopyyntoMaaraaikaPvm(
      tuomioistuinTunnus,
      lausuntopyynto.flatMap(_.saapumisPvm),
      lausuntopyynto.flatMap(_.maaraAikaPvm)
    )
    validoiLausuntoAnnettuPvm(
      tuomioistuinTunnus,
      lausuntopyynto.flatMap(_.saapumisPvm),
      lausuntopyynto.flatMap(_.lausuntoAnnettuPvm)
    )
  }

  private def validoiValitusKHO(valitusKHO: ValitusKHO): Unit = {
    validoiValitusKHOPvm(valitusKHO)
    validoiValitusLausuntopyynto(
      "KHO",
      valitusKHO.valitettu,
      valitusKHO.lausuntopyyntoValittu,
      valitusKHO.lausuntopyynto
    )
  }

  private def validoiValitusHaO(valitusHaO: ValitusHaO): Unit = {
    validoiValitusHaOPvm(valitusHaO)
    validoiValitusLausuntopyynto(
      "HaO",
      valitusHaO.valitettu,
      valitusHaO.lausuntopyyntoValittu,
      valitusHaO.lausuntopyynto
    )
  }

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
    validoiValitusKHO(valitustiedot.valitusKHO)
    validoiValitusHaO(valitustiedot.valitusHaO)

    val (vanhaValitustiedot, uusiValitustiedot) = valitustiedotRepository.haeValitustiedot(hakemusOid) match {
      case Some(oldValitustiedot) =>
        (
          Some(haeNimet(oldValitustiedot)),
          paivitaValitustiedot(oldValitustiedot.id.get, valitustiedot, luojaTaiMuokkaaja).map(vt => haeNimet(vt))
        )
      case None =>
        (None, lisaaValitustiedot(hakemusOid, valitustiedot, luojaTaiMuokkaaja).map(vt => haeNimet(vt)))
    }

    // Valitustiedot voivat vaikuttaa hakemuksen käsittelyvaiheeseen,
    // joten lasketaan se uudelleen tallennuksen jälkeen.
    if (uusiValitustiedot.isDefined) {
      hakemusService.paivitaKasittelyVaiheSisaisesti(hakemusOid, luojaTaiMuokkaaja)
    }

    (vanhaValitustiedot, uusiValitustiedot)
  }
}
