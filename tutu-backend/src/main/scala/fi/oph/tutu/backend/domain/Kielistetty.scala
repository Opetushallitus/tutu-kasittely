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

type Kielistetty = Map[Kieli, String]
