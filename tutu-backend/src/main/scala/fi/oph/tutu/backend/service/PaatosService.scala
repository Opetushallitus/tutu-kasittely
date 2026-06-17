package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.{HakemusRepository, PaatosRepository}
import fi.oph.tutu.backend.service.generator.paatosteksti.PaatosTekstiGenerator
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
  onrService: OnrService,
  perustelumuistioService: IPerustelumuistioService,
  paatosTekstiGenerator: PaatosTekstiGenerator
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
              val paatostiedotWithMuokkaaja = paatostiedot.map { paatosTieto =>
                paatosTieto.copy(
                  muokkaaja = onrService.haeNimiOption(paatosTieto.muokkaaja)
                )
              }
              val paatostiedotWithRinnastettavatTutkinnotTaiOpinnot = paatostiedotWithMuokkaaja.map { paatosTieto =>
                paatosRepository.haeTutkinnotTaiOpinnot(paatosTieto.id.get) match {
                  case tutkinnotTaiOpinnot if tutkinnotTaiOpinnot.nonEmpty =>
                    paatosTieto.copy(
                      rinnastettavatTutkinnotTaiOpinnot = tutkinnotTaiOpinnot.map { tutkintoTaiOpinto =>
                        tutkintoTaiOpinto.copy(muokkaaja = onrService.haeNimiOption(tutkintoTaiOpinto.muokkaaja))
                      }
                    )
                  case _ => paatosTieto
                }
              }
              val paatostiedotWithAllData = paatostiedotWithRinnastettavatTutkinnotTaiOpinnot.map { paatosTieto =>
                paatosRepository.haeKelpoisuudet(paatosTieto.id.get) match {
                  case kelpoisuudet if kelpoisuudet.nonEmpty =>
                    paatosTieto.copy(
                      kelpoisuudet = kelpoisuudet.map { kelpoisuus =>
                        kelpoisuus.copy(muokkaaja = onrService.haeNimiOption(kelpoisuus.muokkaaja))
                      }
                    )
                  case _ => paatosTieto
                }
              }
              Some(
                paatos.copy(
                  paatosTiedot = paatostiedotWithAllData,
                  paatosTietoOptions = paatosTietoOptions,
                  muokkaaja = onrService.haeNimiOption(paatos.muokkaaja)
                )
              )
            case _ =>
              Some(
                paatos.copy(
                  paatosTietoOptions = paatosTietoOptions,
                  muokkaaja = onrService.haeNimiOption(paatos.muokkaaja)
                )
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
            } else {
              latestSavedPaatos.paatosTiedot
            },
            muokkaaja = onrService.haeNimiOption(latestSavedPaatos.muokkaaja)
          )
        )
      case _ => None
    }
    perustelumuistioService.paivitaPerustelumuistio(hakemusOid, luojaTaiMuokkaaja)
    (currentPaatos, updatedPaatos)
  }

  def generatePaatosTeksti(
    hakemusOid: HakemusOid
  ): (String, Kieli) = {
    val ataruHakemus = hakemuspalveluService.haeJaParsiHakemus(hakemusOid) match {
      case Right(ataruHakemus) => ataruHakemus
      case Left(error)         =>
        LOG.error(s"Ataru-hakemuksen $hakemusOid haku epäonnistui: ${error.getMessage}")
        throw error
    }
    val hakemus: Hakemus         = hakemusService.haeHakemus(hakemusOid).get
    val tutkinnot: Seq[Tutkinto] = tutkintoService.haeTutkinnot(hakemusOid)
    val paatos: Paatos           = haePaatos(hakemusOid).get
    val paatosKieli: Kieli       =
      findAnswerByAtaruKysymysId(Constants.ATARU_PAATOS_KIELI, ataruHakemus.content.answers)
        .flatMap(Kieli.fiOrSvFromString)
        .getOrElse(Kieli.fi)
    val hakijanKunta = findSingleStringAnswer("home-town", ataruHakemus.content.answers) match {
      case Some(kunta) => kunta
      case None        => "009"
    }
    val hallintoOikeus: HallintoOikeus = hallintoOikeusService.haeHallintoOikeusByKunta(hakijanKunta)
    (
      this.paatosTekstiGenerator.generatePaatosTeksti(
        hakemus,
        tutkinnot,
        paatos,
        paatosKieli,
        hallintoOikeus,
        maakoodiService
      ),
      paatosKieli
    )
  }

  private def haeHakemus(hakemusOid: HakemusOid): DbHakemus =
    hakemusRepository.haeHakemus(hakemusOid) match {
      case Some(dbHakemus) => dbHakemus
      case _               => throw NotFoundException(s"Hakemusta $hakemusOid ei löydy")
    }

  private def haeAiempiPaatosteksti(hakemusId: UUID): Option[Paatosteksti] =
    paatosRepository.haePaatosteksti(hakemusId) match {
      case Some(paatosteksti) => Some(paatosteksti)
      case None               => throw NotFoundException(s"Hakemukselle $hakemusId ei löydy aiempaa päätöstekstiä")
    }

  private def haeMuokkaajaNimi(paatosteksti: Paatosteksti): Paatosteksti = {
    val muokkaajaNimi = onrService.haeNimi(paatosteksti.muokkaaja)
    paatosteksti.copy(muokkaaja = Some(onrService.haeNimi(paatosteksti.muokkaaja)))
  }

  def haeTaiGeneroiPaatosteksti(
    hakemusOid: HakemusOid,
    luoja: String
  ): Paatosteksti = {
    val dbHakemus = haeHakemus(hakemusOid)
    paatosRepository.haePaatosteksti(dbHakemus.id) match {
      case Some(paatosteksti) => haeMuokkaajaNimi(paatosteksti)
      case None               =>
        val paatosTekstiJaKieli = generatePaatosTeksti(hakemusOid)
        Paatosteksti(
          hakemusId = dbHakemus.id,
          sisalto = paatosTekstiJaKieli._1,
          kieli = Some(paatosTekstiJaKieli._2)
        )
    }
  }

  def tallennaPaatosteksti(
    hakemusOid: HakemusOid,
    paatosteksti: Paatosteksti,
    luojaTaiMuokkaaja: String
  ): (Option[Paatosteksti], Paatosteksti) = {
    val dbHakemus = haeHakemus(hakemusOid)
    paatosteksti.id match {
      case Some(id) =>
        val uusiPaatosteksti = paatosRepository.tallennaPaatosteksti(id, paatosteksti, luojaTaiMuokkaaja)
        (haeAiempiPaatosteksti(dbHakemus.id), haeMuokkaajaNimi(uusiPaatosteksti))

      case _ =>
        val uusiPaatosteksti =
          paatosRepository.tallennaUusiPaatosteksti(
            dbHakemus.id,
            paatosteksti.sisalto,
            paatosteksti.kieli,
            luojaTaiMuokkaaja
          )
        (None, uusiPaatosteksti)
    }
  }

  def vahvistaPaatosteksti(
    hakemusOid: HakemusOid,
    paatosteksti: Paatosteksti,
    luojaTaiMuokkaaja: String
  ): (Option[Paatosteksti], Paatosteksti) = {
    val dbHakemus                             = haeHakemus(hakemusOid)
    val (vanhaPaatosteksti, uusiPaatosteksti) = paatosteksti.id match {
      case Some(id) =>
        val uusiPaatosteksti = paatosRepository.vahvistaPaatosteksti(id, paatosteksti, luojaTaiMuokkaaja)
        (haeAiempiPaatosteksti(dbHakemus.id), haeMuokkaajaNimi(uusiPaatosteksti))

      case _ =>
        val uusiPaatosteksti =
          paatosRepository.tallennaUusiPaatosteksti(
            dbHakemus.id,
            paatosteksti.sisalto,
            paatosteksti.kieli,
            luojaTaiMuokkaaja,
            true
          )
        (None, uusiPaatosteksti)
    }
    hakemusService.paivitaKasittelyVaiheSisaisesti(hakemusOid, luojaTaiMuokkaaja)
    (vanhaPaatosteksti, uusiPaatosteksti)
  }
}
