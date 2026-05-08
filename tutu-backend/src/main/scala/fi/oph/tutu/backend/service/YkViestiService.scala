package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.YkViestiRepository
import fi.oph.tutu.backend.utils.TutuJsonFormats
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}

import scala.math.Ordering
import java.time.LocalDateTime
import java.util.UUID

@Component
@Service
class YkViestiService(
  ykViestiRepository: YkViestiRepository,
  onrService: OnrService
) extends TutuJsonFormats {
  val LOG: Logger = LoggerFactory.getLogger(classOf[HakemusService])

  def isYkViesteja(
    userOid: String
  ): Boolean = {
    val saapuneet = ykViestiRepository.haeYkSaapuneetViestit(userOid)
    val lahetetyt = ykViestiRepository.haeYkLahetetytViestit(userOid)

    // Suodatetaan uudet saapuneet viestit
    val uudetViestit = saapuneet.count(viesti => viesti.kysymysLuettu.isEmpty)

    // Suodatetaan lähetettyihin viesteihin tulleet uudet vastaukset
    val uudetVastaukset = lahetetyt
      .count(viesti => viesti.vastaus.nonEmpty && viesti.vastausLuettu.isEmpty)

    uudetViestit > 0 || uudetVastaukset > 0
  }

  def haeYkSaapuneetViestit(
    userOid: String,
    sortParam: Option[ListSortParam]
  ): Seq[YkViestiListItem] = {
    val saapuneetViestit = ykViestiRepository.haeYkSaapuneetViestit(userOid)

    val ykViestiList = saapuneetViestit
      .filter(viesti => viesti.parentId.isEmpty)
      .flatMap { viesti =>
        val status: ViestinTila =
          if (viesti.vastaus.isEmpty) ViestinTila.vastaamatta
          else ViestinTila.vastattu
        Some(
          YkViestiListItem(
            id = viesti.id,
            parentId = viesti.parentId,
            hakemusOid = viesti.hakemusOid.toString,
            asiatunnus = viesti.asiatunnus,
            hakija = viesti.hakija,
            lahettajaOid = viesti.lahettajaOid,
            vastaanottajaOid = viesti.vastaanottajaOid,
            luotu = viesti.luotu,
            kysymysLuettu = viesti.kysymysLuettu,
            vastausLuettu = viesti.vastausLuettu,
            kysymys = viesti.kysymys,
            vastaus = viesti.vastaus,
            status = status
          )
        )
      }
    sortParam match {
      case None                                => ykViestiList
      case Some(ListSortParam(param, sortDef)) =>
        given Ordering[ViestinTila] = Ordering.by(_.ordinal)
        sortDef match {
          case SortDef.Asc =>
            param match {
              case "lahetetty"  => ykViestiList.sortBy(_.luotu)
              case "hakija"     => ykViestiList.sortBy(_.hakija)
              case "asiatunnus" => ykViestiList.sortBy(_.asiatunnus)
              case "tila"       => ykViestiList.sortBy(_.status)
              case _            => ykViestiList
            }
          case SortDef.Desc =>
            param match {
              case "lahetetty"  => ykViestiList.sortBy(_.luotu).reverse
              case "hakija"     => ykViestiList.sortBy(_.hakija).reverse
              case "asiatunnus" => ykViestiList.sortBy(_.asiatunnus).reverse
              case "tila"       => ykViestiList.sortBy(_.status).reverse
              case _            => ykViestiList
            }
          case _ => ykViestiList
        }
    }
  }

  def haeYkLahetetytViestit(
    userOid: String,
    sortParam: Option[ListSortParam]
  ): Seq[YkViestiListItem] = {
    val lahetetytViestit = ykViestiRepository.haeYkLahetetytViestit(userOid)

    val ykViestiList = lahetetytViestit
      .filter(viesti => viesti.parentId.isEmpty)
      .flatMap { viesti =>
        val vastattu      = viesti.vastaus.nonEmpty
        val vastausLuettu = viesti.vastausLuettu.nonEmpty

        val status: ViestinTila =
          if (vastattu && !vastausLuettu) ViestinTila.uusiVastaus
          else if (vastattu) ViestinTila.vastattu
          else ViestinTila.vastaamatta

        Some(
          YkViestiListItem(
            id = viesti.id,
            parentId = viesti.parentId,
            hakemusOid = viesti.hakemusOid.toString,
            asiatunnus = viesti.asiatunnus,
            hakija = viesti.hakija,
            lahettajaOid = viesti.lahettajaOid,
            vastaanottajaOid = viesti.vastaanottajaOid,
            luotu = viesti.luotu,
            kysymysLuettu = viesti.kysymysLuettu,
            vastausLuettu = viesti.vastausLuettu,
            kysymys = viesti.kysymys,
            vastaus = viesti.vastaus,
            status = status
          )
        )
      }
    sortParam match {
      case None                                => ykViestiList
      case Some(ListSortParam(param, sortDef)) =>
        given Ordering[ViestinTila] = Ordering.by(_.ordinal)
        sortDef match {
          case SortDef.Asc =>
            param match {
              case "lahetetty"  => ykViestiList.sortBy(_.luotu)
              case "hakija"     => ykViestiList.sortBy(_.hakija)
              case "asiatunnus" => ykViestiList.sortBy(_.asiatunnus)
              case "tila"       => ykViestiList.sortBy(_.status)
              case _            => ykViestiList
            }
          case SortDef.Desc =>
            param match {
              case "lahetetty"  => ykViestiList.sortBy(_.luotu).reverse
              case "hakija"     => ykViestiList.sortBy(_.hakija).reverse
              case "asiatunnus" => ykViestiList.sortBy(_.asiatunnus).reverse
              case "tila"       => ykViestiList.sortBy(_.status).reverse
              case _            => ykViestiList
            }
          case _ => ykViestiList
        }
    }
  }

  def haeHakemuksenYkViestit(
    hakemusOid: String,
    user: User
  ): Seq[YkViesti] = {
    val ykViestit = ykViestiRepository
      .haeHakemuksenYkViestit(hakemusOid)
      .map(ykViesti =>
        ykViesti.copy(
          vastaanottaja = onrService.haeNimiOption(ykViesti.vastaanottajaOid),
          vastaus =
            if ykViesti.vastattu.nonEmpty || ykViesti.vastaanottajaOid.contains(user.userOid) then ykViesti.vastaus
            else None
        )
      )

    val ketjunEnsimmaiset = ykViestit.filter(viesti => viesti.parentId.isEmpty)

    ketjunEnsimmaiset
      .map(viesti =>
        val jatkoKasittelyt = ykViestit
          .filter(jatkoKasittely => jatkoKasittely.parentId.exists(_.equals(viesti.id)))
          .reverse
        viesti.copy(
          jatkoKasittelyt = jatkoKasittelyt
        )
      )
  }

  def luoHakemuksenYkViesti(
    hakemusOid: String,
    user: User,
    ykKysymys: YkKysymysDTO
  ): Unit = {

    ykViestiRepository.luoHakemuksenYkViesti(
      YkViesti(
        id = null,
        parentId = ykKysymys.parentId.map(UUID.fromString),
        hakemusOid = HakemusOid(hakemusOid),
        lahettajaOid = Some(user.userOid),
        vastaanottajaOid = ykKysymys.vastaanottajaOid,
        kysymys = ykKysymys.kysymys,
        hakija = null
      )
    )
  }

  def vastaaHakemuksenYkViestiin(
    hakemusOid: String,
    user: User,
    ykVastaus: YkVastausDTO
  ): Unit = {
    if (ykVastaus.id.isEmpty) {
      throw NotFoundException(s"Yhteiskäsittelyn viesti id is null")
    }

    val ykViesti = ykViestiRepository.haeYkViesti(hakemusOid, ykVastaus.id.get) match {
      case Some(ykViesti) => {
        val vastattu = if ykVastaus.laheta.getOrElse(false) then Some(LocalDateTime.now()) else ykViesti.vastattu
        ykViestiRepository.muokkaaHakemuksenYkViestia(
          ykViesti.copy(
            vastaus = ykVastaus.vastaus,
            vastattu = vastattu
          )
        )
      }
      case None => throw NotFoundException(s"Yhteiskäsittelyn viesti ${ykVastaus.id.get} not found")
    }
  }

  def merkitseYkViestiLuetuksi(
    hakemusOid: String,
    viestiId: String,
    user: User
  ): Unit = {
    val ykViesti = ykViestiRepository.haeYkViesti(hakemusOid, viestiId) match {
      case Some(ykViesti) => {
        val vastausLuettavissa = ykViesti.vastattu.nonEmpty
        val vastaustaEiLuettu  = ykViesti.vastausLuettu.isEmpty
        val lahettajaLukijana  = ykViesti.lahettajaOid.contains(user.userOid)

        val kysymysLuettavissa    = ykViesti.kysymys.nonEmpty
        val kysymystaEiLuettu     = ykViesti.kysymysLuettu.isEmpty
        val vastaanottajaLukijana = ykViesti.vastaanottajaOid.contains(user.userOid)

        val newViestiMaybe = if (vastaustaEiLuettu && vastausLuettavissa && lahettajaLukijana) {
          Some(
            ykViesti.copy(
              vastausLuettu = Some(LocalDateTime.now())
            )
          )
        } else if (kysymystaEiLuettu && kysymysLuettavissa && vastaanottajaLukijana) {
          Some(
            ykViesti.copy(
              kysymysLuettu = Some(LocalDateTime.now())
            )
          )
        } else {
          None
        }

        newViestiMaybe.map(ykViestiRepository.muokkaaHakemuksenYkViestia)
      }
      case None => throw NotFoundException(s"Yhteiskäsittelyn viesti ${viestiId} not found")
    }
  }
}
