package fi.oph.tutu.backend.domain

enum SortDef:
  case Asc, Desc, Undefined

object SortDef:
  def fromString(value: String): SortDef = value match
    case "asc"  => Asc
    case "desc" => Desc
    case _      => Undefined
