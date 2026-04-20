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

  val timezone: ZoneId = ZoneId.of("Europe/Helsinki")

  val otsikkoKaannokset: Seq[(String, String)] = Seq[(String, String)](
    ("hakemus.viesti.taydennyspyynto.ylaOtsikko", "Pyyntö täydentää hakemusta"),
    ("hakemus.viesti.taydennyspyynto", "Täydennyspyyntö"),
    ("hakemus.viesti.taydennyspyynto.maaraaika.otsikko", "Määräaika"),
    ("hakemus.viesti.taydennyspyynto.kasittelyAika.otsikko", "Käsittelyaika")
  )

  val allekirjoitusKaannokset: Seq[(String, String)] = Seq[(String, String)](
    ("hakemus.viesti.allekirjoitus.opetushallitus", "Opetushallitus"),
    ("hakemus.viesti.allekirjoitus.tervehdys", "Riehakasta perunannostolomaa")
  )

  val yleisetKaannokset: Seq[(String, String)] = Seq[(String, String)](
    ("hakemus.viesti.sisalto.tervehdys", "Howdy!!"),
    ("hakemus.viesti.sisalto.tietoaHakemuksesta", "Tää on hakemus"),
    ("hakemus.viesti.sisalto.lisatietoInfo", "Voit kysellä lisätietoa")
  )

  val parametrisoidutKaannokset: Seq[(String, String)] = Seq[(String, String)](
    ("hakemus.viesti.sisalto.maaraaika", "Määräaika: {date}"),
    ("hakemus.viesti.sisalto.asiatunnus", "Hakemuksesi Opetushallitukseen {asiatunnus}")
  )

  val taydennyspyyntoKaannokset: Seq[(String, String)] = Seq[(String, String)](
    ("hakemus.viesti.taydennyspyynto.yleisOhje", "Muutoksia täytyis tehdä"),
    ("hakemus.viesti.taydennyspyynto.tarkentavaOhje", "Ihan oikeasti"),
    ("hakemus.viesti.taydennyspyynto.maaraaika.yleisOhje", "Määräaika on tärkeä"),
    ("hakemus.viesti.taydennyspyynto.maaraaika.tarkentavaOhje", "Nyt tarkkana"),
    ("hakemus.viesti.taydennyspyynto.maaraaika.lisaaikaOhje", "Lisäaikaa voi hakea"),
    ("hakemus.viesti.taydennyspyynto.kasittelyAika.info", "Ihan oikeasti käsitellään joskus")
  )

  val kaannoksetIlmanParametrilistaa: Seq[(String, String)]  = otsikkoKaannokset ++ allekirjoitusKaannokset
  val kaannoksetParametrilistanKanssa: Seq[(String, String)] = yleisetKaannokset ++ taydennyspyyntoKaannokset
  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    viestiSisaltoGenerator = new ViestiSisaltoGenerator(translationService)

    kaannoksetIlmanParametrilistaa.foreach { case (key, value) =>
      when(translationService.getTranslation(fi, key)).thenReturn(value)
    }
    kaannoksetParametrilistanKanssa.foreach { case (key, value) =>
      when(translationService.getTranslation(fi, key, Map[String, String]())).thenReturn(value)
    }
  }

  private def initParametrisoidutKaannokset(params: Map[String, String]): Seq[String] = {
    val kaannokset = parametrisoidutKaannokset.map { case (key, value) =>
      val formattedVal = params.foldLeft(value) { case (acc, (k, v)) =>
        acc.replace(s"{$k}", v)
      }
      when(translationService.getTranslation(fi, key, params)).thenReturn(formattedVal)
      formattedVal
    }
    kaannokset
  }
  private def assertAllekirjoitus(sisalto: String): Unit = {
    assert(sisalto.contains("Riehakasta perunannostolomaa,"))
    assert(sisalto.contains("Opetushallitus"))
    assert(sisalto.contains("Yrjö Kortesniemi"))
    assert(sisalto.contains("yka@åbh.sv"))
    assert(sisalto.contains("123 456789"))
  }

  @Test
  def taydennyspyyntoonLisataanAlkuJaLopputekstit(): Unit = {
    val parametrisoidutKaannokset = initParametrisoidutKaannokset(
      Map[String, String]("date" -> viestiSisaltoGenerator.maaraAika(timezone), "asiatunnus" -> "(OPH-123-2026)")
    )

    val sisalto = viestiSisaltoGenerator.generateTaydennyspyyntoSisalto(
      ViestiHakemusInfo(hakemusOid, esittelija, fi, timezone, Some("OPH-123-2026"))
    )
    val kaikkiKaannokset =
      kaannoksetIlmanParametrilistaa.map(_._2) ++ kaannoksetParametrilistanKanssa.map(_._2) ++ parametrisoidutKaannokset
    kaikkiKaannokset.foreach { teksti =>
      assert(sisalto.contains(teksti), s"Tekstin '$teksti' pitäisi löytyä sisällöstä")
    }
    assertAllekirjoitus(sisalto)
  }
}
