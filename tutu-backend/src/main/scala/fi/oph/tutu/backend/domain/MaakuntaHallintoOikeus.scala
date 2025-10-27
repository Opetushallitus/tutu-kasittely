package fi.oph.tutu.backend.domain

import java.util.UUID
import fi.oph.tutu.backend.utils.TutuJsonFormats

case class MaakuntaHallintoOikeus(
  id: Option[UUID] = None,
  maakuntaKoodi: String,
  hallintoOikeusId: UUID
) extends TutuJsonFormats
