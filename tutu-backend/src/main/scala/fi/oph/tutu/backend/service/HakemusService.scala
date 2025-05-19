package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.AtaruHakemus
import fi.oph.tutu.backend.repository.HakemusRepository
import org.springframework.stereotype.{Component, Service}

import java.util.UUID

@Component
@Service
class HakemusService(hakemusRepository: HakemusRepository) {
  // TODO: Tee EsittelijaRepository ja hae sieltä hakemus.maakoodi:lla esittelijä, jos ei löydy niin tallennetaan ilman esittelijää.
  def tallennaHakemus(hakemus: AtaruHakemus): UUID =
    hakemusRepository.tallennaHakemus(hakemus.hakemusOid, hakemus.syykoodi, "Hakemuspalvelu")
}
