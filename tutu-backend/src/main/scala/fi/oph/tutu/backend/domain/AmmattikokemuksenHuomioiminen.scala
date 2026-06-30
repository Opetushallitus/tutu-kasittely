package fi.oph.tutu.backend.domain

enum AmmattikokemuksenHuomioiminen:
  case SuomessaHankittuKokonaan, SuomessaHankittuOsittain, UlkomaillaHankittuKokonaan, UlkomaillaHankittuOsittain,
    SuomessaJaUlkomaillaHankittuKokonaan, SuomessaJaUlkomaillaHankittuOsittain,
    EiHuomioida

object AmmattikokemuksenHuomioiminen:
  def fromString(value: String): AmmattikokemuksenHuomioiminen = value match
    case "SuomessaHankittuKokonaan"             => SuomessaHankittuKokonaan
    case "SuomessaHankittuOsittain"             => SuomessaHankittuOsittain
    case "UlkomaillaHankittuKokonaan"           => UlkomaillaHankittuKokonaan
    case "UlkomaillaHankittuOsittain"           => UlkomaillaHankittuOsittain
    case "SuomessaJaUlkomaillaHankittuKokonaan" => SuomessaJaUlkomaillaHankittuKokonaan
    case "SuomessaJaUlkomaillaHankittuOsittain" => SuomessaJaUlkomaillaHankittuOsittain
    case "EiHuomioida"                          => EiHuomioida
    case _ => throw new IllegalArgumentException(s"Tuntematon AmmattikokemuksenHuomioiminen: $value")

  def optionFromString(value: String): Option[AmmattikokemuksenHuomioiminen] = value match
    case "SuomessaHankittuKokonaan"             => Some(SuomessaHankittuKokonaan)
    case "SuomessaHankittuOsittain"             => Some(SuomessaHankittuOsittain)
    case "UlkomaillaHankittuKokonaan"           => Some(UlkomaillaHankittuKokonaan)
    case "UlkomaillaHankittuOsittain"           => Some(UlkomaillaHankittuOsittain)
    case "SuomessaJaUlkomaillaHankittuKokonaan" => Some(SuomessaJaUlkomaillaHankittuKokonaan)
    case "SuomessaJaUlkomaillaHankittuOsittain" => Some(SuomessaJaUlkomaillaHankittuOsittain)
    case "EiHuomioida"                          => Some(EiHuomioida)
    case s if Option(s).forall(_.isBlank)       => None
    case _ => throw new IllegalArgumentException(s"Tuntematon AmmattikokemuksenHuomioiminen: $value")
