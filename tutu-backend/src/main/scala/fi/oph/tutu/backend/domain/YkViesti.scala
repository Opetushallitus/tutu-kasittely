package fi.oph.tutu.backend.domain

import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode

import java.time.LocalDateTime
import scala.annotation.meta.field
import java.util.UUID

enum ViestinTila:
  case vastaamatta, vastattu, uusiVastaus

@Schema(name = "YkViesti")
case class DbYkViesti(
  @(Schema @field)(
    example = "de4ffbea-1763-4a43-a24d-50ee48b81ff1",
    requiredMode = RequiredMode.REQUIRED,
    maxLength = 36
  )
  id: UUID,
  @(Schema @field)(
    example = "de4ffbea-1763-4a43-a24d-50ee48b81ff1",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 36
  )
  parent_id: UUID,
  @(Schema @field)(
    example = "1.2.246.562.11.00000000000000006666",
    requiredMode = RequiredMode.REQUIRED,
    maxLength = 40
  )
  hakemusOid: HakemusOid,
  @(Schema @field)(
    example = "OPH-197-2025",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 40
  )
  asiatunnus: Option[String],
  @(Schema @field)(
    example = "de4ffbea-1763-4a43-a24d-50ee48b81ff1",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 36
  )
  lahettaja_oid: Option[UUID],
  @(Schema @field)(
    example = "de4ffbea-1763-4a43-a24d-50ee48b81ff1",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 36
  )
  vastaanottaja_oid: Option[UUID],
  @(Schema @field)(
    example = "2025-06-14T10:59:47.597",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 50
  )
  luotu: Option[LocalDateTime],
  @(Schema @field)(
    example = "2025-06-14T10:59:47.597",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 50
  )
  luettu: Option[LocalDateTime],
  @(Schema @field)(
    example = "Viestin sisältö",
    requiredMode = RequiredMode.NOT_REQUIRED
  )
  viesti: Option[String]
)

case class YkViesti(
  id: UUID,
  parent_id: Option[UUID] = None,
  hakemusOid: HakemusOid,
  asiatunnus: Option[String] = None,
  lahettajaOid: Option[String] = None,
  vastaanottajaOid: Option[String] = None,
  luotu: Option[LocalDateTime] = None,
  luettu: Option[LocalDateTime] = None,
  viesti: Option[String] = None,
  hakija: String
)

case class YkViestiListItem(
  id: UUID,
  parentId: Option[UUID] = None,
  hakemusOid: String,
  asiatunnus: Option[String] = None,
  hakija: String,
  status: ViestinTila,
  lahettajaOid: Option[String] = None,
  vastaanottajaOid: Option[String] = None,
  luotu: Option[LocalDateTime] = None,
  luettu: Option[LocalDateTime] = None,
  viesti: Option[String] = None
)
