package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.*
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.UnitTestBase
import fi.oph.tutu.backend.utils.Utility.toLocalDateTime

import java.util.UUID

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.*

import org.mockito.ArgumentMatchers.*
import org.mockito.Mockito.*
import org.mockito.{Mock, MockitoAnnotations}

class PerusteluServiceTest extends UnitTestBase {

  val objectMapper = new ObjectMapper()
  objectMapper.registerModule(DefaultScalaModule)

  @Mock
  var hakemusService: HakemusService = _
  @Mock
  var tutkintoService: TutkintoService = _
  @Mock
  var hakemusRepository: HakemusRepository = _
  @Mock
  var perusteluRepository: PerusteluRepository = _
  @Mock
  var asiakirjaRepository: AsiakirjaRepository = _
  @Mock
  var kasittelyVaiheService: KasittelyVaiheService = _
  @Mock
  var hakemuspalveluService: HakemuspalveluService = _
  @Mock
  var paatosService: PaatosService = _
  @Mock
  var maakoodiService: MaakoodiService = _
  @Mock
  var koodistoService: KoodistoService = _
  @Mock
  var onrService: OnrService = _
  @Mock
  var translationService: TranslationService = _

  var perusteluService: PerusteluService = _

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
      hakijaSukunimi = Some("")
    )
  }

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    perusteluService = new PerusteluService(
      hakemusService = hakemusService,
      tutkintoService = tutkintoService,
      hakemusRepository = hakemusRepository,
      perusteluRepository = perusteluRepository,
      asiakirjaRepository = asiakirjaRepository,
      kasittelyVaiheService = kasittelyVaiheService,
      hakemuspalveluService = hakemuspalveluService,
      paatosService = paatosService,
      maakoodiService = maakoodiService,
      koodistoService = koodistoService,
      onrService = onrService,
      translationService = translationService
    )
  }

  @Test
  def haePerusteluPalauttaaMuokkaajanNimen(): Unit = {
    // Data
    val hakemusOid  = HakemusOid("poop")
    val dbHakemus   = makeDbHakemus(hakemusOid)
    val dbPerustelu = Perustelu(id = Some(UUID.randomUUID), muokkaaja = Some("1234"))

    // Mock setup
    when(hakemusRepository.haeHakemus(any[HakemusOid])).thenReturn(Some(dbHakemus))
    when(perusteluRepository.haePerustelu(any[UUID])).thenReturn(Some(dbPerustelu))
    when(perusteluRepository.haeLausuntopyynnot(any[UUID])).thenReturn(Seq())

    when(onrService.haeNimiOption(any[Option[String]])).thenReturn(Some("Topolino"))

    // Act
    val perustelu = perusteluService.haePerustelu(hakemusOid).get

    // Verify
    assertEquals(perustelu.muokkaaja, Some("Topolino"))
  }

}
