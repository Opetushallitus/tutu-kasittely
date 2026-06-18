package fi.oph.tutu.backend.domain

enum Kieli:
  case fi, sv, en

object Kieli:
  def fromString(value: String): Kieli = value match {
    case "fi"      => fi
    case "sv"      => sv
    case "en"      => en
    case "finnish" => fi // Ataru käyttää kielinä pitkiä muotoja
    case "swedish" => sv
    case "english" => en
    case _         => throw new IllegalArgumentException(s"Tuntematon kieli: $value")
  }

  def optionFromString(value: String): Option[Kieli] =
    if (Option(value).forall(_.isBlank)) None else Some(fromString(value))

  def fiOrSvFromString(value: String): Option[Kieli] =
    if (Option(value).forall(_.isBlank)) None
    else
      fromString(value) match {
        case fi => Some(fi)
        case sv => Some(sv)
        case _ => throw new IllegalArgumentException(s"Virheellinen kieli: '$value', ainaostaan 'fi' tai 'sv' sallittu")
      }

type Kielistetty = Map[Kieli, String]
