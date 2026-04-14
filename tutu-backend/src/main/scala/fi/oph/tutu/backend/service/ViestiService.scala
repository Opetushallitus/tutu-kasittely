package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.{EsittelijaRepository, HakemusRepository, ViestiRepository}
import fi.oph.tutu.backend.utils.TutuJsonFormats
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}

import java.util.UUID
import java.time.LocalDateTime

@Component
@Service
class ViestiService(
  viestiRepository: ViestiRepository,
  hakemusRepository: HakemusRepository,
  esittelijaRepository: EsittelijaRepository,
  onrService: OnrService,
  hakemusService: HakemusService,
  translationService: TranslationService
) extends TutuJsonFormats {
  val LOG: Logger = LoggerFactory.getLogger(classOf[ViestiService])

  private def haeEsittelija(esittelijaOid: Option[String]): Option[Esittelija] = {
    esittelijaOid match {
      case Some(esittelijaOid) =>
        esittelijaRepository
          .haeEsittelijaOidilla(esittelijaOid)
          .map(_.toEsittelija)
          .orElse(onrService.haeHenkilo(esittelijaOid).toOption.map(_.toEsittelija))
      case _ => None
    }
  }

  def taytaNimet(viesti: Viesti): Viesti = {
    val muokkaajaNimi = haeEsittelija(viesti.muokkaaja).map(_.kokoNimi())
    viesti.copy(
      muokkaaja = muokkaajaNimi,
      vahvistaja =
        if (viesti.muokkaaja == viesti.vahvistaja) muokkaajaNimi
        else haeEsittelija(viesti.vahvistaja).map(_.kokoNimi())
    )
  }

  def haeViestiLista(hakemusOid: HakemusOid, sortParams: Option[ListSortParam]): Seq[ViestiListItem] = {
    hakemusRepository.haeHakemus(hakemusOid) match {
      case Some(dbHakemus: DbHakemus) =>
        viestiRepository
          .haeViestiLista(dbHakemus.id, sortParams)
      case _ => List()
    }
  }

  def haeViestiTyoversio(hakemusOid: HakemusOid): Option[Viesti] = {
    hakemusRepository.haeHakemus(hakemusOid) match {
      case Some(dbHakemus: DbHakemus) =>
        viestiRepository.haeVahvistamatonViesti(dbHakemus.id) match {
          case Some(viesti) => Some(taytaNimet(viesti))
          case None         =>
            val ataruHakemus = hakemusService.haeAtaruHakemus(hakemusOid)
            LOG.info(
              s"""Hakemuksella $hakemusOid ei ole keskeneräistä (vahvistamatonta) viestiä, palautetaan uusi viesti,
                  kieli: ${ataruHakemus.lang}"""
            )
            Some(Viesti(hakemusId = Some(dbHakemus.id), kieli = Kieli.optionFromString(ataruHakemus.lang)))
        }
      case _ =>
        None
    }
  }

  def haeViesti(id: UUID): Option[Viesti] = {
    viestiRepository.haeViesti(id).map(taytaNimet)
  }

  def tallennaViesti(
    hakemusOid: HakemusOid,
    viesti: Viesti,
    luojaTaiMuokkaaja: String,
    merkitseVahvistetuksi: Boolean = false
  ): (Option[Viesti], Option[Viesti]) = {
    hakemusRepository.haeHakemus(hakemusOid) match {
      case Some(dbHakemus: DbHakemus) =>
        val viestiToSave = if (merkitseVahvistetuksi) {
          taytaVahvistusTiedot(viesti, luojaTaiMuokkaaja)
        } else {
          viesti
        }
        val currentViesti = viestiToSave.id match {
          case Some(viestiId) => haeViesti(viestiId)
          case _              => None
        }
        val newOrUpdatedViesti = currentViesti match {
          case Some(existing) => viestiRepository.tallennaViesti(existing.id.get, viestiToSave, luojaTaiMuokkaaja)
          case _              => viestiRepository.lisaaViesti(dbHakemus.id, viestiToSave, luojaTaiMuokkaaja)
        }
        (currentViesti.map(taytaNimet), Some(newOrUpdatedViesti).map(taytaNimet))
      case _ => (None, None)
    }
  }

  private[service] def taytaVahvistusTiedot(viesti: Viesti, vahvistajaOid: String): Viesti = {
    val viestiWithAllekirjoitus = haeEsittelija(Some(vahvistajaOid)) match {
      case Some(esittelija) =>
        viesti.kieli match {
          case Some(kieli) =>
            val tervehdysTeksti =
              translationService.getTranslation(kieli, "hakemus.viesti.allekirjoitus.tervehdys")
            val ophTeksti =
              translationService.getTranslation(kieli, "hakemus.viesti.allekirjoitus.opetushallitus")
            val sahkoposti    = esittelija.sahkoposti.getOrElse("")
            val allekirjoitus =
              s"""<p>
                 |<span style="white-space: pre-wrap;">$tervehdysTeksti,</span>
                 |<br><br>
                 |<span style="white-space: pre-wrap;">${esittelija.kokoNimi()}</span>
                 |<br>
                 |<span style="white-space: pre-wrap;">$ophTeksti</span>
                 |<br>
                 |<a href="mailto:$sahkoposti"><span style="white-space: pre-wrap;">$sahkoposti</span></a>
                 |<br>
                 |<span style="white-space: pre-wrap;">${esittelija.puhelinnumero.getOrElse("")}</span>
                 |</p>""".stripMargin.replaceAll("\n", "")
            viesti.copy(viesti = Some(s"${viesti.viesti.getOrElse("")}$allekirjoitus"))
          case _ =>
            LOG.warn(s"Viestillä ei ollut valittua kieltä, allekirjoitus jätetään tyhjäksi")
            viesti
        }
      case _ =>
        LOG.warn(s"Esittelijää ei löytynyt oidilla: $vahvistajaOid, allekirjoitus jätetään tyhjäksi")
        viesti
    }
    viestiWithAllekirjoitus.copy(
      vahvistettu = Some(LocalDateTime.now()),
      vahvistaja = Some(vahvistajaOid)
    )
  }

  def poistaViesti(id: UUID): Int = {
    viestiRepository.poistaViesti(id)
  }
}
