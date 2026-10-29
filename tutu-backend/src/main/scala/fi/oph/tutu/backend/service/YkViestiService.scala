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

    uudetViestit > 0
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
            esittelija = viesti.esittelija,
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
    jarjestaViestilista(ykViestiList, sortParam)
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

        Some(
          YkViestiListItem(
            id = viesti.id,
            parentId = viesti.parentId,
            hakemusOid = viesti.hakemusOid.toString,
            asiatunnus = viesti.asiatunnus,
            esittelija = viesti.esittelija,
            lahettajaOid = viesti.lahettajaOid,
            vastaanottajaOid = viesti.vastaanottajaOid,
            luotu = viesti.luotu,
            luettu = luettu,
            viesti = viesti.viesti,
            status = status,
            aihe = viesti.aihe
          )
        )
      }
    jarjestaViestilista(ykViestiList, sortParam)
  }

  private def jarjestaViestilista(
    ykViestiList: Seq[YkViestiListItem],
    sortParam: Option[ListSortParam]
  ): Seq[YkViestiListItem] = {
    sortParam match {
      case Some(ListSortParam(param, sortDef @ (SortDef.Asc | SortDef.Desc))) =>
        given Ordering[ViestinTila] = Ordering.by(_.ordinal)
        // Aihe järjestetään avaimen mukaan, ei käännetyn tekstin
        val jarjestetty = param match {
          case "lahetetty"  => ykViestiList.sortBy(_.luotu)
          case "aihe"       => ykViestiList.sortBy(_.aihe)
          case "esittelija" => ykViestiList.sortBy(_.esittelija)
          case "asiatunnus" => ykViestiList.sortBy(_.asiatunnus)
          case "tila"       => ykViestiList.sortBy(_.status)
          case _            => ykViestiList
        }
        if (sortDef == SortDef.Desc) jarjestetty.reverse else jarjestetty
      case _ => ykViestiList
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

    ykViestiRepository.haeYkViesti(hakemusOid, ykVastaus.id.get) match {
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
        val viestistaEiLuettu     = !ykViesti.luettu.contains(user.userOid)
        val vastaanottajaLukijana = ykViesti.vastaanottajaOid.contains(user.userOid)

        if (viestistaEiLuettu && viestiLuettavissa && vastaanottajaLukijana) {
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

  def poistaYkViesti(
    hakemusOid: HakemusOid,
    viestiId: String,
    userOid: UserOid
  ): Unit = {
    ykViestiRepository.haeYkViesti(hakemusOid.toString, viestiId) match {
      case Some(ykViesti) => {
        // TODO: Välitallennusta ei toteutettu (OPHTUTU-509)
        // Tässä tulisi tarkistaa että viesti on vain "välitallennettu", eikä vielä lähetetty
        // vastaanottajalle. Kun välitallennus toteutetaan, muutetaan tätä logiikkaa siten
        // ettei lähetetyt viestit päädy poistettaviksi

        val viestiaEiLahetetty       = /* Puuttuva logiikka välitallennuksesta */ true
        val kysyjaPoistaaOmaaViestia = ykViesti.luoja.contains(userOid.toString)

        if (viestiaEiLahetetty && kysyjaPoistaaOmaaViestia) {
          ykViestiRepository.suoritaPoistaYkViesti(ykViesti.id)
        } else {
          throw Exception(s"Yhteiskäsittelyn viestiä $viestiId ei voida poistaa")
        }
      }
      case None => throw NotFoundException(s"Yhteiskäsittelyn viesti $viestiId not found")
    }
  }
}
