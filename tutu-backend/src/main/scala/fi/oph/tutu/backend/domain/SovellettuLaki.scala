package fi.oph.tutu.backend.domain

enum SovellettuLaki:
  case uo, ap, ap_seut, ro

object SovellettuLaki:
  def fromString(value: String): SovellettuLaki = value match
    case "uo"      => uo
    case "ap"      => ap
    case "ap_seut" => ap_seut
    case "ro"      => ro
    case _         => null
