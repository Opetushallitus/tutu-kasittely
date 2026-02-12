package fi.oph.tutu.backend.domain

enum Kieli:
  case fi, sv, en

object Kieli:
  def optionFromString(value: String): Option[Kieli] = value match {
    case "fi"                             => Some(fi)
    case "sv"                             => Some(sv)
    case "en"                             => Some(en)
    case s if Option(s).forall(_.isBlank) => None
    case _                                => throw new IllegalArgumentException(s"Tuntematon kieli: $value")
  }

type Kielistetty = Map[Kieli, String]
