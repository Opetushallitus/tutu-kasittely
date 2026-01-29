package fi.oph.tutu.backend.domain

enum PaatosTyyppi:
  case Taso, Kelpoisuus, TiettyTutkintoTaiOpinnot, RiittavatOpinnot

object PaatosTyyppi:
  def fromString(value: String): PaatosTyyppi = value match
    case "Taso"                     => Taso
    case "Kelpoisuus"               => Kelpoisuus
    case "TiettyTutkintoTaiOpinnot" => TiettyTutkintoTaiOpinnot
    case "RiittavatOpinnot"         => RiittavatOpinnot
    case _                          => null
