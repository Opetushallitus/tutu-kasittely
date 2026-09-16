package fi.oph.tutu.backend.domain

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.{DeserializationContext, JsonDeserializer}

enum AtaruHakemuksenTila:
  case Kasittelematta, Kasittelyssa, KutsuttuHaastatteluun, KutsuttuValintaKokeeseen, Arvioinnissa, Valintaesitys,
    Kasitelty,
    TaydennysPyynto, KasittelyMaksamatta, KasittelyMaksettu, PaatosMaksuAvoin,
    PaatosMaksamatta,
    PaatosMaksettu, Laskutuksessa, Tuntematon

object AtaruHakemuksenTila {
  private val ATARU2TUTU_TILA_MAPPINGS: Map[String, AtaruHakemuksenTila] = Map(
    "unprocessed"              -> Kasittelematta,
    "processing"               -> Kasittelyssa,
    "invited-to-interview"     -> KutsuttuHaastatteluun,
    "invited-to-exam"          -> KutsuttuValintaKokeeseen,
    "evaluating"               -> Arvioinnissa,
    "valintaesitys"            -> Valintaesitys,
    "processed"                -> Kasitelty,
    "information-request"      -> TaydennysPyynto,
    "processing-fee-overdue"   -> KasittelyMaksamatta,
    "processing-fee-paid"      -> KasittelyMaksettu,
    "decision-fee-outstanding" -> PaatosMaksuAvoin,
    "decision-fee-overdue"     -> PaatosMaksamatta,
    "decision-fee-paid"        -> PaatosMaksettu,
    "invoiced"                 -> Laskutuksessa
  )
  val UNDEFINED = "unprocessed"

  def fromString(value: String): AtaruHakemuksenTila = if (ATARU2TUTU_TILA_MAPPINGS.contains(value))
    ATARU2TUTU_TILA_MAPPINGS(value)
  else throw new IllegalArgumentException(s"Tuntematon hakemuspalveluhakemuksen tila: $value")

  def isValidAtarutila(value: String): Boolean = ATARU2TUTU_TILA_MAPPINGS.contains(value)

  def fromHakukohdeReviewList(reviewList: Seq[HakukohdeReview]): AtaruHakemuksenTila = {
    fromString(
      reviewList
        .collectFirst(review => review.state)
        .getOrElse(AtaruHakemuksenTila.UNDEFINED)
    )
  }
}

class AtaruHakemuksenTilaDeserializer extends JsonDeserializer[AtaruHakemuksenTila] {
  override def deserialize(p: JsonParser, ctxt: DeserializationContext): AtaruHakemuksenTila = {
    val value: String = p.getValueAsString
    AtaruHakemuksenTila.fromString(value)
  }
}
