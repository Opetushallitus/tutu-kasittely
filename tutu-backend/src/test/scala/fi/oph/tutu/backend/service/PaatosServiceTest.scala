package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.*
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.UnitTestBase
import fi.oph.tutu.backend.utils.Utility.toLocalDateTime

import java.util.UUID

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.*

import org.mockito.ArgumentMatchers.*
import org.mockito.Mockito.*
import org.mockito.{Mock, MockitoAnnotations}

class PaatosServiceTest extends UnitTestBase {

  @Mock
  var hakemusRepository: HakemusRepository = _
  @Mock
  var hakemusService: HakemusService = _
  @Mock
  var tutkintoService: TutkintoService = _
  @Mock
  var paatosRepository: PaatosRepository = _
  @Mock
  var hakemuspalveluService: HakemuspalveluService = _
  @Mock
  var hallintoOikeusService: HallintoOikeusService = _
  @Mock
  var ataruLomakeParser: AtaruLomakeParser = _
  @Mock
  var maakoodiService: MaakoodiService = _
  @Mock
  var onrService: OnrService = _

  var paatosService: PaatosService = _

  def makeDbHakemus(hakemusOid: HakemusOid): DbHakemus = {
    DbHakemus(
      id = UUID.randomUUID,
      hakemusOid = hakemusOid,
      hakemusKoskee = 1,
      formId = 1,
      esittelijaId = None,
      esittelijaOid = None,
      asiakirjaId = None,
      asiatunnus = None,
      kasittelyVaihe = KasittelyVaihe.ValmisKasiteltavaksi,
      muokattu = None,
      yhteistutkinto = false,
      lopullinenPaatosVastaavaEhdollinenAsiatunnus = None,
      lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri = None,
      esittelijanHuomioita = None,
      muokkaaja = None,
      onkoPeruutettu = false,
      peruutusPvm = None,
      peruutusLisatieto = None,
      viimeisinTaydennyspyyntoPvm = None,
      saapumisPvm = Some(toLocalDateTime("2025-05-14T10:59:47.597Z")),
      ataruHakemusMuokattu = Some(toLocalDateTime("2025-05-14T10:59:47.597Z")),
      hakijaEtunimet = Some("Jorma Eero"),
      hakijaSukunimi = Some(""),
      esittelyPvm = None
    )
  }

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    paatosService = new PaatosService(
      hakemusRepository = hakemusRepository,
      hakemusService = hakemusService,
      tutkintoService = tutkintoService,
      paatosRepository = paatosRepository,
      hakemuspalveluService = hakemuspalveluService,
      hallintoOikeusService = hallintoOikeusService,
      ataruLomakeParser = ataruLomakeParser,
      maakoodiService = maakoodiService,
      onrService = onrService
    )
  }

  @Test
  def haePaatosPalauttaaMuokkaajanNimen(): Unit = {
    // Data
    val hakemusOid       = HakemusOid("poop")
    val dbHakemus        = makeDbHakemus(hakemusOid)
    val dbPaatos         = Paatos(id = Some(UUID.randomUUID), muokkaaja = Some("1234"))
    val lomakeJsonString = loadJson("ataruLomake.json")

    // Mock setup
    when(hakemusRepository.haeHakemus(any[HakemusOid])).thenReturn(Some(dbHakemus))
    when(paatosRepository.haePaatos(any[UUID])).thenReturn(Some(dbPaatos))
    when(hakemuspalveluService.haeLomake(any[Long])).thenReturn(Right(lomakeJsonString))
    when(paatosRepository.haePaatosTiedot(any[UUID])).thenReturn(Seq())

    when(onrService.haeNimiOption(any[Option[String]])).thenReturn(Some("Topolino"))

    // Act
    val paatos = paatosService.haePaatos(hakemusOid).get

    // Verify
    assertEquals(paatos.muokkaaja, Some("Topolino"))
  }

}
