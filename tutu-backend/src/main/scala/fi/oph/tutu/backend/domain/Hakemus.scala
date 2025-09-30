package fi.oph.tutu.backend.domain

import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode

import java.time.LocalDateTime
import java.util.UUID
import scala.annotation.meta.field

@Schema(name = "Hakemus")
case class DbHakemus(
  @(Schema @field)(
    example = "de4ffbea-1763-4a43-a24d-50ee48b81ff1",
    requiredMode = RequiredMode.REQUIRED,
    maxLength = 36
  )
  id: UUID,
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
    maxLength = 36
  )
  esittelijaId: Option[UUID],
  @(Schema @field)(
    example = "1.2.246.562.24.00000000000000006666",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 40
  )
  esittelijaOid: Option[UserOid],
  @(Schema @field)(
    example = "de4ffbea-1763-4a43-a24d-50ee48b81ff1",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 36
  )
  asiakirjaId: Option[UUID],
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
  kasittelyVaihe: KasittelyVaihe,
  @(Schema @field)(
    example = "2025-06-14T10:59:47.597",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 50
  )
  muokattu: Option[LocalDateTime],
  @(Schema @field)(
    example = "false",
    requiredMode = RequiredMode.NOT_REQUIRED
  )
  yhteistutkinto: Boolean
)

case class Hakemus(
  hakemusOid: String,
  lomakeOid: String,
  lomakkeenKieli: String,
  hakija: Hakija,
  sisalto: Seq[SisaltoItem],
  liitteidenTilat: Seq[AttachmentReview],
  hakemusKoskee: Int,
  asiatunnus: Option[String] = None,
  kirjausPvm: Option[LocalDateTime] = None,
  esittelyPvm: Option[LocalDateTime] = None,
  paatosPvm: Option[LocalDateTime] = None,
  esittelijaOid: Option[String] = None,
  ataruHakemuksenTila: AtaruHakemuksenTila,
  kasittelyVaihe: KasittelyVaihe,
  muokattu: Option[LocalDateTime] = None,
  muutosHistoria: Seq[MuutosHistoriaItem] = Seq.empty,
  taydennyspyyntoLahetetty: Option[LocalDateTime] = None,
  yhteistutkinto: Boolean = false,
  tutkinnot: Seq[Tutkinto] = Seq.empty,
  asiakirja: Option[Asiakirja] = None
)

case class PartialHakemus(
  hakemusKoskee: Option[Int] = None,
  asiatunnus: Option[String] = None,
  kirjausPvm: Option[LocalDateTime] = None,
  esittelyPvm: Option[LocalDateTime] = None,
  paatosPvm: Option[LocalDateTime] = None,
  esittelijaOid: Option[String] = None,
  kasittelyVaihe: Option[KasittelyVaihe] = None,
  yhteistutkinto: Option[Boolean] = None,
  tutkinnot: Option[Seq[Tutkinto]] = None,
  asiakirja: Option[PartialAsiakirja] = None
)
