package fi.oph.tutu.backend.domain

enum ValitusHaORatkaisu {
  case VaatimusHylatty, UudelleenKasittely, ErilainenPaatos, KasittelyRauennut
}

object ValitusHaORatkaisu:
  def fromString(value: String): ValitusHaORatkaisu = value match
    case "VaatimusHylatty"    => VaatimusHylatty
    case "UudelleenKasittely" => UudelleenKasittely
    case "ErilainenPaatos"    => ErilainenPaatos
    case "KasittelyRauennut"  => KasittelyRauennut
    case _                    => throw new IllegalArgumentException(s"Tuntematon HaORatkaisu: $value")
