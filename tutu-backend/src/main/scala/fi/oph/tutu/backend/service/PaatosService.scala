package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.{HakemusRepository, PaatosRepository}
import fi.oph.tutu.backend.service.generator.paatosteksti
import fi.oph.tutu.backend.utils.{Constants, TutuJsonFormats}
import org.json4s.jackson.JsonMethods.parse
import org.json4s.jvalue2extractable
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}

import java.util.UUID

@Component
@Service
class PaatosService(
  hakemusRepository: HakemusRepository,
  hakemusService: HakemusService,
  tutkintoService: TutkintoService,
  paatosRepository: PaatosRepository,
  hakemuspalveluService: HakemuspalveluService,
  hallintoOikeusService: HallintoOikeusService,
  ataruLomakeParser: AtaruLomakeParser,
  maakoodiService: MaakoodiService,
  onrService: OnrService
) extends TutuJsonFormats {
  val LOG: Logger = LoggerFactory.getLogger(classOf[PaatosService])

  def haePaatos(hakemusOid: HakemusOid): Option[Paatos] = {
    hakemusRepository.haeHakemus(hakemusOid).flatMap { dbHakemus =>
      paatosRepository.haePaatos(dbHakemus.id).flatMap { paatos =>
        {
          val paatosTietoOptions = hakemuspalveluService.haeLomake(dbHakemus.formId) match {
            case Right(response: String) =>
              Some(ataruLomakeParser.parsePaatosTietoOptions(parse(response).extract[AtaruLomake]))
            case Left(error) =>
              LOG.error(s"Lomakkeeen ${dbHakemus.formId} haku epäonnistui hakemuspalvelusta: ${error.getMessage}")
              None
          }

          paatosRepository.haePaatosTiedot(paatos.id.get) match {
            case paatostiedot if paatostiedot.nonEmpty =>
              val paatostiedotWithRinnastettavatTutkinnotTaiOpinnot = paatostiedot.map { paatosTieto =>
                paatosRepository.haeTutkinnotTaiOpinnot(paatosTieto.id.get) match {
                  case tutkinnotTaiOpinnot if tutkinnotTaiOpinnot.nonEmpty =>
                    paatosTieto.copy(rinnastettavatTutkinnotTaiOpinnot = tutkinnotTaiOpinnot)
                  case _ => paatosTieto
                }
              }
              val paatostiedotWithAllData = paatostiedotWithRinnastettavatTutkinnotTaiOpinnot.map { paatosTieto =>
                paatosRepository.haeKelpoisuudet(paatosTieto.id.get) match {
                  case kelpoisuudet if kelpoisuudet.nonEmpty =>
                    paatosTieto.copy(kelpoisuudet = kelpoisuudet)
                  case _ => paatosTieto
                }
              }
              Some(
                paatos.copy(
                  paatosTiedot = paatostiedotWithAllData,
                  paatosTietoOptions = paatosTietoOptions
                )
              )
            case _ =>
              Some(
                paatos.copy(paatosTietoOptions = paatosTietoOptions)
              )
          }
        }
      }
    }
  }

  def tallennaPaatos(
    hakemusOid: HakemusOid,
    paatos: Paatos,
    luojaTaiMuokkaaja: String
  ): (Option[Paatos], Option[Paatos]) = {
    val dbHakemus     = hakemusRepository.haeHakemus(hakemusOid)
    val currentPaatos = haePaatos(hakemusOid)
    val updatedPaatos = dbHakemus match {
      case Some(dbHakemus) =>
        val latestSavedPaatos = paatosRepository.tallennaPaatos(
          dbHakemus.id,
          paatos.copy(hakemusId = Some(dbHakemus.id)),
          luojaTaiMuokkaaja
        )

        val (currentPaatosTiedot, paatosTietoOptions) = currentPaatos match {
          case Some(paatos) => (paatos.paatosTiedot, paatos.paatosTietoOptions)
          case None         => (Nil, None)
        }
        val paatosTietoModifyData =
          HakemusModifyOperationResolver
            .resolvePaatosTietoModifyOperations(currentPaatosTiedot, paatos.paatosTiedot) match {
            case modifyData @ PaatosTietoModifyData(uudet, muutetut, poistetut) => modifyData
            case null                                                           => PaatosTietoModifyData()
          }

        paatosRepository.suoritaPaatosTietojenModifiointi(
          latestSavedPaatos.id.orNull,
          paatosTietoModifyData,
          luojaTaiMuokkaaja
        )

        val newlySavedPaatosTiedot =
          paatosRepository.haePaatosTiedot(latestSavedPaatos.id.orNull)

        try {
          hakemusService.paivitaKasittelyVaiheSisaisesti(hakemusOid, dbHakemus, luojaTaiMuokkaaja)
        } catch {
          case e: Exception =>
            LOG.error(s"Käsittelyvaiheen päivitys epäonnistui: ${e.getMessage}", e)
        }

        Some(
          latestSavedPaatos.copy(
            paatosTietoOptions = paatosTietoOptions,
            paatosTiedot = if (newlySavedPaatosTiedot.nonEmpty) {
              newlySavedPaatosTiedot.map(paatosTieto =>
                paatosTieto.copy(
                  rinnastettavatTutkinnotTaiOpinnot = paatosRepository.haeTutkinnotTaiOpinnot(paatosTieto.id.get),
                  kelpoisuudet = paatosRepository.haeKelpoisuudet(paatosTieto.id.get)
                )
              )
            } else
              latestSavedPaatos.paatosTiedot
          )
        )
      case _ => None
    }
    (currentPaatos, updatedPaatos)
  }

  def generatePaatosTeksti(
    hakemusOid: HakemusOid
  ): String = {
    val hakemus: Hakemus                   = hakemusService.haeHakemus(hakemusOid).get
    val tutkinnot: Seq[Tutkinto]           = tutkintoService.haeTutkinnot(hakemusOid)
    val ataruHakemus: Option[AtaruHakemus] = hakemuspalveluService.haeJaParsiHakemus(hakemusOid).toOption
    val paatos: Paatos                     = haePaatos(hakemusOid).get
    val paatosKieli: String                = {
      findAnswerByAtaruKysymysId(Constants.ATARU_PAATOS_KIELI, ataruHakemus.get.content.answers).getOrElse("fi")
    }
    val hakijanKunta = findSingleStringAnswer("home-town", ataruHakemus.get.content.answers) match {
      case Some(kunta) => kunta
      case None        => "009"
    }
    val hallintoOikeus: HallintoOikeus = hallintoOikeusService.haeHallintoOikeusByKunta(hakijanKunta)
    paatosteksti.generatePaatosTeksti(hakemus, tutkinnot, paatos, paatosKieli, hallintoOikeus, maakoodiService)
  }

  def haePaatosteksti(
    hakemusOid: HakemusOid
  ): (Paatosteksti, Boolean) = {
    paatosRepository.haePaatosteksti(hakemusOid) match {
      case Some(paatosteksti) =>
        val muokkaajaNimi: String = onrService.haeNimi(paatosteksti.muokkaaja)
        (paatosteksti.copy(muokkaaja = Some(muokkaajaNimi)), false)
      case None =>
        hakemusRepository.haeHakemus(hakemusOid) match {
          case Some(hakemus) =>
            (paatosRepository.tallennaUusiPaatosteksti(hakemus.id, generatePaatosTeksti(hakemusOid)), true)
          case None =>
            throw NotFoundException(s"Hakemus $hakemusOid not found")
        }
    }
  }

  def tallennaPaatosteksti(
    hakemusOid: HakemusOid,
    paatostekstiId: UUID,
    paatosteksti: Paatosteksti,
    luojaTaiMuokkaaja: String
  ): (Paatosteksti, Paatosteksti) = {
    val (vanhaPaatosteksti, _) = haePaatosteksti(hakemusOid)
    val uusiPaatosteksti       = paatosRepository.tallennaPaatosteksti(paatostekstiId, paatosteksti, luojaTaiMuokkaaja)
    val muokkaajaNimi: String  = onrService.haeNimi(uusiPaatosteksti.muokkaaja)
    (vanhaPaatosteksti, uusiPaatosteksti.copy(muokkaaja = Some(muokkaajaNimi)))
  }

  def vahvistaPaatosteksti(
    hakemusOid: HakemusOid,
    paatostekstiId: UUID,
    paatosteksti: Paatosteksti,
    luojaTaiMuokkaaja: String
  ): (Paatosteksti, Paatosteksti) = {
    val (vanhaPaatosteksti, _) = haePaatosteksti(hakemusOid)
    val uusiPaatosteksti       = paatosRepository.vahvistaPaatosteksti(paatostekstiId, paatosteksti, luojaTaiMuokkaaja)
    hakemusService.paivitaKasittelyVaiheSisaisesti(hakemusOid, luojaTaiMuokkaaja)
    val muokkaajaNimi: String = onrService.haeNimi(uusiPaatosteksti.muokkaaja)
    (vanhaPaatosteksti, uusiPaatosteksti.copy(muokkaaja = Some(muokkaajaNimi)))
  }
}
