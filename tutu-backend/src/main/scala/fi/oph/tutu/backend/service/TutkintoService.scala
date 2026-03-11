package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{HakemusOid, Tutkinto, TutkintoModifyData, UserOid}
import fi.oph.tutu.backend.repository.TutkintoRepository
import org.springframework.stereotype.{Component, Service}

import java.util.UUID

@Component
@Service
class TutkintoService(
  tutkintoRepository: TutkintoRepository,
  onrService: OnrService
) {
  def haeTutkinnot(hakemusOid: HakemusOid): Seq[Tutkinto] = {
    tutkintoRepository
      .haeTutkinnotHakemusOidilla(hakemusOid)
      .map((tutkinto: Tutkinto) =>
        tutkinto.copy(
          muokkaaja = onrService.haeNimiOption(tutkinto.muokkaaja)
        )
      )
  }

  def haeTutkinto(tutkintoId: UUID): Option[Tutkinto] = {
    tutkintoRepository
      .haeTutkintoIdlla(tutkintoId)
      .map((tutkinto: Tutkinto) =>
        tutkinto.copy(
          muokkaaja = onrService.haeNimiOption(tutkinto.muokkaaja)
        )
      )
  }

  def lisaaTutkinto(tutkinto: Tutkinto, luoja: String): Int = {
    tutkintoRepository.suoritaLisaaTutkinto(tutkinto, luoja)
  }

  def poistaTutkinto(tutkintoId: UUID): Int = {
    tutkintoRepository.suoritaPoistaTutkinto(tutkintoId)
  }

  def tallennaTutkinnot(tutkintoModifyData: TutkintoModifyData, luojaTaiMuokkaaja: UserOid): Unit = {
    tutkintoRepository.suoritaTutkintojenModifiointi(tutkintoModifyData, luojaTaiMuokkaaja)
  }

  def paivitaTutkinto(tutkinto: Tutkinto, luojaTaiMuokkaaja: UserOid): Unit = {
    tutkintoRepository.suoritaPaivitaTutkinto(tutkinto, luojaTaiMuokkaaja.toString)
  }
}
