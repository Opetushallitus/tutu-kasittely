package fi.oph.tutu.backend.domain

import fi.oph.tutu.backend.utils.Utility.toLocalDateTime
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode

import java.time.LocalDateTime
import scala.annotation.meta.field

case class AtaruTilaPaivitys(
  @(Schema @field)(
    example = "TaydennysPyynto",
    requiredMode = RequiredMode.REQUIRED
  )
  tila: AtaruHakemuksenTila,
  @(Schema @field)(
    example = "2026-09-09T10:59:47.597Z",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 50
  )
  timestamp: Option[LocalDateTime],
  @(Schema @field)(
    example = "2026-09-09T10:59:47.597Z",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 50
  )
  submitted: LocalDateTime,
  @(Schema @field)(
    example = "2026-09-09T10:59:47.597Z",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 50
  )
  latestVersionCreated: LocalDateTime
) {
  def this(ataruHakemus: AtaruHakemus) = this(
    tila = ataruHakemus.hakemuksenTila(),
    timestamp = ataruHakemus.`information-request-timestamp`.map(toLocalDateTime),
    submitted = toLocalDateTime(ataruHakemus.submitted),
    latestVersionCreated = toLocalDateTime(ataruHakemus.latestVersionCreated)
  )
}
