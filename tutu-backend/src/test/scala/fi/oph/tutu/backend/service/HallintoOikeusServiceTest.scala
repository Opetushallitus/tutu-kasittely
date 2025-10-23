package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.UnitTestBase
import fi.oph.tutu.backend.domain.{HallintoOikeus, Kieli, MaakuntaHallintoOikeus}
import fi.oph.tutu.backend.exception.{HallintoOikeusNotFoundException, HallintoOikeusServiceException}
import fi.oph.tutu.backend.repository.HallintoOikeusRepository
import org.junit.jupiter.api.Assertions._
import org.junit.jupiter.api.{BeforeEach, Test}
import org.mockito.ArgumentMatchers._
import org.mockito.Mockito._
import org.mockito.{Mock, MockitoAnnotations}

import java.util.UUID

class HallintoOikeusServiceTest extends UnitTestBase {
  @Mock
  var hallintoOikeusRepository: HallintoOikeusRepository = _

  @Mock
  var koodistoService: KoodistoService = _

  var hallintoOikeusService: HallintoOikeusService = _

  val kuntaHelsinkiRelationsJson = """[
    {
      "koodiUri": "maakunta_01",
      "koodiArvo": "01",
      "tila": "HYVAKSYTTY"
    }
  ]"""

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    hallintoOikeusService = new HallintoOikeusService(
      hallintoOikeusRepository,
      koodistoService
    )
  }

  @Test
  def testHaeHallintoOikeusByKuntaOnnistuu(): Unit = {
    val kuntaKoodi    = "091"
    val maakuntaKoodi = "01"

    val testUuid = UUID.randomUUID()

    val maakuntaMapping = MaakuntaHallintoOikeus(
      id = Some(UUID.randomUUID()),
      maakuntaKoodi = maakuntaKoodi,
      hallintoOikeusId = testUuid
    )

    val hallintoOikeus = HallintoOikeus(
      id = Some(testUuid),
      koodi = "HELSINKI",
      nimi = Map(
        Kieli.fi -> "Helsingin hallinto-oikeus",
        Kieli.sv -> "Helsingfors förvaltningsdomstol",
        Kieli.en -> "Helsinki Administrative Court"
      ),
      osoite = Some(
        Map(
          Kieli.fi -> "Radanrakentajantie 5, 00520 Helsinki",
          Kieli.sv -> "Banbyggarvägen 5, 00520 Helsingfors",
          Kieli.en -> "Radanrakentajantie 5, 00520 Helsinki"
        )
      ),
      puhelin = Some("029 56 42000"),
      sahkoposti = Some("helsinki.hao@oikeus.fi"),
      verkkosivu = Some(
        Map(
          Kieli.fi -> "https://oikeus.fi/hallinto-oikeudet/helsingin-hallinto-oikeus",
          Kieli.sv -> "https://oikeus.fi/sv/forvaltningsdomstolar/helsingfors-forvaltningsdomstol",
          Kieli.en -> "https://oikeus.fi/en/administrative-courts/helsinki-administrative-court"
        )
      )
    )

    when(koodistoService.getKoodistoRelaatiot(s"kunta_$kuntaKoodi")).thenReturn(Right(kuntaHelsinkiRelationsJson))
    when(hallintoOikeusRepository.findByMaakuntaKoodi(maakuntaKoodi))
      .thenReturn(Some(maakuntaMapping))
    when(hallintoOikeusRepository.findById(testUuid)).thenReturn(Some(hallintoOikeus))

    val result = hallintoOikeusService.haeHallintoOikeusByKunta(kuntaKoodi)

    assertEquals(Some(testUuid), result.id)
    assertEquals("HELSINKI", result.koodi)

    assertEquals("Helsingin hallinto-oikeus", result.nimi.get(Kieli.fi).get)
    assertEquals("Helsingfors förvaltningsdomstol", result.nimi.get(Kieli.sv).get)
    assertEquals("Helsinki Administrative Court", result.nimi.get(Kieli.en).get)

    assertEquals("Radanrakentajantie 5, 00520 Helsinki", result.osoite.get.get(Kieli.fi).get)
    assertEquals("Banbyggarvägen 5, 00520 Helsingfors", result.osoite.get.get(Kieli.sv).get)
    assertEquals("Radanrakentajantie 5, 00520 Helsinki", result.osoite.get.get(Kieli.en).get)

    assertEquals(Some("029 56 42000"), result.puhelin)
    assertEquals(Some("helsinki.hao@oikeus.fi"), result.sahkoposti)

    assertEquals(
      "https://oikeus.fi/hallinto-oikeudet/helsingin-hallinto-oikeus",
      result.verkkosivu.get.get(Kieli.fi).get
    )
    assertEquals(
      "https://oikeus.fi/sv/forvaltningsdomstolar/helsingfors-forvaltningsdomstol",
      result.verkkosivu.get.get(Kieli.sv).get
    )
    assertEquals(
      "https://oikeus.fi/en/administrative-courts/helsinki-administrative-court",
      result.verkkosivu.get.get(Kieli.en).get
    )
  }

  @Test
  def testHaeHallintoOikeusByKuntaKuntaaEiLoydy(): Unit = {
    val kuntaKoodi = "999"

    when(koodistoService.getKoodistoRelaatiot(s"kunta_$kuntaKoodi"))
      .thenReturn(Left(new RuntimeException("Kuntaa ei löydy")))

    val exception = assertThrows(
      classOf[HallintoOikeusServiceException],
      () => {
        hallintoOikeusService.haeHallintoOikeusByKunta(kuntaKoodi)
      }
    )

    assertTrue(exception.getMessage.contains("Koodisto-palvelun kutsu epäonnistui"))
  }

  @Test
  def testHaeHallintoOikeusByKuntaMaakuntaMappingEiLoydy(): Unit = {
    val kuntaKoodi    = "091"
    val maakuntaKoodi = "01"

    when(koodistoService.getKoodistoRelaatiot(s"kunta_$kuntaKoodi")).thenReturn(Right(kuntaHelsinkiRelationsJson))
    when(hallintoOikeusRepository.findByMaakuntaKoodi(maakuntaKoodi))
      .thenReturn(None)

    val exception = assertThrows(
      classOf[HallintoOikeusNotFoundException],
      () => {
        hallintoOikeusService.haeHallintoOikeusByKunta(kuntaKoodi)
      }
    )

    assertTrue(exception.getMessage.contains("Hallinto-oikeutta ei löytynyt maakunnalle"))
  }

  @Test
  def testHaeHallintoOikeusByKuntaHallintoOikeusEiLoydy(): Unit = {
    val kuntaKoodi    = "091"
    val maakuntaKoodi = "01"
    val testUuid      = UUID.randomUUID()

    val maakuntaMapping = MaakuntaHallintoOikeus(
      id = Some(UUID.randomUUID()),
      maakuntaKoodi = maakuntaKoodi,
      hallintoOikeusId = testUuid
    )

    when(koodistoService.getKoodistoRelaatiot(s"kunta_$kuntaKoodi")).thenReturn(Right(kuntaHelsinkiRelationsJson))
    when(hallintoOikeusRepository.findByMaakuntaKoodi(maakuntaKoodi))
      .thenReturn(Some(maakuntaMapping))
    when(hallintoOikeusRepository.findById(testUuid)).thenReturn(None)

    val exception = assertThrows(
      classOf[HallintoOikeusNotFoundException],
      () => {
        hallintoOikeusService.haeHallintoOikeusByKunta(kuntaKoodi)
      }
    )

    assertTrue(exception.getMessage.contains("Hallinto-oikeus ei löytynyt ID:llä"))
  }

  @Test
  def testHaeHallintoOikeusByKuntaTyhjatRelaatiot(): Unit = {
    val kuntaKoodi = "091"

    val emptyRelationsJson = "[]"

    when(koodistoService.getKoodistoRelaatiot(s"kunta_$kuntaKoodi"))
      .thenReturn(Right(emptyRelationsJson))

    val exception = assertThrows(
      classOf[HallintoOikeusNotFoundException],
      () => {
        hallintoOikeusService.haeHallintoOikeusByKunta(kuntaKoodi)
      }
    )

    assertTrue(exception.getMessage.contains("Hallinto-oikeutta ei löytynyt kunnalle"))
  }

  @Test
  def testHaeHallintoOikeusByKuntaEiHyvaksyttyStatus(): Unit = {
    val kuntaKoodi = "091"

    val relationsWithInvalidStatus = """[
      {
        "koodiUri": "maakunta_01",
        "koodiArvo": "01",
        "tila": "LUONNOS"
      }
    ]"""

    when(koodistoService.getKoodistoRelaatiot(s"kunta_$kuntaKoodi"))
      .thenReturn(Right(relationsWithInvalidStatus))

    val exception = assertThrows(
      classOf[HallintoOikeusNotFoundException],
      () => {
        hallintoOikeusService.haeHallintoOikeusByKunta(kuntaKoodi)
      }
    )

    assertTrue(exception.getMessage.contains("Hallinto-oikeutta ei löytynyt kunnalle"))
  }

  @Test
  def testHaeHallintoOikeusByKuntaVirheellinenJson(): Unit = {
    val kuntaKoodi = "091"

    when(koodistoService.getKoodistoRelaatiot(s"kunta_$kuntaKoodi"))
      .thenReturn(Right("invalid json {"))

    assertThrows(
      classOf[HallintoOikeusNotFoundException],
      () => {
        hallintoOikeusService.haeHallintoOikeusByKunta(kuntaKoodi)
      }
    )
  }

  @Test
  def testHaeKaikkiHallintoOikeudetVirhetilanteessa(): Unit = {
    when(hallintoOikeusRepository.findAll())
      .thenThrow(new RuntimeException("Database connection failed"))

    val result = hallintoOikeusService.haeKaikkiHallintoOikeudet()

    assertEquals(0, result.size, "Virheen sattuessa pitäisi palauttaa tyhjä lista")
  }

  @Test
  def testHaeKaikkiHallintoOikeudet(): Unit = {
    val hallintoOikeudet = Seq(
      HallintoOikeus(
        id = Some(UUID.randomUUID()),
        koodi = "HELSINKI",
        nimi = Map(
          Kieli.fi -> "Helsingin hallinto-oikeus",
          Kieli.sv -> "Helsingfors förvaltningsdomstol",
          Kieli.en -> "Helsinki Administrative Court"
        )
      ),
      HallintoOikeus(
        id = Some(UUID.randomUUID()),
        koodi = "TURKU",
        nimi = Map(
          Kieli.fi -> "Turun hallinto-oikeus",
          Kieli.sv -> "Åbo förvaltningsdomstol",
          Kieli.en -> "Turku Administrative Court"
        )
      )
    )

    when(hallintoOikeusRepository.findAll()).thenReturn(hallintoOikeudet)

    val result = hallintoOikeusService.haeKaikkiHallintoOikeudet()

    assertEquals(2, result.size)
    assertEquals("Helsingin hallinto-oikeus", result.head.nimi.get(Kieli.fi).get)
    assertEquals("Turun hallinto-oikeus", result(1).nimi.get(Kieli.fi).get)
  }

}
