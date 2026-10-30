package fi.oph.tutu.backend.domain

import java.time.LocalDateTime
import java.util.UUID

case class TilastoCsvItem(
  hakemusId: UUID,
  hakemusOid: HakemusOid,
  hakijaOid: PersonOid,
  hyvaksymisPvm: LocalDateTime,
  henkilotunnus: Option[String],
  suoritusMaaKoodiUri: Option[String],
  suoritusPvm: Option[String],
  koulutusAlaKoodiUri: Option[String],
  tutkintoTaso: Option[TutkintoTaso]
)
