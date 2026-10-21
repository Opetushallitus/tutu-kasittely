package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.YkViestiRepository
import fi.oph.tutu.backend.utils.TutuJsonFormats
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}

import java.time.LocalDateTime
import java.util.UUID

@Component
@Service
class YkViestiService(
  ykViestiRepository: YkViestiRepository
) extends TutuJsonFormats {
  val LOG: Logger = LoggerFactory.getLogger(classOf[YkViestiService])

  def isYkViesteja(
    userOid: String
  ): Boolean = {
    val saapuneet = ykViestiRepository.haeYkSaapuneetViestit(userOid)
    val lahetetyt = ykViestiRepository.haeYkLahetetytViestit(userOid)

    // Suodatetaan uudet saapuneet viestit
    val uudetViestit = saapuneet.count(viesti => viesti.luettu.isEmpty)

    // Suodatetaan lähetettyihin viesteihin tulleet uudet vastaukset
    // val uudetVastaukset = lahetetyt
    // .count(viesti => viesti.vastaus.nonEmpty && viesti.vastausLuettu.isEmpty)

    uudetViestit > 0 // || uudetVastaukset > 0
  }

  def haeHakemuksenYkViestiketjut(
    hakemusOid: String
  ): Seq[YkViestiKetju] = {
    val ykViestit      = ykViestiRepository.haeHakemuksenYkViestit(hakemusOid)
    val aloitusViestit = ykViestit.filter(_.parentId.isEmpty).sortBy(_.luotu)

    aloitusViestit.map { viesti =>
      val jatkoKasittelyt = ykViestit.filter(_.parentId.contains(viesti.id)).sortBy(_.luotu)
      YkViestiKetju(
        aloitusViesti = viesti,
        jatkoKasittelyt = jatkoKasittelyt
      )
    }
  }

  def haeYkSaapuneetViestit(
    userOid: String,
    sortParam: Option[ListSortParam]
  ): Seq[YkViestiListItem] = {
    val saapuneetViestit = ykViestiRepository.haeYkSaapuneetViestit(userOid)

    val ykViestiList = saapuneetViestit
      .filter(viesti => viesti.parentId.isEmpty)
      .flatMap { viesti =>
        val status: ViestinTila = ViestinTila.vastattu
        val olenLukenut         = viesti.luettu.contains(userOid)
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
            luettu = olenLukenut,
            viesti = viesti.viesti,
            status = status,
            aihe = viesti.aihe
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
        val status: ViestinTila = ViestinTila.vastattu
        val luettu              = viesti.luettu.contains(viesti.vastaanottajaOid)
        // if (vastattu && !vastausLuettu) ViestinTila.uusiVastaus
        // else if (vastattu) ViestinTila.vastattu
        // else ViestinTila.vastaamatta

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
            luettu = luettu,
            viesti = viesti.viesti,
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

  def tallennaHakemuksenYkViesti(
    hakemusOid: String,
    user: User,
    ykKysymys: YkKysymysDTO
  ): Unit = {

    ykViestiRepository.tallennaHakemuksenYkViesti(
      YkViesti(
        id = null,
        parentId = ykKysymys.parentId.map(UUID.fromString),
        hakemusOid = HakemusOid(hakemusOid),
        lahettajaOid = Some(user.userOid),
        vastaanottajaOid = ykKysymys.vastaanottajaOid,
        viesti = ykKysymys.viesti,
        hakija = null,
        luoja = Some(user.userOid)
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

    val ykViesti: Unit = ykViestiRepository.haeYkViesti(hakemusOid, ykVastaus.id.get) match {
      case Some(ykViesti) =>
        ykViestiRepository.muokkaaHakemuksenYkViestia(
          ykViesti.copy(
            muokkaaja = Some(user.userOid)
          )
        )
      case None => throw NotFoundException(s"Yhteiskäsittelyn viesti ${ykVastaus.id.get} not found")
    }
  }

  def merkitseYkViestiLuetuksi(
    hakemusOid: String,
    viestiId: String,
    user: User
  ): Unit = {
    ykViestiRepository.haeYkViesti(hakemusOid, viestiId) match {
      case Some(ykViesti) =>
        val viestiLuettavissa     = ykViesti.viesti.nonEmpty
        val viestistäEiLuettu     = !ykViesti.luettu.contains(user.userOid)
        val vastaanottajaLukijana = ykViesti.vastaanottajaOid.contains(user.userOid) || true

        if (viestistäEiLuettu && viestiLuettavissa && vastaanottajaLukijana) {
          val luettu = ykViesti.luettu :+ user.userOid
          ykViestiRepository.muokkaaHakemuksenYkViestia(
            ykViesti.copy(
              luettu = luettu,
              muokkaaja = Some(user.userOid)
            )
          )
        }

      case None => throw NotFoundException(s"Yhteiskäsittelyn viesti $viestiId not found")
    }
  }
}
