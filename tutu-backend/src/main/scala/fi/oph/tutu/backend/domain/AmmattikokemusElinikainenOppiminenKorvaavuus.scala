package fi.oph.tutu.backend.domain

enum AmmattikokemusElinikainenOppiminenKorvaavuus:
  case Taysi, Osittainen, Ei

object AmmattikokemusElinikainenOppiminenKorvaavuus:
  def fromString(value: String): AmmattikokemusElinikainenOppiminenKorvaavuus = value match
    case "Taysi"      => Taysi
    case "Osittainen" => Osittainen
    case "Ei"         => Ei
    case _            => null
