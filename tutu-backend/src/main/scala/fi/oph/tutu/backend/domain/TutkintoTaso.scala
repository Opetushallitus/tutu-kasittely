package fi.oph.tutu.backend.domain

enum TutkintoTaso:
  case AlempiKorkeakoulu, YlempiKorkeakoulu

object TutkintoTaso:
  def optionFromString(value: String): Option[TutkintoTaso] = value match
    case "AlempiKorkeakoulu"              => Some(AlempiKorkeakoulu)
    case "YlempiKorkeakoulu"              => Some(YlempiKorkeakoulu)
    case s if Option(s).forall(_.isBlank) => None
    case _                                => throw new IllegalArgumentException(s"Tuntematon tutkintotaso: $value")
