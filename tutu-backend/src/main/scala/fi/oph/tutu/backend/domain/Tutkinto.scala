package fi.oph.tutu.backend.domain

import java.util.UUID

case class Tutkinto(
  id: Option[UUID],
  hakemusId: UUID,
  jarjestys: String,
  nimi: Option[String],
  oppilaitos: Option[String],
  aloitusVuosi: Option[Int] = None,
  paattymisVuosi: Option[Int] = None,
  muuTutkintoTieto: Option[String] = None
)

case class Tutkinnot(
  tutkinto1: Tutkinto,
  tutkinto2: Option[Tutkinto] = None,
  tutkinto3: Option[Tutkinto] = None,
  muuTutkinto: Option[Tutkinto] = None
)
