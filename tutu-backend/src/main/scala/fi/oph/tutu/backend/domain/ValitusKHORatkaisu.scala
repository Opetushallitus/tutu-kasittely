package fi.oph.tutu.backend.domain

enum ValitusKHORatkaisu:
  case EiValituslupaa, HakijanVaatimusHylatty, UudelleenOPHKasittelyyn, KhoErilainenPaatos, KhoKasittelyRauennut

object ValitusKHORatkaisu:
  def fromString(value: String): ValitusKHORatkaisu = value match
    case "EiValituslupaa"          => EiValituslupaa
    case "HakijanVaatimusHylatty"  => HakijanVaatimusHylatty
    case "UudelleenOPHKasittelyyn" => UudelleenOPHKasittelyyn
    case "KhoErilainenPaatos"      => KhoErilainenPaatos
    case "KhoKasittelyRauennut"    => KhoKasittelyRauennut
    case _                         => throw new IllegalArgumentException(s"Tuntematon ValitusKHORatkaisu: $value")
