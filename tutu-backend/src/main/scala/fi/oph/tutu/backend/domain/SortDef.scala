package fi.oph.tutu.backend.domain

enum SortDef:
  case Asc, Desc, Undefined

object SortDef:
  def fromString(value: String): SortDef = value.toLowerCase match
    case "asc"  => Asc
    case "desc" => Desc
    case _ => Undefined // TODO: Tässä voisi heittää poikkeuksen, mutta tällä hetkellä Undefined on helpompi käsitellä

  def toSql(sortDef: SortDef): String = sortDef match
    case Asc  => "ASC"
    case Desc => "DESC"
    case _    => throw new IllegalArgumentException(s"Undefined sort definition: $sortDef")

val hakemusKoskeeOrder: Map[Int, Int] = Map(
  0 -> 4, // "tutkinnonTasonRinnakkaistaminen"
  1 -> 0, // "kelpoisuusAmmattiin"
  2 -> 3, // "tutkintoSuoritusRinnakkaistaminen"
  3 -> 2, // "riittavatOpinnot"
  4 -> 1  // "kelpoisuusAmmattiinAPHakemus"
)
