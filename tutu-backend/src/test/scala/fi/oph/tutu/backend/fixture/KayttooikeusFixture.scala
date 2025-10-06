package fi.oph.tutu.backend.fixture

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.domain.Kayttajatiedot

object KayttooikeusFixture:

  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)

  // Test OIDs
  val virkailija1Oid            = "1.2.246.562.24.11111111111"
  val virkailija2Oid            = "1.2.246.562.24.22222222222"
  val palveluAtaruOid           = "1.2.246.562.24.30121845486"
  val palveluServiceProviderOid = "1.2.246.562.24.33333333333"
  val virheellinenOid           = "1.2.246.562.24.99999999999"

  // Domain objects
  val virkailija1            = Kayttajatiedot("virkailija1", None, "VIRKAILIJA")
  val virkailija2            = Kayttajatiedot("virkailija2", None, "VIRKAILIJA")
  val palveluAtaru           = Kayttajatiedot("ataru", None, "PALVELU")
  val palveluServiceProvider = Kayttajatiedot("serviceprovider", None, "PALVELU")

  // Serialized JSON strings
  val virkailija1Json: String            = mapper.writeValueAsString(virkailija1)
  val virkailija2Json: String            = mapper.writeValueAsString(virkailija2)
  val palveluAtaruJson: String           = mapper.writeValueAsString(palveluAtaru)
  val palveluServiceProviderJson: String = mapper.writeValueAsString(palveluServiceProvider)

  // Helper for custom kayttajatiedot
  def kayttajatiedotJson(username: String, kayttajaTyyppi: String): String =
    mapper.writeValueAsString(Kayttajatiedot(username, None, kayttajaTyyppi))

  // Kayttooikeusryhma data structures
  case class KayttooikeusRyhma(id: Int, nimi: String)
  case class PersonOids(personOids: Seq[String])

  val tutuEsittelijaRyhma = KayttooikeusRyhma(1, "TUTU_ESITTELIJA")

  val kayttooikeusRyhmatJson: String =
    mapper.writeValueAsString(Seq(tutuEsittelijaRyhma))

  def henkilotJson(oids: String*): String =
    mapper.writeValueAsString(PersonOids(oids.toSeq))
