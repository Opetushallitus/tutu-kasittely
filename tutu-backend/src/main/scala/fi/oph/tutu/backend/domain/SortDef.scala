package fi.oph.tutu.backend.domain

enum SortDef:
  case Asc, Desc, Undefined

object SortDef:
  def fromString(value: String): SortDef = value match
    case "asc"  => Asc
    case "desc" => Desc
    case _      => Undefined

val hakemusKoskeeOrder: Map[Int, Int] = Map(
  0 -> 4, // "tutkinnonTasonRinnakkaistaminen"
  1 -> 0, // "kelpoisuusAmmattiin"
  2 -> 3, // "tutkintoSuoritusRinnakkaistaminen"
  3 -> 2, // "riittavatOpinnot"
  4 -> 1  // "kelpoisuusAmmattiinAPHakemus"
)
