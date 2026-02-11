package fi.oph.tutu.backend.domain

enum Kieli:
  case fi, sv, en

object Kieli:
  def fromString(value: String): Kieli = value match {
    case "fi" => fi
    case "sv" => sv
    case "en" => en
    case _    => null
  }

type Kielistetty = Map[Kieli, String]
