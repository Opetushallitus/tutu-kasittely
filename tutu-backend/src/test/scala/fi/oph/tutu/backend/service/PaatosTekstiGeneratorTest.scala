package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.UnitTestBase
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.fixture.*
import org.junit.jupiter.api.Assertions.assertLinesMatch
import org.junit.jupiter.api.{BeforeEach, Test}
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.when
import org.mockito.{Mock, MockitoAnnotations}

import java.time.LocalDateTime
import java.util.UUID
import scala.jdk.CollectionConverters.*
import fi.oph.tutu.backend.service.generator.paatosteksti.PaatosTekstiGenerator
import com.fasterxml.jackson.databind.ObjectMapper
import org.mockito.Mockito
import org.springframework.test.util.ReflectionTestUtils
import org.springframework.cache.{Cache, CacheManager}

val paatostekstiTranslations = Map[String, String](
  "paatosteksti.maksunOikaisu" -> "<strong>Maksun oikaisu</strong><p>Päätöksestä perityt maksut perustuvat opetus- ja kulttuuriministeriön asetukseen Opetushallituksen ja sen erillisyksiköiden suoritteiden maksullisuudesta (1508/2025, 1 ja 2 §). Maksuihin voi vaatia oikaisua Opetushallitukselta. Liitteenä olevasta oikaisuvaatimusosoituksesta ilmenee oikaisuvaatimuksen määräaika ja se, miten oikaisua vaadittaessa on meneteltävä.</p><p>Käsittelymaksu 100 euroa</p>{paatosMaksu}",

  "paatosteksti.maksunOikaisu.paatosMaksu" -> "<p>Päätösmaksu 395 euroa</p>",

  "paatosteksti.tasoPaatosLaki" -> "<strong>Lainkohdat, joihin päätös perustuu</strong><p>Laki ulkomailla suoritettujen korkeakouluopintojen tuottamasta virkakelpoisuudesta (1385/2015), 2, 3 ja 6 §</p>",

  "paatosteksti.tasoPaatosPerusteluBody" -> "<p>Opetushallitus on arvioinut hakijan tutkinnon{tutkintoNimi} vastaavan tasoltaan Suomessa suoritettavaa {koulu} korkeakoulututkintoa. Arvio perustuu siihen, että tutkintoon johtanut korkeakouluopintojen kokonaisuus vastaa laajuudeltaan, vaativuudeltaan ja suuntautumiseltaan {koulu}n korkeakoulututkintoon johtavaa korkeakouluopintojen kokonaisuutta.</p>",

  "paatosteksti.tasoPaatos.myonteinen" -> "<p>Hakijan suorittama korkeakoulututkinto{tutkintoNimi} rinnastetaan Suomessa suoritettavaan {koulu}n korkeakoulututkintoon.</p>",

  "paatosteksti.valitusoikeus" -> "<strong>Valitusoikeus</strong><p>Tähän päätökseen saa hakea muutosta valittamalla {hallintoOikeus}. Liitteenä olevasta valitusosoituksesta ilmenee valituksen määräaika ja se, miten muutosta haettaessa on meneteltävä.</p>",

  "paatosteksti.todistuksenPaivamaara"     -> "Todistuksen päivämäärä: {paivamaara}",
  "paatosteksti.hakija"                    -> "Hakija:",
  "paatosteksti.tasoPaatosPerusteluHeader" -> "<strong>Perustelu</strong>",
  "paatosteksti.muuTutkinto"               -> "Muu tutkinto",

  "paatosteksti.tasoPaatos.kielteinen" -> "<p>Hakijan suorittamaa tutkintoa ei rinnasteta Suomessa suoritettavaan korkeakoulututkintoon.</p>",

  "paatosteksti.peruutus" -> "<strong>Päätös</strong><p>Hakija on peruuttanut hakemuksensa {peruutusPvm}. Hakemuksen käsittely raukeaa.</p>",

  "paatosteksti.tutkinnonTaso.valitse" -> "<p>Valitse tutkinnon taso.</p>",
  "paatosteksti.todo"                  -> "<p>Tällä hetkellä esikatselua ei ole saatavilla.</p>"
)

