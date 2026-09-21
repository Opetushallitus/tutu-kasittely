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
  def haeTutkinnot(hakemusOid: HakemusOid): Seq[Tutkinto] = {
    tutkintoRepository
      .haeTutkinnotHakemusOidilla(hakemusOid)
  }

  def haeTutkinto(tutkintoId: UUID): Option[Tutkinto] = {
    tutkintoRepository
      .haeTutkintoIdlla(tutkintoId)
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
    val poistettuTutkinto = tutkintoRepository.haeTutkintoIdlla(tutkintoId)
    val result            = tutkintoRepository.suoritaPoistaTutkinto(tutkintoId)
    poistettuTutkinto.map(tutkinto => perustelumuistioService.paivitaPerustelumuistio(tutkinto.hakemusId, muokkaaja.s))
    result
  }

  def tallennaTutkinnot(tutkintoModifyData: TutkintoModifyData, luojaTaiMuokkaaja: UserOid): Unit = {
    val poistetutTutkinnot = tutkintoModifyData.poistetut.flatMap(tutkintoRepository.haeTutkintoIdlla)

    tutkintoRepository.suoritaTutkintojenModifiointi(tutkintoModifyData, luojaTaiMuokkaaja.s)

    (tutkintoModifyData.uudet ++ tutkintoModifyData.muutetut ++ poistetutTutkinnot).map(tutkinto =>
      perustelumuistioService.paivitaPerustelumuistio(tutkinto.hakemusId, luojaTaiMuokkaaja.s)
    )
  }

  def paivitaTutkinto(tutkinto: Tutkinto, luojaTaiMuokkaaja: UserOid): Unit = {
    tutkintoRepository.suoritaPaivitaTutkinto(tutkinto, luojaTaiMuokkaaja.s)
    perustelumuistioService.paivitaPerustelumuistio(tutkinto.hakemusId, luojaTaiMuokkaaja.s)
  }
}
