package fi.oph.tutu.backend.domain

enum PaatosTyyppi:
  case Taso, Kelpoisuus, TiettyTutkintoTaiOpinnot, RiittavatOpinnot, LopullinenPaatos

object PaatosTyyppi:

  def optionFromString(value: String): Option[PaatosTyyppi] = value match
    case "Taso"                           => Some(Taso)
    case "Kelpoisuus"                     => Some(Kelpoisuus)
    case "TiettyTutkintoTaiOpinnot"       => Some(TiettyTutkintoTaiOpinnot)
    case "RiittavatOpinnot"               => Some(RiittavatOpinnot)
    case "LopullinenPaatos"               => Some(LopullinenPaatos)
    case s if Option(s).forall(_.isBlank) => None
    case _                                => throw new IllegalArgumentException(s"Tuntematon Paatostyyppi: $value")
