package fi.oph.tutu.backend.domain

import fi.oph.tutu.backend.utils.Constants.HAKEMUS_KOSKEE_LOPULLINEN_PAATOS
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode

import scala.annotation.meta.field
import scala.beans.BeanProperty

case class UusiAtaruHakemus(
  @(Schema @field)(
    example = "1.2.246.562.11.00000000000000006666",
    requiredMode = RequiredMode.REQUIRED,
    maxLength = 40
  )
  hakemusOid: HakemusOid,
  @(Schema @field)(
    example = "0",
    requiredMode = RequiredMode.REQUIRED
  )
  hakemusKoskee: Int
) {
  def onLopullinenPaatos: Boolean = hakemusKoskee == HAKEMUS_KOSKEE_LOPULLINEN_PAATOS
}
