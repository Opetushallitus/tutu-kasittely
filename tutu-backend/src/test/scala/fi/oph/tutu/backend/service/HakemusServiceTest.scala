package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.*
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.utils.Utility.toLocalDateTime
import fi.oph.tutu.backend.UnitTestBase

import java.util.UUID
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.fixture.createTutkinnotFixtureBeforeMuuttuneetTutkinnot
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.*
import org.mockito.ArgumentMatchers.*
import org.mockito.Mockito.*
import org.mockito.{Mock, MockitoAnnotations}

class HakemusServiceTest extends UnitTestBase {

  val objectMapper = new ObjectMapper()
  objectMapper.registerModule(DefaultScalaModule)

  @Mock
  var esittelijaRepository: EsittelijaRepository = _
  @Mock
  var hakemusRepository: HakemusRepository = _
  @Mock
  var asiakirjaRepository: AsiakirjaRepository = _
  @Mock
  var perusteluRepository: PerusteluRepository = _
  @Mock
  var tutkintoRepository: TutkintoRepository = _
  @Mock
  var kasittelyVaiheService: KasittelyVaiheService = _
  @Mock
  var paatosRepository: PaatosRepository = _
  @Mock
  var hakemuspalveluService: HakemuspalveluService = _
  @Mock
  var onrService: OnrService = _
  @Mock
  var ataruHakemusParser: AtaruHakemusParser = _
  @Mock
  var userService: UserService = _
  @Mock
  var db: TutuDatabase = _

  var hakemusService: HakemusService = _

