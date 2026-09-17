package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{HakemusOid, Tutkinto, TutkintoModifyData, UserOid}
import fi.oph.tutu.backend.repository.TutkintoRepository
import org.springframework.stereotype.{Component, Service}

import java.util.UUID

@Component
@Service
class TutkintoService(
  tutkintoRepository: TutkintoRepository,
  perustelumuistioService: IPerustelumuistioService,
  esittelijaService: EsittelijaService
) {
  private def haeMuokkaajaNimi(tutkinto: Tutkinto): Tutkinto = {
    tutkinto.copy(
      muokkaaja = tutkinto.muokkaaja.flatMap(esittelijaService.haeEsittelijaNimi)
    )
  }

  def haeTutkinnot(hakemusOid: HakemusOid): Seq[Tutkinto] = {
    tutkintoRepository
      .haeTutkinnotHakemusOidilla(hakemusOid)
      .map(haeMuokkaajaNimi)
  }

  def haeTutkinto(tutkintoId: UUID): Option[Tutkinto] = {
    tutkintoRepository
      .haeTutkintoIdlla(tutkintoId)
      .map(haeMuokkaajaNimi)
  }

  def lisaaTutkinnot(tutkinnot: Seq[Tutkinto], luoja: String): Seq[Int] = {
    val results = tutkinnot.map(tutkinto => tutkintoRepository.suoritaLisaaTutkinto(tutkinto, luoja))
    tutkinnot.foreach(tutkinto => perustelumuistioService.paivitaPerustelumuistio(tutkinto.hakemusId, luoja))
    results
  }

  def lisaaTutkinto(tutkinto: Tutkinto, luoja: String): Int = {
    lisaaTutkinnot(Seq(tutkinto), luoja).head
  }

  def poistaTutkinto(tutkintoId: UUID, muokkaaja: UserOid): Int = {
    val muokkaajaNimi     = esittelijaService.haeEsittelijaNimi(muokkaaja.s).getOrElse(muokkaaja.s)
    val poistettuTutkinto = tutkintoRepository.haeTutkintoIdlla(tutkintoId)
    val result            = tutkintoRepository.suoritaPoistaTutkinto(tutkintoId)
    poistettuTutkinto.map(tutkinto =>
      perustelumuistioService.paivitaPerustelumuistio(tutkinto.hakemusId, muokkaajaNimi)
    )
    result
  }

  def tallennaTutkinnot(tutkintoModifyData: TutkintoModifyData, luojaTaiMuokkaaja: UserOid): Unit = {
    val luojaTaiMuokkaajaNimi = esittelijaService.haeEsittelijaNimi(luojaTaiMuokkaaja.s).getOrElse(luojaTaiMuokkaaja.s)
    val poistetutTutkinnot    = tutkintoModifyData.poistetut.flatMap(tutkintoRepository.haeTutkintoIdlla)

    val result = tutkintoRepository.suoritaTutkintojenModifiointi(tutkintoModifyData, luojaTaiMuokkaajaNimi)

    (tutkintoModifyData.uudet ++ tutkintoModifyData.muutetut ++ poistetutTutkinnot).map(tutkinto =>
      perustelumuistioService.paivitaPerustelumuistio(tutkinto.hakemusId, luojaTaiMuokkaajaNimi)
    )

    result
  }

  def paivitaTutkinto(tutkinto: Tutkinto, luojaTaiMuokkaaja: UserOid): Unit = {
    val luojaTaiMuokkaajaNimi = esittelijaService.haeEsittelijaNimi(luojaTaiMuokkaaja.s).getOrElse(luojaTaiMuokkaaja.s)
    tutkintoRepository.suoritaPaivitaTutkinto(tutkinto, luojaTaiMuokkaajaNimi)
    perustelumuistioService.paivitaPerustelumuistio(tutkinto.hakemusId, luojaTaiMuokkaajaNimi)
  }
}
