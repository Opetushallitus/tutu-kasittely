package fi.oph.tutu.backend.domain

import java.util.UUID

case class Maakoodi(
  id: UUID,
  esittelijaId: Option[UUID],
  koodiUri: String,
  nimi: String
)
