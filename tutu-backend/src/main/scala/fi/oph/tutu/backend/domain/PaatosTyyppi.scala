package fi.oph.tutu.backend.domain

enum PaatosTyyppi:
  case Myonteinen, Kielteinen

object PaatosTyyppi:
  def fromString(value: String): PaatosTyyppi = value match
    case "Myönteinen" => Myonteinen
    case "Kielteinen" => Kielteinen
    case _            => throw new IllegalArgumentException(s"Tuntematon päätöstyyppi: $value")