class PaatosTekstiGeneratorTest extends UnitTestBase {

  @Mock
  var maakoodiService: MaakoodiService = _

  @Mock
  var httpService: HttpService = _

  @Mock
  var mockCacheManager: CacheManager = _

  @Mock
  var mockCache: Cache = _

  var translationService: TranslationService = _

  var paatosTekstiGenerator: PaatosTekstiGenerator = _

  private val hakemusUUID = UUID.randomUUID()
  private val tutkintoId1 = UUID.randomUUID()
  private val tutkintoId2 = UUID.randomUUID()
  private val tutkintoId3 = UUID.randomUUID()
  private val tutkintoId4 = UUID.randomUUID()

  private val tutkinnot: Seq[Tutkinto] =
    createTutkinnotFixture(hakemusUUID)
      .zip(Seq(tutkintoId1, tutkintoId2, tutkintoId3, tutkintoId4))
      .map { case (t, id) => t.copy(id = Some(id)) }

  private val hallintoOikeus = HallintoOikeus(
    id = Some(UUID.fromString("9d36433f-c391-4f45-81e7-d14f95236ce9")),
    koodi = "HAMEENLINNA",
    nimi = Map(
      Kieli.fi -> "Hämeenlinnan hallinto-oikeus",
      Kieli.sv -> "Tavastehus förvaltningsdomstol",
      Kieli.en -> "Hämeenlinna Administrative Court"
    ),
    osoite = Some(
      Map(
        Kieli.fi -> "Koulukatu 9, 13100 Hämeenlinna",
        Kieli.sv -> "Koulukatu 9, 13100 Tavastehus",
        Kieli.en -> "Koulukatu 9, 13100 Hämeenlinna"
      )
    ),
    puhelin = Some("029 56 46000"),
    sahkoposti = Some("hameenlinna.ho@oikeus.fi"),
    verkkosivu = Some(
      Map(
        Kieli.fi -> "https://oikeus.fi/hameenlinna",
        Kieli.sv -> "https://oikeus.fi/hameenlinna/sv",
        Kieli.en -> "https://oikeus.fi/hameenlinna/en"
      )
    )
  )

  private def makeHakemus(peruutusPvm: Option[LocalDateTime] = None): Hakemus =
    Hakemus(
      hakemusOid = "1.2.246.562.11.00000000000000006667",
      lomakeOid = "",
      lomakeId = 1527182,
      lomakkeenKieli = "fi",
      hakija = hakijaFixture,
      sisalto = Seq.empty,
      liitteidenTilat = Seq.empty,
      hakemusKoskee = 1,
      ataruHakemuksenTila = AtaruHakemuksenTila.Kasittelyssa,
      kasittelyVaihe = KasittelyVaihe.AlkukasittelyKesken,
      muokkaaja = "",
      esittelijanHuomioita = None,
      peruutusPvm = peruutusPvm
    )

  @BeforeEach
  def init(): Unit = {
    MockitoAnnotations.openMocks(this)

    // Tyhjä cache
    when(mockCacheManager.getCache("translations")).thenReturn(mockCache)
    when(mockCache.get(any[String])).thenReturn(null)

    // Käytetään spyta, jotta testataan oikealla koodilla parametrien korvausta
    val realService = new TranslationService(httpService, new ObjectMapper())
    ReflectionTestUtils.setField(realService, "cacheManager", mockCacheManager)
    translationService = Mockito.spy(realService)

    paatosTekstiGenerator = new PaatosTekstiGenerator(
      translationService = translationService
    )

    Mockito
      .doAnswer(i => {
        val key = i.getArguments.apply(1).asInstanceOf[String]
        paatostekstiTranslations.applyOrElse(key, key => key)
      })
      .when(translationService)
      .getTranslation(any[Kieli], any[String])

    when(maakoodiService.getMaakoodiByUri(any[String])).thenReturn(
      Some(
        Maakoodi(
          id = UUID.randomUUID(),
          esittelijaId = None,
          koodiUri = "",
          fi = "Suomenmaa",
          sv = "Ruotsinmaa",
          en = "Englanninmaa"
        )
      )
    )
  }

