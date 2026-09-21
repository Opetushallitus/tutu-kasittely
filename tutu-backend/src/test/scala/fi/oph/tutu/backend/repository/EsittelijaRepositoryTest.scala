package fi.oph.tutu.backend.repository

import fi.oph.tutu.backend.IntegrationTestBase
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.{Order, Test}
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.test.context.ActiveProfiles

@AutoConfigureMockMvc
@ActiveProfiles(Array("test"))
class EsittelijaRepositoryTest extends IntegrationTestBase {
  @Test
  @Order(1)
  def testSyncFromKayttooikeusServiceLisaaEsittelijat(): Unit = {
    esittelijaRepository.syncFromKayttooikeusService(Seq("oid1", "oid2", "oid3"), "test")
    assertEquals(3, esittelijaRepository.haeKaikkiEsittelijat().size)
  }

  @Test
  @Order(2)
  def testSyncFromKayttooikeusServiceDeaktivoiEsittelijat(): Unit = {
    esittelijaRepository.syncFromKayttooikeusService(Seq("oid1", "oid2", "oid3"), "test")
    esittelijaRepository.syncFromKayttooikeusService(Seq("oid1", "oid2"), "test")
    assertEquals(2, esittelijaRepository.haeKaikkiEsittelijat().size)

    val esittelija = esittelijaRepository.haeEsittelijaOidilla("oid3").get

    assert(esittelija.deactivated.isDefined)
    assertEquals("Deaktivoitu Esittelija", esittelija.toEsittelija.kokoNimi())
  }

  @Test
  @Order(3)
  def testSyncFromKayttooikeusServiceDeaktivoiEsittelijanMaakoodit(): Unit = {
    esittelijaRepository.syncFromKayttooikeusService(Seq("oid1", "oid2", "oid3"), "test")
    val esittelija = esittelijaRepository.haeEsittelijaOidilla("oid2")
    val maakoodi   = maakoodiRepository.upsertMaakoodi(
      "maatjavaltiot2_752",
      "Ruotsi",
      "Sverige",
      "Sweden",
      "testi",
      Some(esittelija.get.esittelijaId)
    )
    esittelijaRepository.syncFromKayttooikeusService(Seq("oid1"), "test")

    assert(maakoodiRepository.getMaakoodi(maakoodi.get.id).get.esittelijaId.isEmpty)
  }
}
