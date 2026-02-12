package fi.oph.tutu.backend.domain

enum SovellettuLaki:
  case uo, ap, ap_seut, ro

object SovellettuLaki:
  def optionFromString(value: String): Option[SovellettuLaki] = value match
    case "uo"                             => Some(uo)
    case "ap"                             => Some(ap)
    case "ap_seut"                        => Some(ap_seut)
    case "ro"                             => Some(ro)
    case s if Option(s).forall(_.isBlank) => None
    case _                                => throw new IllegalArgumentException(s"Tuntematon sovellettulaki: $value")
