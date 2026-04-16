package fi.oph.tutu.backend.domain

enum OletusSisaltoTyyppi:
  case taydennyspyynto, ennakkotieto, muuViesti, Undefined

object OletusSisaltoTyyppi:
  def fromString(value: String): OletusSisaltoTyyppi = value.toLowerCase match
    case "taydennyspyynto" => taydennyspyynto
    case "ennakkotieto"    => ennakkotieto
    case "muu"             => muuViesti
    case _                 => throw new IllegalArgumentException(s"Tuntematon sisältötyyppi: $value")
