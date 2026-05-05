package fi.oph.tutu.backend.domain

enum HakemusNakyma:
  case Perustiedot, Asiakirjat, Tutkinnot, PerusteluYleiset, PerusteluUoRo, PerusteluAp,
    Paatostiedot, YhteinenKasittely, Viestit, Paatosteksti, Kaikki

object HakemusNakyma:
  def fromString(value: String): HakemusNakyma = value match
    case "perustiedot"       => Perustiedot
    case "asiakirjat"        => Asiakirjat
    case "tutkinnot"         => Tutkinnot
    case "perustelu-yleiset" => PerusteluYleiset
    case "perustelu-uoro"    => PerusteluUoRo
    case "perustelu-ap"      => PerusteluAp
    case "paatostiedot"      => Paatostiedot
    case "yhteinenkasittely" => YhteinenKasittely
    case "viestit"           => Viestit
    case "paatosteksti"      => Paatosteksti
    case "kaikki"            => Kaikki
    case _                   => throw new IllegalArgumentException(s"Tuntematon HakemusNakyma: $value")
