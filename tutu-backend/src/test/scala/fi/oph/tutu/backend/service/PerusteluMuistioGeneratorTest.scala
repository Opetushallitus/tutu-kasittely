package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.UnitTestBase
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.service.perustelumuistio.*
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.{BeforeEach, Test}
import fi.oph.tutu.backend.fixture.*
import fi.oph.tutu.backend.utils.Constants

import java.util.UUID
import java.time.LocalDateTime
import org.mockito.Mockito.when
import org.mockito.{Mock, MockitoAnnotations}
import org.mockito.ArgumentMatchers.any

class PerusteluMuistioGeneratorTest extends UnitTestBase {

  val noneHakemus: Option[Hakemus]           = None
  val noneAtaruHakemus: Option[AtaruHakemus] = None
  val nonePerustelu: Option[Perustelu]       = None
  val noneMuistio: Option[Muistio]           = None

  val someHakemus: Option[Hakemus] = Some(
    Hakemus(
      hakemusOid = UUID.randomUUID().toString,
      lomakeOid = UUID.randomUUID().toString,
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
          oppilaitos = None
        )
      ),
      asiakirja = Some(
        Asiakirja(
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
            value = SingleValue("Sähköinen asiointi sallittu"),
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
        IMIHalytysTarkastettu = Some(true)
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

  @Mock
  var maakoodiService: MaakoodiService = _

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
  }

  @Test
  def generatesAnEmptyStringWhenInputsAreEmpty(): Unit = {
    val result = generate(
      maakoodiService,
      noneHakemus,
      noneAtaruHakemus,
      nonePerustelu,
      noneMuistio
    )
    assert(result.isEmpty)
  }

  @Test
  def generatesAStringWhenInputsDefined(): Unit = {
    val result = generate(
      maakoodiService,
      someHakemus,
      someAtaruHakemus,
      somePerustelu,
      someKoulutuksenSisaltoMuistio
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
    val result = haeSuostumusSahkoiseenAsiointiin(someAtaruHakemus)
    assert(result.get.contains("Sähköinen asiointi sallittu"))
  }

  @Test
  def haeImiPyyntoTietoProducesString(): Unit = {
    val result = haeImiPyyntoTieto(someHakemus)
    assert(result.get.contains("IMI-nro 3"))
    assert(result.get.contains("01.06.2020"))
  }

  @Test
  def haeValmistuminenVahvistettuProducesString(): Unit = {
    val result = haeValmistuminenVahvistettu(someHakemus)
    assert(result.get.contains("myönteinen"))
  }

  @Test
  def haeKoulutuksenSisaltoProducesString(): Unit = {
    val result = haeKoulutuksenSisalto(someKoulutuksenSisaltoMuistio)
    assert(result.get.contains("Koulutuksen sisältö muistio -- body"))
  }

  @Test
  def haeImiHalytyksetTarkastettuProducesString(): Unit = {
    val result = haeImiHalytyksetTarkastettu(somePerustelu)
    assert(result.get.contains("kyllä"))
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
    when(maakoodiService.getMaakoodiByUri(any[String])).thenReturn(
      Some(
        Maakoodi(
          id = UUID.randomUUID,
          esittelijaId = None,
          koodiUri = "",
          fi = "",
          sv = "",
          en = ""
        )
      )
    )
    val result = haeTutkintokohtaisetTiedot(maakoodiService, someHakemus)
    assert(result.get.contains("Nimi: Paras tutkinto"))
  }
}
