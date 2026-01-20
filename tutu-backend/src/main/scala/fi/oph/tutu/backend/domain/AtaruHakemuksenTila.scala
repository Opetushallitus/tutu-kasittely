package fi.oph.tutu.backend.domain

// TaydennysPyyntoVastattu tilaa ei varsinaisesti löydy Atarusta, ko. tila päätellään TUTUssa sisäisesti
enum AtaruHakemuksenTila:
  case Kasittelematta, Kasittelyssa, KutsuttuHaastatteluun, KutsuttuValintaKokeeseen, Arvioinnissa, Valintaesitys,
    Kasitelty,
    TaydennysPyynto, TaydennysPyyntoVastattu, KasittelyMaksamatta, KasittelyMaksettu, PaatosMaksuAvoin,
    PaatosMaksamatta,
    PaatosMaksettu, Laskutuksessa

object AtaruHakemuksenTila {
  val UNDEFINED                                      = "unprocessed"
  def fromString(value: String): AtaruHakemuksenTila = value match
    case "unprocessed"              => Kasittelematta
    case "processing"               => Kasittelyssa
    case "invited-to-interview"     => KutsuttuHaastatteluun
    case "invited-to-exam"          => KutsuttuValintaKokeeseen
    case "evaluating"               => Arvioinnissa
    case "valintaesitys"            => Valintaesitys
    case "processed"                => Kasitelty
    case "information-request"      => TaydennysPyynto
    case "processing-fee-overdue"   => KasittelyMaksamatta
    case "processing-fee-paid"      => KasittelyMaksettu
    case "decision-fee-outstanding" => PaatosMaksuAvoin
    case "decision-fee-overdue"     => PaatosMaksamatta
    case "decision-fee-paid"        => PaatosMaksettu
    case "invoiced"                 => Laskutuksessa
    case _ => throw new IllegalArgumentException(s"Tuntematon hakemuspalveluhakemuksen tila: $value")
}
