package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{HakemusOid, Tutkinto, TutkintoModifyData, UserOid}
import fi.oph.tutu.backend.repository.TutkintoRepository
import org.springframework.stereotype.{Component, Service}

import java.util.UUID

@Component
@Service
class TutkintoService(
  tutkintoRepository: TutkintoRepository
) {
  def haeTutkinnot(hakemusOid: HakemusOid): Seq[Tutkinto] = {
    tutkintoRepository.haeTutkinnotHakemusOidilla(hakemusOid)
  }

  def tallennaTutkinto(tutkinto: Tutkinto, luoja: String): Int = {
    tutkintoRepository.suoritaLisaaTutkinto(tutkinto, luoja)
  }

  def poistaTutkinto(tutkintoId: UUID): Int = {
    tutkintoRepository.suoritaPoistaTutkinto(tutkintoId)
  }

  def tallennaTutkinnot(tutkintoModifyData: TutkintoModifyData, luojaTaiMuokkaaja: UserOid): Unit = {
    tutkintoRepository.suoritaTutkintojenModifiointi(tutkintoModifyData, luojaTaiMuokkaaja)
  }
}
