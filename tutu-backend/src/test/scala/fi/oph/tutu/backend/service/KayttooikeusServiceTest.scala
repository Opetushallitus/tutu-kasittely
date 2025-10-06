package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.UnitTestBase
import fi.oph.tutu.backend.fixture.KayttooikeusFixture.*
import fi.oph.tutu.backend.repository.EsittelijaRepository
import fi.vm.sade.javautils.nio.cas.CasClient
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.{BeforeEach, Test}
import org.mockito.ArgumentMatchers.{any, contains}
import org.mockito.Mockito
import org.mockito.Mockito.{mock, times, verify, when}

class KayttooikeusServiceTest extends UnitTestBase {

  private var httpService: HttpService                   = _
  private var esittelijaRepository: EsittelijaRepository = _
  private var kayttooikeusService: KayttooikeusService   = _

  @BeforeEach
  def setUp(): Unit = {
    httpService = mock(classOf[HttpService])
    esittelijaRepository = mock(classOf[EsittelijaRepository])

    kayttooikeusService = new KayttooikeusService(
      httpService,
      esittelijaRepository
    )

    setupDefaultMocks()
  }

  private def setupDefaultMocks(): Unit = {
    when(httpService.post(any[CasClient], contains("ryhmasByKayttooikeus"), any[String]))
      .thenReturn(Right(kayttooikeusRyhmatJson))

    when(httpService.get(any[CasClient], contains(s"henkilo/$virkailija1Oid/kayttajatiedot")))
      .thenReturn(Right(virkailija1Json))

    when(httpService.get(any[CasClient], contains(s"henkilo/$virkailija2Oid/kayttajatiedot")))
      .thenReturn(Right(virkailija2Json))

    when(httpService.get(any[CasClient], contains(s"henkilo/$palveluAtaruOid/kayttajatiedot")))
      .thenReturn(Right(palveluAtaruJson))

    when(httpService.get(any[CasClient], contains(s"henkilo/$palveluServiceProviderOid/kayttajatiedot")))
      .thenReturn(Right(palveluServiceProviderJson))
  }

  @Test
  def testSuodattaaPalvelukayttajat(): Unit = {
    when(httpService.get(any[CasClient], contains("kayttooikeusryhma/1/henkilot")))
      .thenReturn(Right(henkilotJson(virkailija1Oid, palveluAtaruOid, virkailija2Oid, palveluServiceProviderOid)))

    val result = kayttooikeusService.haeEsittelijat

    assertTrue(result.isRight, "Pitäisi palauttaa käyttäjätiedot")
    val esittelijat = result.toOption.get

    assertEquals(2, esittelijat.size, "Pitäisi olla 2 virkailijaa (2 palvelukäyttäjää suodatettu pois)")
    assertTrue(esittelijat.contains(virkailija1Oid), "Pitäisi sisältää virkailija1")
    assertTrue(esittelijat.contains(virkailija2Oid), "Pitäisi sisältää virkailija2")
    assertFalse(esittelijat.contains(palveluAtaruOid), "Ei pitäisi sisältää palvelukäyttäjä ataru")
    assertFalse(esittelijat.contains(palveluServiceProviderOid), "Ei pitäisi sisältää palvelukäyttäjä serviceprovider")

    verify(esittelijaRepository, times(1))
      .syncFromKayttooikeusService(esittelijat, "KayttooikeusService")
  }

  @Test
  def testPoistaaDuplikaatitJaSuodattaaPalvelukäyttäjät(): Unit = {
    when(httpService.get(any[CasClient], contains("kayttooikeusryhma/1/henkilot")))
      .thenReturn(Right(henkilotJson(virkailija1Oid, palveluAtaruOid, virkailija1Oid, palveluAtaruOid)))

    val result = kayttooikeusService.haeEsittelijat

    assertTrue(result.isRight, "Pitäisi palauttaa käyttäjätiedot")
    val esittelijat = result.toOption.get

    assertEquals(1, esittelijat.size, "Pitäisi olla 1 virkailija (duplikaatit ja palvelukäyttäjä suodatettu pois)")
    assertEquals(virkailija1Oid, esittelijat.head)
  }

  @Test
  def testKasitteleeKayttajatietojenHakuVirhe(): Unit = {
    when(httpService.get(any[CasClient], contains("kayttooikeusryhma/1/henkilot")))
      .thenReturn(Right(henkilotJson(virkailija1Oid, virheellinenOid)))

    when(httpService.get(any[CasClient], contains(s"henkilo/$virheellinenOid/kayttajatiedot")))
      .thenReturn(Left(new RuntimeException("404 Not Found")))

    val result = kayttooikeusService.haeEsittelijat

    assertTrue(result.isRight, "Pitäisi palauttaa käyttäjätiedot")
    val esittelijat = result.toOption.get

    assertEquals(2, esittelijat.size, "Pitäisi olla 2 käyttäjää (virheellinen mukana lukien)")
    assertTrue(esittelijat.contains(virkailija1Oid))
    assertTrue(
      esittelijat.contains(virheellinenOid),
      "Ongelmallinen OID pitäisi sisällyttää (ei oletettu palvelukäyttäjäksi)"
    )
  }

  @Test
  def testTyhjaListaJosKaikkiPalveluja(): Unit = {
    when(httpService.get(any[CasClient], contains("kayttooikeusryhma/1/henkilot")))
      .thenReturn(Right(henkilotJson(palveluAtaruOid, palveluServiceProviderOid)))

    val result = kayttooikeusService.haeEsittelijat

    assertTrue(result.isRight, "Pitäisi palauttaa käyttäjätiedot")
    val esittelijat = result.toOption.get

    assertEquals(0, esittelijat.size, "Pitäisi olla tyhjä lista, kun kaikki ovat palvelukäyttäjiä")
  }
}
