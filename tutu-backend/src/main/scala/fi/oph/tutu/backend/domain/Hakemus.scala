package fi.oph.tutu.backend.domain

import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode

import java.time.LocalDateTime
import java.util.UUID
import scala.annotation.meta.field
import scala.beans.BeanProperty

@Schema(name = "Hakemus")
case class DbHakemus(
  @(Schema @field)(
    example = "1.2.246.562.11.00000000000000006666",
    requiredMode = RequiredMode.REQUIRED,
    maxLength = 40
  )
  hakemusOid: HakemusOid,
  @(Schema @field)(
    example = "1",
    requiredMode = RequiredMode.REQUIRED,
    maxLength = 4
  )
  hakemusKoskee: Int,
  @(Schema @field)(
    example = "de4ffbea-1763-4a43-a24d-50ee48b81ff1",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 16
  )
  esittelijaId: Option[UUID],
  @(Schema @field)(
    example = "1.2.246.562.24.00000000000000006666",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 40
  )
  @BeanProperty esittelijaOid: Option[UserOid],
  @(Schema @field)(
    example = "OPH-197-2025",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 40
  )
  asiatunnus: Option[String],
  @(Schema @field)(
    example = "AlkukasittelyKesken",
    requiredMode = RequiredMode.REQUIRED,
    maxLength = 50
  )
  kasittelyVaihe: KasittelyVaihe
)

case class Hakemus(
  hakemusOid: String,
  hakijanEtunimet: String,
  hakijanSukunimi: String,
  hakijanHetu: Option[String] = None,
  hakemusKoskee: Int,
  asiatunnus: Option[String] = None,
  kirjausPvm: Option[LocalDateTime] = None,
  esittelyPvm: Option[LocalDateTime] = None,
  paatosPvm: Option[LocalDateTime] = None,
  esittelijaOid: Option[String] = None,
  ataruHakemuksenTila: AtaruHakemuksenTila,
  kasittelyVaihe: KasittelyVaihe
)

case class PartialHakemus(
  hakemusKoskee: Option[Int] = None,
  asiatunnus: Option[String] = None,
  kirjausPvm: Option[LocalDateTime] = None,
  esittelyPvm: Option[LocalDateTime] = None,
  paatosPvm: Option[LocalDateTime] = None,
  esittelijaOid: Option[String] = None,
  kasittelyVaihe: Option[KasittelyVaihe] = None
)
