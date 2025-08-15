package fi.oph.tutu.backend.domain

import com.fasterxml.jackson.core.{JsonParser, JsonToken}
import com.fasterxml.jackson.databind.{DeserializationContext, JsonDeserializer, JsonNode}
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode

import java.time.LocalDateTime
import java.util.UUID
import scala.annotation.meta.field

enum HakemuksenOsa:
  case hakemus,
    hakija,
    tutkinnot,
    asiakirjat,
    paatos,
    valitus,
    yhteinenKasittely,
    perustelutYleiset,
    perustelutRoUo,
    perustelutAp
object HakemuksenOsa:
  val toDbMap = Map(
    HakemuksenOsa.hakemus           -> "hakemus",
    HakemuksenOsa.hakija            -> "hakija",
    HakemuksenOsa.tutkinnot         -> "tutkinnot",
    HakemuksenOsa.asiakirjat        -> "asiakirjat",
    HakemuksenOsa.paatos            -> "paatos",
    HakemuksenOsa.valitus           -> "valitus",
    HakemuksenOsa.yhteinenKasittely -> "yhteinen_kasittely",
    HakemuksenOsa.perustelutYleiset -> "perustelut-yleiset",
    HakemuksenOsa.perustelutRoUo    -> "perustelut-ro-uo",
    HakemuksenOsa.perustelutAp      -> "perustelut-ap"
  )
  val fromDbMap = toDbMap.map((k, v) => (v, k))

  def fromDb(value: String): HakemuksenOsa = {
    fromDbMap.getOrElse(value, HakemuksenOsa.hakemus)
  }

  def toDb(value: HakemuksenOsa): String = {
    toDbMap.getOrElse(value, "hakemus")
  }
end HakemuksenOsa

/* ------- */

case class MuistioPostBody(
  nakyvyys: String = "sisainen",
  sisalto: String = ""
)

case class Muistio(
  id: UUID,
  hakemus_id: UUID,
  sisalto: String = "",
  luotu: LocalDateTime,
  luoja: String,
  muokattu: Option[LocalDateTime] = None,
  muokkaaja: String,
  sisainenHuomio: Boolean = false,
  hakemuksenOsa: HakemuksenOsa = HakemuksenOsa.hakemus
)
