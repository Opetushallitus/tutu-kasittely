package fi.oph.tutu.backend.domain

enum Ratkaisutyyppi:
  case Paatos, PeruutusTaiRaukeaminen, Oikaisu, JatetaanTutkimatta, Siirto

object Ratkaisutyyppi:
  def fromString(value: String): Ratkaisutyyppi = value match
    case "Paatos"                 => Paatos
    case "PeruutusTaiRaukeaminen" => PeruutusTaiRaukeaminen
    case "Oikaisu"                => Oikaisu
    case "JatetaanTutkimatta"     => JatetaanTutkimatta
    case "Siirto"                 => Siirto
    case _                        => null
