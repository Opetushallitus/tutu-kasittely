package fi.oph.tutu.backend

import fi.oph.tutu.backend.domain.SortDef.Desc
import fi.oph.tutu.backend.domain.{AtaruHakemus, HakemusOid}
import fi.oph.tutu.backend.fixture.{dbHakemusFixture, hakijaFixture, onrUserFixture}
import fi.oph.tutu.backend.repository.{EsittelijaRepository, HakemusRepository}
import fi.oph.tutu.backend.service.{AtaruHakemusParser, HakemusService, HakemuspalveluService, OnrService}
import org.junit.jupiter.api.Assertions.{assertEquals, assertFalse, assertTrue}
import org.junit.jupiter.api.{BeforeEach, Test}
import org.mockito.Mockito.when
import org.mockito.{Mock, MockitoAnnotations}
import org.mockito.ArgumentMatchers.any

import java.time.format.DateTimeFormatter

class HakemusServiceTest extends UnitTestBase {
  @Mock
  var hakemusRepository: HakemusRepository = _
  @Mock
  var esittelijaRepository: EsittelijaRepository = _
  @Mock
  var hakemuspalveluService: HakemuspalveluService = _
  @Mock
  var onrService: OnrService = _
  @Mock
  var ataruHakemusParser: AtaruHakemusParser = _

  var hakemusService: HakemusService = _

  val defaultHakemusOid = HakemusOid("1.2.246.562.11.00000000000000006666")
  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    hakemusService = new HakemusService(
      hakemusRepository,
      esittelijaRepository,
      hakemuspalveluService,
      onrService,
      ataruHakemusParser
    )
  }

  @Test
  def testMuutoshistoriaSortDescending(): Unit = {
    when(hakemuspalveluService.haeHakemus(any[HakemusOid]))
      .thenReturn(Right(loadJson("ataruHakemus.json")))
    when(ataruHakemusParser.parseHakija(any[AtaruHakemus])).thenReturn(hakijaFixture)
    when(hakemusRepository.haeHakemus(any[HakemusOid])).thenReturn(Some(dbHakemusFixture))
    when(hakemuspalveluService.haeMuutoshistoria(any[HakemusOid]))
      .thenReturn(Right(loadJson("muutosHistoria.json")))
    when(onrService.haeHenkilo(any[String])).thenReturn(Right(onrUserFixture))
    val muutosHistoria = hakemusService.haeHakemus(defaultHakemusOid, Desc).get.muutosHistoria.toList
    assertEquals("2025-06-18T05:57:18.866", muutosHistoria.head.time.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
    assertEquals("2025-06-17T10:02:20.473", muutosHistoria.last.time.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
  }

  @Test
  def testMuutoshistoriaFetchFailed(): Unit = {
    when(hakemuspalveluService.haeHakemus(any[HakemusOid]))
      .thenReturn(Right(loadJson("ataruHakemus.json")))
    when(ataruHakemusParser.parseHakija(any[AtaruHakemus])).thenReturn(hakijaFixture)
    when(hakemusRepository.haeHakemus(any[HakemusOid])).thenReturn(Some(dbHakemusFixture))
    when(hakemuspalveluService.haeMuutoshistoria(any[HakemusOid]))
      .thenReturn(Left(new RuntimeException("Kävi niinkuin Kälviällä")))
    hakemusService.haeHakemus(defaultHakemusOid)
    assertTrue(hakemusService.haeHakemus(defaultHakemusOid).get.muutosHistoria.isEmpty)
  }

  @Test
  def testMuutoshistoriaFetchEsittelijaFetchFailed(): Unit = {
    when(hakemuspalveluService.haeHakemus(any[HakemusOid]))
      .thenReturn(Right(loadJson("ataruHakemus.json")))
    when(ataruHakemusParser.parseHakija(any[AtaruHakemus])).thenReturn(hakijaFixture)
    when(hakemusRepository.haeHakemus(any[HakemusOid])).thenReturn(Some(dbHakemusFixture))
    when(hakemuspalveluService.haeMuutoshistoria(any[HakemusOid]))
      .thenReturn(Right(loadJson("muutosHistoria.json")))
    when(onrService.haeHenkilo(any[String])).thenReturn(Left(new RuntimeException("Kävi niinkuin Kälviällä")))
    val muutoshistoria = hakemusService.haeHakemus(defaultHakemusOid).get.muutosHistoria.toList
    assertEquals("", muutoshistoria.head.modifiedBy)
    assertEquals("", muutoshistoria.last.modifiedBy)
  }
}
