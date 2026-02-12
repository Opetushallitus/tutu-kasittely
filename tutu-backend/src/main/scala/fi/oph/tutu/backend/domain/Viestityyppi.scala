package fi.oph.tutu.backend.domain

enum Viestityyppi:
  case taydennyspyynto, ennakkotieto, muu

object Viestityyppi:
  def optionFromString(value: String): Option[Viestityyppi] = value match {
    case "taydennyspyynto"                => Some(taydennyspyynto)
    case "ennakkotieto"                   => Some(ennakkotieto)
    case "muu"                            => Some(muu)
    case s if Option(s).forall(_.isBlank) => None
    case _                                => throw new IllegalArgumentException(s"Tuntematon viestityyppi: $value")
  }
