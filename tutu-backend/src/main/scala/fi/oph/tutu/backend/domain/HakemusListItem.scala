package fi.oph.tutu.backend.domain

case class HakemusListItem(
  hakija: String,
  aika: String,
  hakemusOid: String,
  hakemusKoskee: Int,
  esittelijaOid: Option[String],
  asiatunnus: Option[String],
  esittelijaKutsumanimi: String,
  esittelijaSukunimi: String,
  kasittelyVaihe: KasittelyVaihe,
  muokattu: Option[String],
  taydennyspyyntoLahetetty: Option[String],
  apHakemus: Option[Boolean] = None,
  viimeinenAsiakirjaHakijalta: Option[String]
)
