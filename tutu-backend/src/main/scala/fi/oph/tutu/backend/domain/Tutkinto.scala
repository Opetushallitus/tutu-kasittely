package fi.oph.tutu.backend.domain

import java.util.UUID

case class Tutkinto(
  id: Int,
  hakemusId: UUID,
  jarjestysNumero: Int,
  nimi: String,
  oppilaitos: String,
  aloitusVuosi: Int,
  paattymisVuosi: Int
)

case class MuuTutkinto(
  id: Int,
  hakemusId: UUID,
  tieto: String,
  huomio: Option[String] = None
)
