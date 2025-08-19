package fi.oph.tutu.backend.domain

import java.util.UUID

case class Tutkinto(
  id: Option[Int],
  hakemusId: Option[UUID],
  jarjestysNumero: Int,
  nimi: String,
  oppilaitos: String,
  aloitusVuosi: Int,
  paattymisVuosi: Int
)

case class MuuTutkinto(
  id: Option[Int],
  hakemusId: Option[UUID],
  tieto: String,
  huomio: Option[String] = None
)

case class Tutkinnot(
  tutkinto1: Tutkinto,
  tutkinto2: Option[Tutkinto] = None,
  tutkinto3: Option[Tutkinto] = None,
  muuTutkinto: Option[MuuTutkinto] = None
)
