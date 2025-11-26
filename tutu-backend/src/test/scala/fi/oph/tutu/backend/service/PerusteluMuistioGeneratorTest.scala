package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.UnitTestBase
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.service.generator.perustelumuistio.*
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.{BeforeEach, Test}
import fi.oph.tutu.backend.fixture.*
import fi.oph.tutu.backend.utils.Constants

import java.util.UUID
import java.time.format.DateTimeFormatter
import java.time.LocalDateTime
import org.mockito.Mockito.when
import org.mockito.{Mock, MockitoAnnotations}
import org.mockito.ArgumentMatchers.any

class PerusteluMuistioGeneratorTest extends UnitTestBase {

  val noneHakemus: Option[Hakemus]           = None
  val noneAtaruHakemus: Option[AtaruHakemus] = None
  val nonePerustelu: Option[Perustelu]       = None
  val noneMuistio: Option[Muistio]           = None

  val emptyPerustelu: Option[Perustelu] = Some(
    Perustelu(
      id = None,
      hakemusId = None,
      virallinenTutkinnonMyontaja = None,
      virallinenTutkinto = None,
      lahdeLahtomaanKansallinenLahde = false,
      lahdeLahtomaanVirallinenVastaus = false,
      lahdeKansainvalinenHakuteosTaiVerkkosivusto = false,
      selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta = "",
      ylimmanTutkinnonAsemaLahtomaanJarjestelmassa = None,
      selvitysTutkinnonAsemastaLahtomaanJarjestelmassa = "",
      aikaisemmatPaatokset = None,
      jatkoOpintoKelpoisuus = None,
      jatkoOpintoKelpoisuusLisatieto = None,
      muuPerustelu = None,
      lausuntoPyyntojenLisatiedot = None,
      lausunnonSisalto = None,
      lausuntopyynnot = Seq.empty,
      luotu = None,
      luoja = None,
      muokattu = None,
      muokkaaja = None,
      uoRoSisalto = UoRoSisalto(),
      apSisalto = APSisalto(
        IMIHalytysTarkastettu = None
      )
    )
  )

