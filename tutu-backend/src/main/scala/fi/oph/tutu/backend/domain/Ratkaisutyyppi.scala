package fi.oph.tutu.backend.domain

enum Ratkaisutyyppi:
  case Paatos, PeruutusTaiRaukeaminen, Oikaisu, JatetaanTutkimatta, Siirto

object Ratkaisutyyppi:
  def optionFromString(value: String): Option[Ratkaisutyyppi] = value match
    case "Paatos"                         => Some(Paatos)
    case "PeruutusTaiRaukeaminen"         => Some(PeruutusTaiRaukeaminen)
    case "Oikaisu"                        => Some(Oikaisu)
    case "JatetaanTutkimatta"             => Some(JatetaanTutkimatta)
    case "Siirto"                         => Some(Siirto)
    case s if Option(s).forall(_.isBlank) => None
    case _                                => throw new IllegalArgumentException(s"Tuntematon ratkaisutyyppi: $value")
