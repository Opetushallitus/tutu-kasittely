package fi.oph.tutu.backend.domain

import java.time.LocalDateTime

case class HakemusListItem(
  hakija: String,
  saapumisPvm: Option[LocalDateTime],
  hakemusOid: String,
  hakemusKoskee: Int,
  esittelijaOid: Option[String] = None,
  asiatunnus: Option[String] = None,
  esittelijaKutsumanimi: String,
  esittelijaSukunimi: String,
  kasittelyVaihe: KasittelyVaihe,
  muokattu: Option[LocalDateTime] = None,
  taydennyspyyntoLahetetty: Option[LocalDateTime] = None,
  ataruHakemustaMuokattu: Option[LocalDateTime] = None,
  apHakemus: Option[Boolean] = None,
  viimeinenAsiakirjaHakijalta: Option[LocalDateTime] = None,
  onkoPeruutettu: Option[Boolean] = None
)
