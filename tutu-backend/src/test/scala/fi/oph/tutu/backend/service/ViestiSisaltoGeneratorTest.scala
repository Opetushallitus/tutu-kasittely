package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.UnitTestBase
import fi.oph.tutu.backend.domain.{Esittelija, HakemusOid, ViestiHakemusInfo}
import fi.oph.tutu.backend.service.generator.viesti.ViestiSisaltoGenerator
import fi.oph.tutu.backend.domain.Kieli.fi
import org.junit.jupiter.api.{BeforeEach, Test}
import org.mockito.{Mock, MockitoAnnotations}
import org.mockito.Mockito.*

import java.time.ZoneId

class ViestiSisaltoGeneratorTest extends UnitTestBase {
  @Mock
  var translationService: TranslationService = _

  var viestiSisaltoGenerator: ViestiSisaltoGenerator = _

  val hakemusOid = HakemusOid("1.2.246.562.11.00000000001")

  val esittelija = Esittelija(
    esittelijaOid = "1.2.246.562.24.00000000001",
    etunimi = "Yrjö",
    sukunimi = "Kortesniemi",
    sahkoposti = Some("yka@åbh.sv"),
    puhelinnumero = Some("123 456789")
  )

  val timezone = ZoneId.of("Europe/Helsinki")

  val yleisetKaannokset = Seq[(String, String)](
    ("hakemus.viesti.allekirjoitus.opetushallitus", "Opetushallitus"),
    ("hakemus.viesti.allekirjoitus.tervehdys", "Riehakasta perunannostolomaa"),
    ("hakemus.viesti.sisalto.maaraaika", "Määräaika: {date}"),
    ("hakemus.viesti.sisalto.asiatunnus", "Asiatunnus: {asiatunnus}"),
    ("hakemus.viesti.sisalto.tervehdys", "Howdy!!"),
    ("hakemus.viesti.sisalto.tietoaHakemuksesta", "Tää on hakemus"),
    ("hakemus.viesti.sisalto.lisatietoInfo", "Voit kysellä lisätietoa")
  )

  val taydennyspyyntoKaannokset = Seq[(String, String)](
    ("hakemus.viesti.taydennyspyynto.ylaOtsikko", "Pyyntö täydentää hakemusta"),
    ("hakemus.viesti.taydennyspyynto", "Täydennyspyyntö"),
    ("hakemus.viesti.taydennyspyynto.yleisOhje", "Muutoksia täytyis tehdä"),
    ("hakemus.viesti.taydennyspyynto.tarkentavaOhje", "Ihan oikeasti"),
    ("hakemus.viesti.taydennyspyynto.maaraaika.otsikko", "Määräaika"),
    ("hakemus.viesti.taydennyspyynto.maaraaika.yleisOhje", "Määräaika on tärkeä"),
    ("hakemus.viesti.taydennyspyynto.maaraaika.tarkentavaOhje", "Nyt tarkkana"),
    ("hakemus.viesti.taydennyspyynto.maaraaika.lisaaikaOhje", "Lisäaikaa voi hakea"),
    ("hakemus.viesti.taydennyspyynto.kasittelyAika.otsikko", "Käsittelyaika"),
    ("hakemus.viesti.taydennyspyynto.kasittelyAika.info", "Ihan oikeasti käsitellään joskus")
  )

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    viestiSisaltoGenerator = new ViestiSisaltoGenerator(translationService)

    yleisetKaannokset.foreach { case (key, value) =>
      when(translationService.getTranslation(fi, key)).thenReturn(value)
    }
    taydennyspyyntoKaannokset.foreach { case (key, value) =>
      when(translationService.getTranslation(fi, key)).thenReturn(value)
    }
  }

  private def assertAllekirjoitus(sisalto: String): Unit = {
    assert(sisalto.contains("Riehakasta perunannostolomaa,"))
    assert(sisalto.contains("Opetushallitus"))
    assert(sisalto.contains("Yrjö Kortesniemi"))
    assert(sisalto.contains("mailto:yka@åbh.sv"))
    assert(sisalto.contains("123 456789"))
  }

  @Test
  def taydennyspyyntoonLisataanAlkuJaLopputekstit(): Unit = {
    val sisalto = viestiSisaltoGenerator.generateTaydennyspyyntoSisalto(
      ViestiHakemusInfo(hakemusOid, esittelija, fi, timezone, Some("OPH-123-2026"))
    )
    val yleisetTekstit = yleisetKaannokset.map(kaannos =>
      kaannos._2.replace("{date}", viestiSisaltoGenerator.maaraAika(timezone)).replace("{asiatunnus}", "OPH-123-2026")
    )
    val taydennyspyyntoTekstit = taydennyspyyntoKaannokset.map(kaannos =>
      kaannos._2.replace("{date}", viestiSisaltoGenerator.maaraAika(timezone)).replace("{asiatunnus}", "OPH-123-2026")
    )
    (yleisetTekstit ++ taydennyspyyntoTekstit).foreach { teksti =>
      assert(sisalto.contains(teksti), s"Tekstin '$teksti' pitäisi löytyä sisällöstä")
    }
  }
}
