package fi.oph.tutu.backend.domain

enum Viestityyppi:
  case taydennyspyynto, ennakkotieto, muu

object Viestityyppi:
  def fromString(value: String): Viestityyppi = value match {
    case "taydennyspyynto" => taydennyspyynto
    case "ennakkotieto"    => ennakkotieto
    case "muu"             => muu
    case _                 => null
  }