  private def assertHtml(actual: String, fixtureName: String): Unit = {
    System.out.println(s"Actual:\n${prettify(actual).mkString("\n")}\n")

    def prettify(html: String): List[String] =
      html.replaceAll("(<br>|</p>|</strong>)", "$1\n").split("\\n").toList

    val expectedRaw = scala.io.Source.fromResource(fixtureName).mkString

    assertLinesMatch(expectedRaw.split("\\n").toList.asJava, prettify(actual).asJava)
  }

  @Test
  def paatosTasoGeneroiOikeanTekstin(): Unit = {
    val paatos = Paatos(
      ratkaisutyyppi = Some(Ratkaisutyyppi.Paatos),
      paatosTiedot = Seq(
        PaatosTieto(
          paatosTyyppi = Some(PaatosTyyppi.Taso),
          tutkintoId = Some(tutkintoId1),
          lisaaTutkintoPaatostekstiin = None,
          myonteinenPaatos = Some(true),
          kielteisenPaatoksenPerustelut = None,
          tutkintoTaso = Some(TutkintoTaso.YlempiKorkeakoulu)
        ),
        PaatosTieto(
          paatosTyyppi = Some(PaatosTyyppi.Taso),
          tutkintoId = Some(tutkintoId2),
          lisaaTutkintoPaatostekstiin = Some(true),
          myonteinenPaatos = Some(true),
          kielteisenPaatoksenPerustelut = None,
          tutkintoTaso = Some(TutkintoTaso.AlempiKorkeakoulu)
        )
      )
    )
    assertHtml(
      this.paatosTekstiGenerator
        .generatePaatosTeksti(makeHakemus(), tutkinnot, paatos, Kieli.fi, hallintoOikeus, maakoodiService),
      "paatosteksti_paatos_taso.html"
    )
  }

  @Test
  def kielteinenPaatosTasoGeneroiOikeanTekstin(): Unit = {
    val paatos = Paatos(
      ratkaisutyyppi = Some(Ratkaisutyyppi.Paatos),
      paatosTiedot = Seq(
        PaatosTieto(
          paatosTyyppi = Some(PaatosTyyppi.Taso),
          tutkintoId = Some(tutkintoId1),
          lisaaTutkintoPaatostekstiin = None,
          myonteinenPaatos = Some(false),
          kielteisenPaatoksenPerustelut = Some(
            KielteisenPaatoksenPerustelut(
              epavirallinenKorkeakoulu = true,
              epavirallinenTutkinto = true,
              eiVastaaSuomessaSuoritettavaaTutkintoa = true,
              muuPerustelu = true,
              muuPerusteluKuvaus = Some("Muu perustelu kuvaus")
            )
          )
        )
      )
    )

    assertHtml(
      this.paatosTekstiGenerator.generatePaatosTeksti(
        makeHakemus(),
        tutkinnot.filter(_.id == Some(tutkintoId1)), // Yksi tutkinto vain
        paatos,
        Kieli.fi,
        hallintoOikeus,
        maakoodiService
      ),
      "paatosteksti_kielteinen_paatos_taso.html"
    )
  }