  val someHakemus: Option[Hakemus] = Some(
    Hakemus(
      hakemusOid = UUID.randomUUID().toString,
      lomakeOid = UUID.randomUUID().toString,
      lomakeId = 1527182,
      lomakkeenKieli = "en",
      hakija = hakijaFixture,
      sisalto = Seq(
        SisaltoItem(
          key = Constants.ATARU_HAKEMUS_KOSKEE.generatedId,
          fieldType = "String",
          value = Seq(
            SisaltoValue(
              label = Map(
                Kieli.fi -> "HakemusKoskee -- fi",
                Kieli.sv -> "HakemusKoskee -- sv",
                Kieli.en -> "HakemusKoskee -- en"
              ),
              value = "",
              followups = Seq.empty
            )
          ),
          label = Map(
            Kieli.fi -> "Hakemus koskee",
            Kieli.sv -> "Hakemus koskee",
            Kieli.en -> "Hakemus koskee"
          ),
          children = Seq.empty,
          infoText = None
        ),
        SisaltoItem(
          key = Constants.ATARU_SAHKOISEN_ASIOINNIN_LUPA.generatedId,
          fieldType = "String",
          value = Seq(
            SisaltoValue(
              label = Map(
                Kieli.fi -> "Sähköinen asiointi sallittu: Kyllä",
                Kieli.sv -> "Sähköinen asiointi sallittu: Kyllä",
                Kieli.en -> "Sähköinen asiointi sallittu: Kyllä"
              ),
              value = "",
              followups = Seq.empty
            )
          ),
          label = Map(
            Kieli.fi -> "Sähköinen asiointi sallittu",
            Kieli.sv -> "Sähköinen asiointi sallittu",
            Kieli.en -> "Sähköinen asiointi sallittu"
          ),
          children = Seq.empty,
          infoText = None
        )
      ),
      liitteidenTilat = Seq.empty,
      hakemusKoskee = 1,
      asiatunnus = None,
      kirjausPvm = None,
      esittelyPvm = None,
      paatosPvm = None,
      esittelijaOid = None,
      ataruHakemuksenTila = AtaruHakemuksenTila.Kasittelyssa,
      kasittelyVaihe = KasittelyVaihe.AlkukasittelyKesken,
      muokattu = None,
      muutosHistoria = Seq.empty,
      taydennyspyyntoLahetetty = None,
      yhteistutkinto = true,
      tutkinnot = Seq(
        Tutkinto(
          id = None,
          jarjestys = "MUU",
          hakemusId = UUID.randomUUID,
          nimi = None,
          oppilaitos = None,
          muuTutkintoTieto = Some("Muu tutkinto sisältö")
        ),
        Tutkinto(
          id = None,
          jarjestys = "1",
          hakemusId = UUID.randomUUID,
          nimi = Some("Paras tutkinto"),
          oppilaitos = None,
          maakoodiUri = Some("mock_maakoodiuri"),
          aloitusVuosi = Some(2000),
          paattymisVuosi = Some(2001),
          ohjeellinenLaajuus = Some("20op"),
          opinnaytetyo = Some(true),
          harjoittelu = Some(false),
          perustelunLisatietoja = Some("Vastaa perusopintoja"),
          koulutusalaKoodiUri = Some("testi-koulutusala-uri")
        )
      ),
      asiakirja = Some(
        Asiakirja(
          selvityksetSaatu = true,
          valmistumisenVahvistus = ValmistumisenVahvistus(
            valmistumisenVahvistus = true,
            valmistumisenVahvistusPyyntoLahetetty = None,
            valmistumisenVahvistusSaatu = None,
            valmistumisenVahvistusVastaus = Some(ValmistumisenVahvistusVastaus.Myonteinen),
            valmistumisenVahvistusLisatieto = None
          ),
          imiPyynto = ImiPyynto(
            imiPyynto = Some(true),
            imiPyyntoNumero = Some("IMI-nro 3"),
            imiPyyntoLahetetty = Some(LocalDateTime.of(2020, 5, 15, 0, 0)),
            imiPyyntoVastattu = Some(LocalDateTime.of(2020, 6, 1, 0, 0))
          )
        )
      )
    )
  )

  val someAtaruHakemus: Option[AtaruHakemus] = Some(
    AtaruHakemus(
      haku = None,
      etunimet = "Testi Kolmas",
      key = "",
      form_id = 1,
      content = Content(
        answers = Seq(
          Answer(
            key = Constants.ATARU_SAHKOISEN_ASIOINNIN_LUPA.generatedId,
            value = SingleValue("0"),
            fieldType = ""
          )
        )
      ),
      created = "",
      state = "",
      modified = "",
      submitted = "",
      lang = "en",
      sukunimi = "Hakija",
      `application-review-notes` = None,
      henkilotunnus = None,
      `person-oid` = UUID.randomUUID().toString,
      `application-hakukohde-attachment-reviews` = Seq.empty,
      `application-hakukohde-reviews` = Seq.empty,
      hakutoiveet = Seq.empty,
      `information-request-timestamp` = None
    )
  )

