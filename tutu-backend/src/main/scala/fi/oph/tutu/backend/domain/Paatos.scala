package fi.oph.tutu.backend.domain

import java.time.LocalDateTime
import java.util.UUID

case class Paatos(
  id: Option[UUID] = None,
  hakemusId: Option[UUID] = None,
  ratkaisutyyppi: Option[Ratkaisutyyppi] = None,
  seutArviointi: Boolean = false,
  luotu: Option[LocalDateTime] = None,
  luoja: Option[String] = None,
  muokattu: Option[LocalDateTime] = None,
  muokkaaja: Option[String] = None
) {
  def mergeWith(partial: PartialPaatos): Paatos =
    this.copy(
      ratkaisutyyppi = partial.ratkaisutyyppi.orElse(this.ratkaisutyyppi),
      seutArviointi = partial.seutArviointi.getOrElse(this.seutArviointi)
    )
}

case class PartialPaatos(
  ratkaisutyyppi: Option[Ratkaisutyyppi] = None,
  seutArviointi: Option[Boolean] = None
)
