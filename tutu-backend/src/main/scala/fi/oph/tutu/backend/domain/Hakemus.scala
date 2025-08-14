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
    maxLength = 16
  )
  esittelijaId: Option[UUID],
  @(Schema @field)(
    example = "1.2.246.562.24.00000000000000006666",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 40
  )
  esittelijaOid: Option[UserOid],
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
    example = "true",
    defaultValue = "false",
    requiredMode = RequiredMode.REQUIRED
  )
  allekirjoituksetTarkistettu: Boolean,
  @(Schema @field)(
    example = "Allekirjoitukset tarkistettu kopioista",
    requiredMode = RequiredMode.NOT_REQUIRED
  )
  allekirjoituksetTarkistettuLisatiedot: Option[String],
  @(Schema @field)(
    example = "true",
    defaultValue = "false",
    requiredMode = RequiredMode.REQUIRED
  )
  alkuperaisetAsiakirjatSaatuNahtavaksi: Boolean,
  @(Schema @field)(
    example = "Yksipuoliset kopiot. Alkuperäiset kaksipuolisia.",
    requiredMode = RequiredMode.NOT_REQUIRED
  )
  alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot: Option[String],
  @(Schema @field)(
    example = "true",
    requiredMode = RequiredMode.REQUIRED
  )
  selvityksetSaatu: Boolean,
  @(Schema @field)(
    example = "false",
    requiredMode = RequiredMode.NOT_REQUIRED
  )
  imiPyynto: Option[Boolean],
  @(Schema @field)(
    example = "122224",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 255
  )
  imiPyyntoNumero: Option[String],
  @(Schema @field)(
    example = "2025-06-14T10:59:47.597",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 50
  )
  imiPyyntoLahetetty: Option[LocalDateTime],
  @(Schema @field)(
    example = "2025-06-14T10:59:47.597",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 50
  )
  imiPyyntoVastattu: Option[LocalDateTime],
  @(Schema @field)(
    example = "true",
    requiredMode = RequiredMode.NOT_REQUIRED
  )
  apHakemus: Option[Boolean],
  @(Schema @field)(
    example = "false",
    requiredMode = RequiredMode.NOT_REQUIRED
  )
  yhteistutkinto: Option[Boolean]
)

case class Hakemus(
  hakemusOid: String,
  lomakeOid: String,
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
  pyydettavatAsiakirjat: Seq[PyydettavaAsiakirja] = Seq.empty,
  allekirjoituksetTarkistettu: Boolean = false,
  allekirjoituksetTarkistettuLisatiedot: Option[String] = None,
  alkuperaisetAsiakirjatSaatuNahtavaksi: Boolean = false,
  alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot: Option[String] = None,
  selvityksetSaatu: Boolean = false,
  asiakirjamallitTutkinnoista: Map[AsiakirjamalliLahde, AsiakirjamalliTutkinnosta] = Map.empty,
  imiPyynto: ImiPyynto = ImiPyynto(
    imiPyynto = None,
    imiPyyntoNumero = None,
    imiPyyntoLahetetty = None,
    imiPyyntoVastattu = None
  ),
  apHakemus: Option[Boolean] = None,
  yhteistutkinto: Option[Boolean] = None
)

case class PartialHakemus(
  hakemusKoskee: Option[Int] = None,
  asiatunnus: Option[String] = None,
  kirjausPvm: Option[LocalDateTime] = None,
  esittelyPvm: Option[LocalDateTime] = None,
  paatosPvm: Option[LocalDateTime] = None,
  esittelijaOid: Option[String] = None,
  kasittelyVaihe: Option[KasittelyVaihe] = None,
  pyydettavatAsiakirjat: Option[Seq[PyydettavaAsiakirja]] = None,
  allekirjoituksetTarkistettu: Option[Boolean] = None,
  allekirjoituksetTarkistettuLisatiedot: Option[String] = None,
  alkuperaisetAsiakirjatSaatuNahtavaksi: Option[Boolean] = None,
  alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot: Option[String] = None,
  selvityksetSaatu: Option[Boolean] = None,
  asiakirjamallitTutkinnoista: Option[Map[AsiakirjamalliLahde, AsiakirjamalliTutkinnosta]] = None,
  imiPyynto: Option[ImiPyynto] = None,
  apHakemus: Option[Boolean] = None,
  yhteistutkinto: Option[Boolean] = None
)
