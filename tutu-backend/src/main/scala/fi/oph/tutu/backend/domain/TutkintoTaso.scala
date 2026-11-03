package fi.oph.tutu.backend.domain

enum TutkintoTaso(val numeroKoodi: Int):
  case AlempiKorkeakoulu          extends TutkintoTaso(4)
  case YlempiKorkeakoulu          extends TutkintoTaso(5)
  case AlempiTaiYlempiKorkeakoulu extends TutkintoTaso(-1)

object TutkintoTaso:
  def optionFromString(value: String): Option[TutkintoTaso] = value match
    case "AlempiKorkeakoulu"              => Some(AlempiKorkeakoulu)
    case "YlempiKorkeakoulu"              => Some(YlempiKorkeakoulu)
    case "AlempiTaiYlempiKorkeakoulu"     => Some(AlempiTaiYlempiKorkeakoulu)
    case s if Option(s).forall(_.isBlank) => None
    case _                                => throw new IllegalArgumentException(s"Tuntematon tutkintotaso: $value")
