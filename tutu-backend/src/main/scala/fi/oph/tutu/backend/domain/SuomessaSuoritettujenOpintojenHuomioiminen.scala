package fi.oph.tutu.backend.domain

enum SuomessaSuoritettujenOpintojenHuomioiminen:
  case EiHuomioida, KorvaavatOsittain, KorvaavatKokonaan

object SuomessaSuoritettujenOpintojenHuomioiminen:
  def fromString(value: String): SuomessaSuoritettujenOpintojenHuomioiminen = value match
    case "EiHuomioida"       => EiHuomioida
    case "KorvaavatOsittain" => KorvaavatOsittain
    case "KorvaavatKokonaan" => KorvaavatKokonaan
    case _ => throw new IllegalArgumentException(s"Tuntematon SuomessaSuoritettujenOpintojenHuomioiminen: $value")

  def optionFromString(value: String): Option[SuomessaSuoritettujenOpintojenHuomioiminen] = value match
    case "EiHuomioida"                    => Some(EiHuomioida)
    case "KorvaavatOsittain"              => Some(KorvaavatOsittain)
    case "KorvaavatKokonaan"              => Some(KorvaavatKokonaan)
    case s if Option(s).forall(_.isBlank) => None
    case _ => throw new IllegalArgumentException(s"Tuntematon SuomessaSuoritettujenOpintojenHuomioiminen: $value")
