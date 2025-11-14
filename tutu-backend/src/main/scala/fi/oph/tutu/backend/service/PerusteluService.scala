package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.{AsiakirjaRepository, HakemusRepository, PerusteluRepository}
import fi.oph.tutu.backend.utils.Constants.DATE_TIME_FORMAT
import fi.oph.tutu.backend.utils.TutuJsonFormats
import org.json4s.*
import org.json4s.jackson.JsonMethods.*
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}
import fi.oph.tutu.backend.service.perustelumuistio.{generate => generatePerusteluMuistio}

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.UUID

@Component
@Service
class PerusteluService(
  hakemusService: HakemusService,
  hakemusRepository: HakemusRepository,
  perusteluRepository: PerusteluRepository,
  asiakirjaRepository: AsiakirjaRepository,
  kasittelyVaiheService: KasittelyVaiheService,
  hakemuspalveluService: HakemuspalveluService,
  muistioService: MuistioService,
  maakoodiService: MaakoodiService
) extends TutuJsonFormats {
  val LOG: Logger = LoggerFactory.getLogger(classOf[PerusteluService])

  def haePerustelu(
    hakemusOid: HakemusOid
  ): Option[Perustelu] = {
    hakemusRepository
      .haeHakemus(hakemusOid)
      .flatMap { dbHakemus =>
        perusteluRepository.haePerustelu(dbHakemus.id).flatMap { perustelu =>
          {
            perusteluRepository.haeLausuntopyynnot(perustelu.id.get) match {
              case lausuntoPyynnot if lausuntoPyynnot.nonEmpty =>
                Some(
                  perustelu.copy(lausuntopyynnot = lausuntoPyynnot)
                )
              case _ => Some(perustelu)
            }
          }
        }
      }
  }

  /**
   * Päivittää perustelun kokonaan (PUT endpoint).
   * Korvaa kaikki kentät.
   * NULL arvo pyynnössä -> NULL tietokantaan.
   */
  def tallennaPerustelu(
    hakemusOid: HakemusOid,
    perustelu: Perustelu,
    luojaTaiMuokkaaja: String
  ): (Option[Perustelu], Option[Perustelu]) = {
    val dbHakemus        = hakemusRepository.haeHakemus(hakemusOid)
    val currentPerustelu = dbHakemus.flatMap(h => perusteluRepository.haePerustelu(h.id))
    val newPerustelu     = dbHakemus match {
      case Some(dbHakemus) =>
        // Täysi tallennus ilman mergeä
        val perusteluWithIds = perustelu.copy(
          hakemusId = Some(dbHakemus.id),
          id = currentPerustelu.flatMap(_.id)
        )

        val latestSavedPerustelu = perusteluRepository.tallennaPerustelu(
          dbHakemus.id,
          perusteluWithIds,
          luojaTaiMuokkaaja
        )

        // Lausuntopyynnöt - korvaa kaikki
        val currentLausuntopyynnot   = perusteluRepository.haeLausuntopyynnot(latestSavedPerustelu.id.orNull)
        val lausuntopyyntoModifyData =
          HakemusModifyOperationResolver
            .resolveLausuntopyyntoModifyOperations(currentLausuntopyynnot, perustelu.lausuntopyynnot)

        perusteluRepository.suoritaLausuntopyyntojenModifiointi(
          latestSavedPerustelu.id.orNull,
          lausuntopyyntoModifyData,
          luojaTaiMuokkaaja
        )

        val newlySavedLausuntoPyynnot =
          perusteluRepository.haeLausuntopyynnot(latestSavedPerustelu.id.orNull)

        // Päivitä kasittelyVaihe kun perustelu muuttuu
        try {
          hakemusService.paivitaKasittelyVaihe(hakemusOid, dbHakemus, luojaTaiMuokkaaja)
        } catch {
          case e: Exception =>
            LOG.error(s"Käsittelyvaiheen päivitys epäonnistui: ${e.getMessage}", e)
        }

        Some(
          latestSavedPerustelu.copy(
            lausuntopyynnot =
              if (newlySavedLausuntoPyynnot.nonEmpty)
                newlySavedLausuntoPyynnot
              else
                latestSavedPerustelu.lausuntopyynnot
          )
        )
      case _ => None
    }
    (currentPerustelu, newPerustelu)
  }

  def haePerusteluMuistio(
    hakemusOid: HakemusOid
  ): Option[String] = {
    val hakemusMaybe: Option[Hakemus]                   = hakemusService.haeHakemus(hakemusOid)
    val ataruHakemusMaybe: Option[AtaruHakemus]         = hakemuspalveluService.haeJaParsiHakemus(hakemusOid).toOption
    val perusteluMaybe: Option[Perustelu]               = haePerustelu(hakemusOid)
    val koulutuksenSisaltoMuistioMaybe: Option[Muistio] =
      muistioService.haeMuistio(hakemusOid, "perustelut-ro-uo", false)
    val muuTutkintoMuistioMaybe: Option[Muistio] =
      muistioService.haeMuistio(hakemusOid, "perustelut-uo-ro-muu-tutkinto", false)

    val perusteluMuistio = generatePerusteluMuistio(
      maakoodiService,
      hakemusMaybe,
      ataruHakemusMaybe,
      perusteluMaybe,
      koulutuksenSisaltoMuistioMaybe,
      muuTutkintoMuistioMaybe
    )

    Some(perusteluMuistio)
  }

}