  val somePerustelu: Option[Perustelu] = Some(
    Perustelu(
      id = Some(UUID.randomUUID()),
      hakemusId = Some(UUID.randomUUID()),
      virallinenTutkinnonMyontaja = Some(true),
      virallinenTutkinto = Some(true),
      lahdeLahtomaanKansallinenLahde = true,
      lahdeLahtomaanVirallinenVastaus = true,
      lahdeKansainvalinenHakuteosTaiVerkkosivusto = true,
      selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta = "Selvitetty",
      ylimmanTutkinnonAsemaLahtomaanJarjestelmassa = Some("alempi_korkeakouluaste"),
      selvitysTutkinnonAsemastaLahtomaanJarjestelmassa = "Selvitetty",
      aikaisemmatPaatokset = Some(true),
      jatkoOpintoKelpoisuus = Some("tieteellisiin_jatko-opintoihin"),
      jatkoOpintoKelpoisuusLisatieto = None,
      muuPerustelu = Some("Hyvin suoritettu"),
      lausuntoPyyntojenLisatiedot = None,
      lausunnonSisalto = Some("Hakija on suorittanut tutkinnon kirjeopintoina"),
      lausuntopyynnot = Seq(
        Lausuntopyynto(
          id = None,
          perusteluId = None,
          lausunnonAntajaKoodiUri = Some("testi-korkeakoulu"),
          lausunnonAntajaMuu = None,
          lahetetty = Some(
            LocalDateTime.parse("2025-07-01T00:00:00.000Z", DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSX"))
          ),
          saapunut = Some(
            LocalDateTime.parse("2025-07-02T00:00:00.000Z", DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSX"))
          )
        ),
        Lausuntopyynto(
          id = None,
          perusteluId = None,
          lausunnonAntajaKoodiUri = Some("muu"),
          lausunnonAntajaMuu = Some("HOKS tuutori"),
          lahetetty = Some(
            LocalDateTime.parse("2025-07-01T00:00:00.000Z", DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSX"))
          ),
          saapunut = None
        )
      ),
      luotu = None,
      luoja = None,
      muokattu = None,
      muokkaaja = None,
      uoRoSisalto = UoRoSisalto(
        opettajatEroMonialaisetOpinnotSisalto = Some(true),
        opettajatMuuEro = Some(true),
        opettajatMuuEroSelite = Some("Tutkinto ei vaadi opetusnäytettä")
      ),
      apSisalto = APSisalto(
        lakiperusteToisessaJasenmaassaSaannelty = Some(true),
        lakiperustePatevyysLahtomaanOikeuksilla = Some(true),
        lakiperusteToinenEUmaaTunnustanut = Some(true),
        lakiperusteLahtomaassaSaantelematon = Some(true),
        todistusEUKansalaisuuteenRinnasteisestaAsemasta = Some("todistus"),
        ammattiJohonPatevoitynyt = Some("lähihoitaja"),
        ammattitoiminnanPaaAsiallinenSisalto = Some("käytännön työ"),
        koulutuksenKestoJaSisalto = Some("alusta loppuun asti"),
        selvityksetLahtomaanViranomaiselta = Some(true),
        selvityksetLahtomaanLainsaadannosta = Some(true),
        selvityksetAikaisempiTapaus = Some(true),
        selvityksetAikaisemmanTapauksenAsiaTunnus = Some("asia #6"),
        selvityksetIlmeneeAsiakirjoista = Some(true),
        lisatietoja = Some("annetaan pyydettäessä"),
        IMIHalytysTarkastettu = Some(true),
        muutAPPerustelut = Some("pätevä on"),
        SEUTArviointi = Some("hyväksi todettu")
      )
    )
  )

  val someKoulutuksenSisaltoMuistio: Option[Muistio] = Some(
    Muistio(
      id = UUID.randomUUID,
      hakemus_id = UUID.randomUUID,
      sisalto = "Koulutuksen sisältö muistio -- body",
      luotu = LocalDateTime.of(2020, 5, 15, 0, 0),
      luoja = "",
      muokkaaja = ""
    )
  )

  val someMuuTutkintoMuistio: Option[Muistio] = Some(
    Muistio(
      id = UUID.randomUUID,
      hakemus_id = UUID.randomUUID,
      sisalto = "Muu tutkinto tai opintosuoritus -- body",
      luotu = LocalDateTime.of(2020, 5, 15, 0, 0),
      luoja = "",
      muokkaaja = ""
    )
  )

  val someAsiakirjaMuistio: Option[Muistio] = Some(
    Muistio(
      id = UUID.randomUUID,
      hakemus_id = UUID.randomUUID,
      sisalto = "Muistioon merkittävää tekstiä asiakirjoista -- body",
      luotu = LocalDateTime.of(2020, 5, 15, 0, 0),
      luoja = "",
      muokkaaja = ""
    )
  )

  @Mock
  var koodistoService: KoodistoService = _

  def setupKorkeakoulut(): Unit = {
    when(koodistoService.haeKorkeakoulut()).thenReturn(
      Seq(
        KoodistoItem(
          koodiUri = "testi-korkeakoulu",
          koodiArvo = "testi-korkeakoulu",
          nimi = Map(
            Kieli.fi -> "Paras korkeakoulu",
            Kieli.sv -> "Bästa högskolan",
            Kieli.en -> "Best college"
          ),
          voimassaAlkuPvm = None,
          voimassaLoppuPvm = None,
          tila = None
        )
      )
    )
  }

  def setupKoulutusalat(): Unit = {
    when(koodistoService.getKoodisto("kansallinenkoulutusluokitus2016koulutusalataso1"))
      .thenReturn(
        Seq(
          KoodistoItem(
            koodiUri = "testi-koulutusala-uri",
            koodiArvo = "testi-koulutusala-uri",
            nimi = Map(
              Kieli.fi -> "Alkutuotanto",
              Kieli.sv -> "Bästa production",
              Kieli.en -> "Primary production"
            ),
            voimassaAlkuPvm = None,
            voimassaLoppuPvm = None,
            tila = None
          )
        )
      )
  }

  @Mock
  var maakoodiService: MaakoodiService = _

  def setupMaakoodit(): Unit = {
    when(maakoodiService.getMaakoodiByUri(any[String])).thenReturn(
      Some(
        Maakoodi(
          id = UUID.randomUUID,
          esittelijaId = None,
          koodiUri = "",
          fi = "Suomenmaa",
          sv = "Ruotsinmaa",
          en = "Englanninmaa"
        )
      )
    )
  }

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
  }

  @Test
  def generatesAnEmptyStringWhenInputsAreEmpty(): Unit = {
    setupMaakoodit()
    setupKorkeakoulut()
    setupKoulutusalat()

    val result = generate(
      koodistoService,
      maakoodiService,
      noneHakemus,
      noneAtaruHakemus,
      nonePerustelu,
      noneMuistio,
      noneMuistio,
      noneMuistio
    )
    assert(result.isEmpty)
  }

  @Test
  def generatesAStringWhenInputsDefined(): Unit = {
    setupMaakoodit()
    setupKorkeakoulut()
    setupKoulutusalat()

    val result = generate(
      koodistoService,
      maakoodiService,
      someHakemus,
      someAtaruHakemus,
      somePerustelu,
      someKoulutuksenSisaltoMuistio,
      someMuuTutkintoMuistio,
      someAsiakirjaMuistio
    )
    assert(!result.isEmpty)
  }

  @Test
  def haeHakijanNimiProducesString(): Unit = {
    val result = haeHakijanNimi(someHakemus)
    assert(result.get.contains(hakijaFixture.etunimet))
    assert(result.get.contains(hakijaFixture.sukunimi))
  }

  @Test
  def haeHakijanSyntymaaikaProducesString(): Unit = {
    val result = haeHakijanSyntymaaika(someHakemus)
    assert(result.get.contains(hakijaFixture.syntymaaika))
  }

  @Test
  def haeHakemusKoskeeProducesString(): Unit = {
    val result = haeHakemusKoskee(someHakemus)
    assert(result.get.contains("HakemusKoskee -- en"))
  }

  @Test
  def haeSuostumusSahkoiseenAsiointiinProducesString(): Unit = {
    val result = haeSuostumusSahkoiseenAsiointiin(someHakemus)
    assert(result.get.contains("Sähköinen asiointi sallittu"))
  }

  @Test
  def haeMuuTutkintoProducesString(): Unit = {
    val result = haeMuuTutkinto(someHakemus)
    assert(result.get.contains("Muu tutkinto sisältö"))
  }

  @Test
  def haeYhteistutkintoProducesString(): Unit = {
    val result = haeYhteistutkinto(someHakemus)
    assert(result.get.contains("Yhteistutkinto"))
  }

  @Test
  def haeTutkintokohtaisetTiedotProducesString(): Unit = {
    setupMaakoodit()
    setupKoulutusalat()

    val result = haeTutkintokohtaisetTiedot(maakoodiService, koodistoService, someHakemus)
    assert(result.get.contains("Nimi: Paras tutkinto"))
    assert(result.get.contains("Korkeakoulun tai oppilaitoksen sijaintimaa: Englanninmaa"))
    assert(result.get.contains("Suoritusvuodet: 2000 - 2001"))
    assert(result.get.contains("Ohjeellinen laajuus: 20op"))
    assert(result.get.contains("Tutkintoon sisältyi opinnäytetyö: Kyllä"))
    assert(result.get.contains("Tutkintoon sisältyi harjoittelu: Ei"))
    assert(result.get.contains("Lisätietoja opinnäytteisiin tai harjoitteluun liittyen"))
    assert(result.get.contains("Vastaa perusopintoja"))
    assert(result.get.contains("Koulutusala: Alkutuotanto"))
  }

  @Test
  def haeYleisetPerustelutProducesNoneForNone(): Unit = {
    val result = haeYleisetPerustelut(nonePerustelu)
    assert(result.isEmpty)
  }

  @Test
  def haeYleisetPerustelutProducesNoneForEmptyPerustelu(): Unit = {
    val result = haeYleisetPerustelut(emptyPerustelu)
    assert(result.isEmpty)
  }

  @Test
  def haeYleisetPerustelutProducesStringForDataInPerustelu(): Unit = {
    val result = haeYleisetPerustelut(somePerustelu)

    assert(result.nonEmpty)
    assert(result.get.contains("Virallinen tutkinnon myöntäjä"))
    assert(result.get.contains("Virallinen tutkinto"))
    assert(result.get.contains("Lähde: Lähtömaan kansallinen lähde"))
    assert(result.get.contains("Lähde: Lähtömaan virallinen vastaus"))
    assert(result.get.contains("Lähde: Kansainvälinen hakuteos tai verkkosivusto"))
    assert(result.get.contains("Lyhyt selvitys tutkinnon myöntäjästä ja tutkinnon virallisuudesta"))
    assert(result.get.contains("Ylimmän tutkinnon asema lähtömaan järjestelmässä"))
    assert(result.get.contains("Lyhyt selvitys tutkinnon asemasta lähtömaan järjestelmässä"))
  }

  @Test
  def haeJatkoOpintoKelpoisuusProducesString(): Unit = {
    val result = haeJatkoOpintoKelpoisuus(somePerustelu)

    assert(result.get.contains("Jatko-opintokelpoisuus: tieteellisiin jatko-opintoihin"))
  }

  @Test
  def haeJatkoOpintoKelpoisuusMuuProducesString(): Unit = {
    val result = haeJatkoOpintoKelpoisuus(
      somePerustelu.map(perustelu =>
        perustelu.copy(
          jatkoOpintoKelpoisuus = Some("muu"),
          jatkoOpintoKelpoisuusLisatieto = Some("Jatkoon")
        )
      )
    )

    assert(result.get.contains("Jatko-opintokelpoisuus: muu"))
    assert(result.get.contains("Jatko-opintokelpoisuuus, lisätieto"))
    assert(result.get.contains("Jatkoon"))
  }

  @Test
  def haeAikaisemmatPaatoksetProducesString(): Unit = {
    val result = haeAikaisemmatPaatokset(somePerustelu)

    assert(result.get.contains("Opetushallitus on tehnyt vastaavia päätöksiä: Kyllä"))
  }

  @Test
  def haeMuuPerusteluProducesString(): Unit = {
    val result = haeMuuPerustelu(somePerustelu)

    assert(result.get.contains("Ratkaisun tai päätöksen muut perustelut"))
    assert(result.get.contains("Hyvin suoritettu"))
  }

  @Test
  def haeUoRoPerusteluProducesString(): Unit = {
    val result = haeUoRoPerustelu(somePerustelu, someKoulutuksenSisaltoMuistio, someMuuTutkintoMuistio)

    assert(result.get.contains("Ero monialaisten opintojen sisällössä"))
    assert(result.get.contains("Muu ero"))
    assert(result.get.contains("Tutkinto ei vaadi opetusnäytettä"))

    assert(result.get.contains("Koulutuksen sisältö muistio -- body"))
    assert(result.get.contains("Muu tutkinto tai opintosuoritus -- body"))
  }

  @Test
  def haeApPerusteluProducesString(): Unit = {
    val result = haeApPerustelu(somePerustelu)

    assert(
      result.get.contains(
        "Toisessa jäsenmaassa säänneltyyn ammattiin johtanut koulutus tai säännelty ammatillinen koulutus"
      )
    )
    assert(result.get.contains("Pätevyys ammattiin lähtömaassa saavutettujen oikeuksien nojalla"))
    assert(
      result.get.contains(
        "EU-kansalaisen EU:n ulkopuolella hankkima ammattipätevyys, jonka toinen EU-maa on tunnustanut, ja henkilöllä on jäsenmaassa hankittu"
      )
    )
    assert(
      result.get.contains(
        "Lähtömaassa sääntelemätön ammatti tai koulutus ja hakijalla vähintään vuoden ammattikokemus maasta, joka ei sääntele ammattia"
      )
    )

    assert(result.get.contains("Todistus, joka todistaa EU-kansalaisuuteen rinnaisteisen aseman"))
    assert(result.get.contains("Mihin ammattiin hakija on pätevöitynyt toisessa jäsenmaassa"))
    assert(result.get.contains("Ammattitoiminnan pääasiallinen sisältö lähtömaassa"))
    assert(result.get.contains("Koulutuksen kesto ja pääasiallinen sisältö"))

    assert(result.get.contains("Vastaus lähtömaan toimivaltaiselta viranomaiselta"))
    assert(result.get.contains("Selvitetty lähtömaan lainsäädännöstä"))
    assert(result.get.contains("Selvitetty aikaisempien samanlaisten tapausten yhteydessä. Asiatunnus"))
    assert(result.get.contains("Ilmenee hakijan esittämistä asiakirjoista"))

    assert(result.get.contains("Lisätietoja"))
    assert(result.get.contains("IMI-hälytykset tarkistettu"))
    assert(result.get.contains("Muut AP-päätöksen perustelut"))
    assert(result.get.contains("SEUT-arviointi"))
  }

  @Test
  def haeLausuntopyynnotProducesString(): Unit = {
    setupKorkeakoulut()

    val result = haeLausuntopyynnot(koodistoService, somePerustelu)

    assert(result.get.contains("Lausunnon antaja, muu: HOKS tuutori"))
    assert(result.get.contains("Lausunnon antaja: Paras korkeakoulu"))
    assert(result.get.contains("Lausuntopyynnön sisältö:"))
    assert(result.get.contains("Hakija on suorittanut tutkinnon kirjeopintoina"))
  }

  @Test
  def haeAsiakirjatProducesString(): Unit = {
    val result = haeAsiakirjat(someHakemus, someAsiakirjaMuistio)

    assert(result.get.contains("Kaikki tarvittavat selvitykset saatu: Kyllä"))
    assert(result.get.contains("Esittelijän huomioita asiakirjoista"))
    assert(result.get.contains("Muistioon merkittävää tekstiä asiakirjoista -- body"))
    assert(result.get.contains("IMI-nro 3"))
    assert(result.get.contains("01.06.2020"))
    assert(result.get.contains("myönteinen"))
  }
}