  @Test
  def paatosKelpoisuusGeneroiOikeanTekstin(): Unit = {
    val paatos = Paatos(
      ratkaisutyyppi = Some(Ratkaisutyyppi.Paatos),
      paatosTiedot = Seq(
        PaatosTieto(
          paatosTyyppi = Some(PaatosTyyppi.Kelpoisuus)
        )
      )
    )
    assertHtml(
      this.paatosTekstiGenerator
        .generatePaatosTeksti(makeHakemus(), tutkinnot, paatos, Kieli.fi, hallintoOikeus, maakoodiService),
      "paatosteksti_paatos_common.html"
    )
  }

  @Test
  def paatosTiettyTutkintoTaiOpinnotGeneroiOikeanTekstin(): Unit = {
    val paatos = Paatos(
      ratkaisutyyppi = Some(Ratkaisutyyppi.Paatos),
      paatosTiedot = Seq(
        PaatosTieto(
          paatosTyyppi = Some(PaatosTyyppi.TiettyTutkintoTaiOpinnot)
        )
      )
    )
    assertHtml(
      this.paatosTekstiGenerator
        .generatePaatosTeksti(makeHakemus(), tutkinnot, paatos, Kieli.fi, hallintoOikeus, maakoodiService),
      "paatosteksti_paatos_common.html"
    )
  }

  @Test
  def paatosRiittavatOpinnotGeneroiOikeanTekstin(): Unit = {
    val paatos = Paatos(
      ratkaisutyyppi = Some(Ratkaisutyyppi.Paatos),
      paatosTiedot = Seq(
        PaatosTieto(
          paatosTyyppi = Some(PaatosTyyppi.RiittavatOpinnot)
        )
      )
    )
    assertHtml(
      this.paatosTekstiGenerator
        .generatePaatosTeksti(makeHakemus(), tutkinnot, paatos, Kieli.fi, hallintoOikeus, maakoodiService),
      "paatosteksti_paatos_common.html"
    )
  }

  @Test
  def peruutusTaiRaukeaminenGeneroiOikeanTekstin(): Unit = {
    val paatos = Paatos(
      ratkaisutyyppi = Some(Ratkaisutyyppi.PeruutusTaiRaukeaminen),
      peruutuksenTaiRaukeamisenSyy = Some(PeruutuksenTaiRaukeamisenSyy(muuSyy = Some(true)))
    )
    assertHtml(
      this.paatosTekstiGenerator.generatePaatosTeksti(
        makeHakemus(peruutusPvm = Some(LocalDateTime.parse("2026-03-13T00:00:00"))),
        tutkinnot,
        paatos,
        Kieli.fi,
        hallintoOikeus,
        maakoodiService
      ),
      "paatosteksti_peruutus.html"
    )
  }

  @Test
  def oikaisuGeneroiTodoTekstin(): Unit = {
    val paatos = Paatos(ratkaisutyyppi = Some(Ratkaisutyyppi.Oikaisu))
    assertHtml(
      this.paatosTekstiGenerator
        .generatePaatosTeksti(makeHakemus(), tutkinnot, paatos, Kieli.fi, hallintoOikeus, maakoodiService),
      "paatosteksti_todo.html"
    )
  }

  @Test
  def jatetaanTutkimattaGeneroiTodoTekstin(): Unit = {
    val paatos = Paatos(ratkaisutyyppi = Some(Ratkaisutyyppi.JatetaanTutkimatta))
    assertHtml(
      this.paatosTekstiGenerator
        .generatePaatosTeksti(makeHakemus(), tutkinnot, paatos, Kieli.fi, hallintoOikeus, maakoodiService),
      "paatosteksti_todo.html"
    )
  }

  @Test
  def siirtoGeneroiTodoTekstin(): Unit = {
    val paatos = Paatos(ratkaisutyyppi = Some(Ratkaisutyyppi.Siirto))
    assertHtml(
      this.paatosTekstiGenerator
        .generatePaatosTeksti(makeHakemus(), tutkinnot, paatos, Kieli.fi, hallintoOikeus, maakoodiService),
      "paatosteksti_todo.html"
    )
  }
}