  def makeDbHakemus(hakemusOid: HakemusOid, formId: Long): DbHakemus = {
    DbHakemus(
      id = UUID.randomUUID,
      hakemusOid = hakemusOid,
      hakemusKoskee = 1,
      formId = formId,
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

  def makeAtaruHakemus(form_id: Long): AtaruHakemus = {
    AtaruHakemus(
      haku = None,
      etunimet = "Jorma Eero",
      key = "",
      form_id = form_id,
      content = Content(answers = Seq()),
      latestVersionCreated = "2025-05-14T10:59:47.597Z",
      state = "",
      modified = "2025-05-14T10:59:47.597Z",
      submitted = "2025-05-14T10:59:47.597Z",
      lang = "",
      sukunimi = "",
      `application-review-notes` = None,
      henkilotunnus = None,
      `person-oid` = "",
      `application-hakukohde-attachment-reviews` = Seq(),
      `latest-attachment-reviews` = Seq(),
      `application-hakukohde-reviews` = Seq(),
      hakutoiveet = Seq(),
      `information-request-timestamp` = None
    )
  }

  def makeHakija(
    henkiloOid: String = "",
    etunimet: String = "",
    kutsumanimi: String = "",
    sukunimi: String = "",
    kansalaisuus: Seq[Kielistetty] = Seq(),
    hetu: Option[String] = None,
    syntymaaika: String = "",
    matkapuhelin: Option[String] = None,
    asuinmaa: Kielistetty = Map(),
    katuosoite: String = "",
    postinumero: String = "",
    postitoimipaikka: String = "",
    kotikunta: Kielistetty = Map(),
    sahkopostiosoite: Option[String] = None,
    yksiloityVTJ: Boolean = false
  ): Hakija = {
    Hakija(
      henkiloOid = henkiloOid,
      etunimet = etunimet,
      kutsumanimi = kutsumanimi,
      sukunimi = sukunimi,
      kansalaisuus = kansalaisuus,
      hetu = hetu,
      syntymaaika = syntymaaika,
      matkapuhelin = matkapuhelin,
      asuinmaa = asuinmaa,
      katuosoite = katuosoite,
      postinumero = postinumero,
      postitoimipaikka = postitoimipaikka,
      kotikunta = kotikunta,
      sahkopostiosoite = sahkopostiosoite,
      yksiloityVTJ = yksiloityVTJ
    )
  }

  def makeOnrUser(
    oidHenkilo: String = "",
    kutsumanimi: String = "",
    sukunimi: String = "",
    kansalaisuus: Seq[KansalaisuusKoodi] = Seq(),
    hetu: Option[String] = None,
    yksiloityVTJ: Boolean = false
  ): OnrUser = {
    OnrUser(
      oidHenkilo = oidHenkilo,
      kutsumanimi = kutsumanimi,
      sukunimi = sukunimi,
      kansalaisuus = kansalaisuus,
      hetu = hetu,
      yksiloityVTJ = yksiloityVTJ
    )
  }

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    hakemusService = new HakemusService(
      hakemusRepository = hakemusRepository,
      esittelijaRepository = esittelijaRepository,
      asiakirjaRepository = asiakirjaRepository,
      perusteluRepository = perusteluRepository,
      tutkintoRepository = tutkintoRepository,
      kasittelyVaiheService = kasittelyVaiheService,
      paatosRepository = paatosRepository,
      hakemuspalveluService = hakemuspalveluService,
      onrService = onrService,
      ataruHakemusParser = ataruHakemusParser,
      userService = userService,
      db = db
    )
  }

  @Nested
  @DisplayName("paivitaTiedotAtarusta")
  class PaivitaTiedotAtarusta extends UnitTestBase {
    @Test
    def paivitaTiedotAtarustaIdentifiesChangedFormId(): Unit = {

      // Data
      val hakemusOid             = HakemusOid("poop")
      val dbHakemus              = makeDbHakemus(hakemusOid, 5)
      val ataruHakemus           = makeAtaruHakemus(9)
      val ataruHakemusJsonString = objectMapper.writeValueAsString(ataruHakemus)

      // Spy variables
      var storedFormId = dbHakemus.formId

      // Mock setup
      when(hakemusRepository.haeHakemus(any[HakemusOid])).thenReturn(Some(dbHakemus))
      when(hakemuspalveluService.haeHakemus(any[HakemusOid])).thenReturn(Right(ataruHakemusJsonString))
      when(ataruHakemusParser.parseHakemusKoskee(any[AtaruHakemus])).thenReturn(1)
      when(ataruHakemusParser.onkoHakemusPeruutettu(any[AtaruHakemus])).thenReturn(false)
      when(kasittelyVaiheService.resolveKasittelyVaihe(any[DbHakemus], any[AtaruHakemus]))
        .thenReturn(KasittelyVaihe.ValmisKasiteltavaksi)
      when(ataruHakemusParser.parseTutkinnot(any[UUID], any[AtaruHakemus]))
        .thenAnswer { invocation =>
          val uuid = invocation.getArgument[UUID](0)
          createTutkinnotFixtureBeforeMuuttuneetTutkinnot(uuid)
        }

      // Setup spy for verification
      when(
        hakemusRepository.paivitaHakemus(
          any[HakemusOid],
          any[DbHakemus],
          any[String]
        )
      ).thenAnswer { invocation =>
        storedFormId = invocation.getArgument[DbHakemus](1).formId
        hakemusOid
      }

      // Act
      hakemusService.paivitaTiedotAtarusta(hakemusOid)

      // Verify
      /* The new form ID should be stored */
      assertEquals(storedFormId, ataruHakemus.form_id)
    }

    @Test
    def paivitaTiedotAtarustaIgnoresUnchangedFormId(): Unit = {
      // Data
      val hakemusOid             = HakemusOid("poop")
      val dbHakemus              = makeDbHakemus(hakemusOid, 5)
      val ataruHakemus           = makeAtaruHakemus(5)
      val ataruHakemusJsonString = objectMapper.writeValueAsString(ataruHakemus)

      // Spy variables
      var formUpdateCalled = false

      // Mock setup
      when(hakemusRepository.haeHakemus(any[HakemusOid])).thenReturn(Some(dbHakemus))
      when(hakemuspalveluService.haeHakemus(any[HakemusOid])).thenReturn(Right(ataruHakemusJsonString))
      when(ataruHakemusParser.parseHakemusKoskee(any[AtaruHakemus])).thenReturn(1)
      when(ataruHakemusParser.onkoHakemusPeruutettu(any[AtaruHakemus])).thenReturn(false)
      when(kasittelyVaiheService.resolveKasittelyVaihe(any[DbHakemus], any[AtaruHakemus]))
        .thenReturn(KasittelyVaihe.ValmisKasiteltavaksi)
      when(ataruHakemusParser.parseTutkinnot(any[UUID], any[AtaruHakemus]))
        .thenAnswer { invocation =>
          val uuid = invocation.getArgument[UUID](0)
          createTutkinnotFixtureBeforeMuuttuneetTutkinnot(uuid)
        }

      // Setup spy for verification
      when(
        hakemusRepository.paivitaHakemus(
          any[HakemusOid],
          any[DbHakemus],
          any[String]
        )
      ).thenAnswer { invocation =>
        formUpdateCalled = true // Mark update function as called
        hakemusOid
      }

      // Act
      hakemusService.paivitaTiedotAtarusta(hakemusOid)

      // Verify
      /* Update function should not be called */
      assertEquals(formUpdateCalled, false)
    }
  }

  @Test
  def haeHakemusPalauttaaMuokkaajanNimen(): Unit = {

    // Data
    val hakemusOid             = HakemusOid("poop")
    val dbHakemus              = makeDbHakemus(hakemusOid, 5)
    val ataruHakemus           = makeAtaruHakemus(5)
    val ataruHakemusJsonString = objectMapper.writeValueAsString(ataruHakemus)
    val lomakeJsonString       = loadJson("ataruLomake.json")
    val hakija                 = makeHakija()
    val henkilo                = makeOnrUser()

    // Mock setup
    when(hakemusRepository.haeHakemus(any[HakemusOid])).thenReturn(Some(dbHakemus))
    when(hakemuspalveluService.haeHakemus(any[HakemusOid])).thenReturn(Right(ataruHakemusJsonString))
    when(hakemuspalveluService.haeLomake(any[Long])).thenReturn(Right(lomakeJsonString))
    when(ataruHakemusParser.parseHakija(any[AtaruHakemus])).thenReturn(hakija)
    when(ataruHakemusParser.parseTutkinnot(any[UUID], any[AtaruHakemus])).thenReturn(Seq())
    when(onrService.haeHenkilo(any[String])).thenReturn(Right(henkilo))
    when(tutkintoRepository.haeTutkinnotHakemusOidilla(any[HakemusOid])).thenReturn(Seq())

    when(onrService.haeNimi(any[Option[String]])).thenReturn("Topolino")

    // Act
    val hakemus: Hakemus = hakemusService.haeHakemus(hakemusOid).get

    // Verify
    assertEquals(hakemus.muokkaaja, "Topolino")
  }
}
