package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.repository.*
import fi.oph.tutu.backend.service.*
import fi.oph.tutu.backend.utils.Utility.toLocalDateTime
import fi.oph.tutu.backend.UnitTestBase
import fi.oph.tutu.backend.config.JacksonConfig

import java.util.UUID
import fi.oph.tutu.backend.fixture.createTutkinnotFixtureBeforeMuuttuneetTutkinnot
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.*
import org.mockito.ArgumentMatchers.*
import org.mockito.Mockito.*
import org.mockito.{Mock, MockitoAnnotations}

import java.util.concurrent.CompletableFuture

class HakemusServiceTest extends UnitTestBase {

  @Mock
  var esittelijaRepository: EsittelijaRepository = _
  @Mock
  var hakemusRepository: HakemusRepository = _
  @Mock
  var hakemusSearchRepository: HakemusSearchRepository = _
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
  var perustelumuistioService: IPerustelumuistioService = _
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
      hakijaSukunimi = Some(""),
      esittelyPvm = None,
      lausunnonMaaraaikaPvm = None
    )
  }

  def makeAtaruHakemusupdate(form_id: Long): AtaruHakemusUpdate = {
    AtaruHakemusUpdate(
      form_id = form_id,
      content = Content(answers = Seq()),
      latestVersionCreated = toLocalDateTime("2025-05-14T10:59:47.597Z"),
      modified = toLocalDateTime("2025-05-14T10:59:47.597Z"),
      submitted = toLocalDateTime("2025-05-14T10:59:47.597Z"),
      `application-hakukohde-reviews` = Seq(),
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
      yhteystiedotRyhma = Seq(),
      yksiloityVTJ = yksiloityVTJ
    )
  }

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    hakemusService = new HakemusService(
      hakemusRepository = hakemusRepository,
      hakemusSearchRepository = hakemusSearchRepository,
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
      perustelumuistioService = perustelumuistioService,
      db = db,
      JacksonConfig.mapper
    )
    when(perustelumuistioService.paivitaPerustelumuistio(any[HakemusOid], any[String]))
      .thenReturn(CompletableFuture.completedFuture(None))
    when(perustelumuistioService.paivitaPerustelumuistio(any[UUID], any[String]))
      .thenReturn(CompletableFuture.completedFuture(None))
  }

  @Nested
  @DisplayName("paivitaTiedotAtarusta")
  class PaivitaTiedotAtarusta extends UnitTestBase {
    @Test
    def paivitaTiedotAtarustaIdentifiesChangedFormId(): Unit = {

      // Data
      val hakemusOid         = HakemusOid("poop")
      val dbHakemus          = makeDbHakemus(hakemusOid, 5)
      val ataruHakemusUpdate = makeAtaruHakemusupdate(9)

      // Spy variables
      var storedFormId = dbHakemus.formId

      // Mock setup
      when(hakemusRepository.haeHakemus(any[HakemusOid])).thenReturn(Some(dbHakemus))
      when(ataruHakemusParser.parseHakemusKoskee(any[Content])).thenReturn(1)
      when(ataruHakemusParser.onkoHakemusPeruutettu(any[Content])).thenReturn(false)
      when(kasittelyVaiheService.resolveKasittelyVaihe(any[DbHakemus], any[AtaruTilaPaivitys]))
        .thenReturn(KasittelyVaihe.ValmisKasiteltavaksi)
      when(ataruHakemusParser.parseTutkinnot(any[UUID], any[Content]))
        .thenAnswer { invocation =>
          val uuid = invocation.getArgument[UUID](0)
          createTutkinnotFixtureBeforeMuuttuneetTutkinnot(uuid)
        }
      when(tutkintoRepository.haeTutkinnotHakemusOidilla(any[HakemusOid])).thenReturn(Seq())

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
      hakemusService.paivitaTiedotAtarusta(hakemusOid, ataruHakemusUpdate)

      // Verify
      /* The new form ID should be stored */
      assertEquals(storedFormId, ataruHakemusUpdate.form_id)
    }

    @Test
    def paivitaTiedotAtarustaIgnoresUnchangedFormId(): Unit = {
      // Data
      val hakemusOid         = HakemusOid("poop")
      val dbHakemus          = makeDbHakemus(hakemusOid, 5)
      val ataruHakemusUpdate = makeAtaruHakemusupdate(5)

      // Spy variables
      var formUpdateCalled = false

      // Mock setup
      when(hakemusRepository.haeHakemus(any[HakemusOid])).thenReturn(Some(dbHakemus))
      when(ataruHakemusParser.parseHakemusKoskee(any[Content])).thenReturn(1)
      when(ataruHakemusParser.onkoHakemusPeruutettu(any[Content])).thenReturn(false)
      when(kasittelyVaiheService.resolveKasittelyVaihe(any[DbHakemus], any[AtaruTilaPaivitys]))
        .thenReturn(KasittelyVaihe.ValmisKasiteltavaksi)
      when(ataruHakemusParser.parseTutkinnot(any[UUID], any[Content]))
        .thenAnswer { invocation =>
          val uuid = invocation.getArgument[UUID](0)
          createTutkinnotFixtureBeforeMuuttuneetTutkinnot(uuid)
        }
      when(tutkintoRepository.haeTutkinnotHakemusOidilla(any[HakemusOid])).thenReturn(Seq())

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
      hakemusService.paivitaTiedotAtarusta(hakemusOid, ataruHakemusUpdate)

      // Verify
      /* Update function should not be called */
      assertEquals(formUpdateCalled, false)
    }
  }

  @Test
  def haeHakemusPalauttaaMuokkaajanNimen(): Unit = {

    // Data
    val hakemusOid         = HakemusOid("poop")
    val dbHakemus          = makeDbHakemus(hakemusOid, 5)
    val ataruHakemusUpdate = makeAtaruHakemusupdate(5)
    val hakemusMap         =
      ataruHakemusUpdate.productElementNames.toList.zip(ataruHakemusUpdate.productIterator.toList).toMap ++
        Map(
          "key"                       -> "",
          "etunimet"                  -> "Jorma Kerttu",
          "sukunimi"                  -> "",
          "state"                     -> "",
          "lang"                      -> "",
          "person-oid"                -> "",
          "latest-attachment-reviews" -> Seq(),
          "hakutoiveet"               -> Seq()
        )
    val ataruHakemusJsonString = mapper.writeValueAsString(hakemusMap)
    val lomakeJsonString       = loadJson("ataruLomake.json")
    val hakija                 = makeHakija()
    val henkilo                = makeOnrUser()

    // Mock setup
    when(hakemusRepository.haeHakemus(any[HakemusOid])).thenReturn(Some(dbHakemus))
    when(hakemuspalveluService.haeHakemus(any[HakemusOid])).thenReturn(Right(ataruHakemusJsonString))
    when(hakemuspalveluService.haeLomake(any[Long])).thenReturn(Right(lomakeJsonString))
    when(ataruHakemusParser.parseHakija(any[AtaruHakemus])).thenReturn(hakija)
    when(ataruHakemusParser.parseTutkinnot(any[UUID], any[Content])).thenReturn(Seq())
    when(onrService.haeHenkilo(any[String])).thenReturn(Right(henkilo))
    when(tutkintoRepository.haeTutkinnotHakemusOidilla(any[HakemusOid])).thenReturn(Seq())

    when(onrService.haeNimi(any[Option[String]])).thenReturn("Topolino")

    // Act
    val hakemus: Hakemus = hakemusService.haeHakemus(hakemusOid).get

    // Verify
    assertEquals(hakemus.muokkaaja, "Topolino")
  }
}
