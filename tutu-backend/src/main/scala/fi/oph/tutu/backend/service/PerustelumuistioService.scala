package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.PerusteluRepository
import fi.oph.tutu.backend.service.generator.perustelumuistio.generate as generatePerustelumuistio
import fi.oph.tutu.backend.utils.TutuJsonFormats
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}

import java.util.UUID
import org.springframework.scheduling.annotation.Async
import org.springframework.context.annotation.Lazy
import java.util.concurrent.CompletableFuture

trait IPerustelumuistioService {
  def generoiPerustelumuistioHakemukselle(
    hakemusOid: HakemusOid
  ): Option[String]
  def paivitaPerustelumuistio(
    hakemusOid: HakemusOid,
    muokkaaja: String
  ): CompletableFuture[Option[Perustelumuistio]]
  def paivitaPerustelumuistio(
    hakemusId: UUID,
    muokkaaja: String
  ): CompletableFuture[Option[Perustelumuistio]]
}

@Component
@Service
class PerustelumuistioService(
  @Lazy hakemusService: HakemusService,
  @Lazy tutkintoService: TutkintoService,
  @Lazy perusteluService: PerusteluService,
  @Lazy paatosService: PaatosService,
  perusteluRepository: PerusteluRepository,
  hakemuspalveluService: HakemuspalveluService,
  maakoodiService: MaakoodiService,
  koodistoService: KoodistoService,
  onrService: OnrService,
  translationService: TranslationService
) extends TutuJsonFormats
    with IPerustelumuistioService {
  val LOG: Logger = LoggerFactory.getLogger(classOf[PerusteluService])

  def generoiPerustelumuistioHakemukselle(
    hakemusOid: HakemusOid
  ): Option[String] = {
    val hakemusMaybe: Option[Hakemus]           = hakemusService.haeHakemus(hakemusOid)
    val tutkinnot: Seq[Tutkinto]                = tutkintoService.haeTutkinnot(hakemusOid)
    val ataruHakemusMaybe: Option[AtaruHakemus] = hakemuspalveluService.haeJaParsiHakemus(hakemusOid).toOption
    val perusteluMaybe: Option[Perustelu]       = perusteluService.haePerustelu(hakemusOid)
    val paatosMaybe: Option[Paatos]             = paatosService.haePaatos(hakemusOid)

    val perusteluMuistio = generatePerustelumuistio(
      koodistoService,
      maakoodiService,
      onrService,
      translationService,
      hakemusMaybe,
      tutkinnot,
      ataruHakemusMaybe,
      perusteluMaybe,
      paatosMaybe
    )

    Some(perusteluMuistio)
  }

  @Async
  def paivitaPerustelumuistio(
    hakemusOid: HakemusOid,
    muokkaaja: String
  ): CompletableFuture[Option[Perustelumuistio]] = {
    val result = generoiPerustelumuistioHakemukselle(hakemusOid).map(sisalto => {
      perusteluRepository.haePerustelumuistio(hakemusOid) match {
        case None    => perusteluRepository.lisaaPerustelumuistio(hakemusOid, sisalto, muokkaaja)
        case Some(_) => perusteluRepository.paivitaPerustelumuistio(hakemusOid, sisalto, muokkaaja)
      }
    })
    CompletableFuture.completedFuture(result)
  }

  @Async
  def paivitaPerustelumuistio(
    hakemusId: UUID,
    muokkaaja: String
  ): CompletableFuture[Option[Perustelumuistio]] = {
    hakemusService.hakemusIdToOid(hakemusId) match {
      case Some(hakemusOid) => paivitaPerustelumuistio(hakemusOid, muokkaaja)
      case None             => CompletableFuture.completedFuture(None)
    }
  }
}
