package fi.oph.tutu.backend.domain

enum TutkintoTaso:
  case AlempiKorkeakoulu, YlempiKorkeakoulu;

object TutkintoTaso:
  def fromString(value: String): TutkintoTaso = value match
    case "AlempiKorkeakoulu" => AlempiKorkeakoulu
    case "YlempiKorkeakoulu" => YlempiKorkeakoulu
    case _                   => null
