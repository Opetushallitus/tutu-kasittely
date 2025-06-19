package fi.oph.tutu.backend

import fi.oph.tutu.backend.service.{AtaruHakemusParser, KoodistoService}
import org.junit.jupiter.api.{BeforeEach, Test}
import org.mockito.Mockito.when
import org.mockito.{Mock, MockitoAnnotations}
import fi.oph.tutu.backend.domain.{AtaruHakemus, Kieli, KoodistoItem}
import fi.oph.tutu.backend.utils.TutuJsonFormats
import org.json4s.native.JsonMethods
import org.json4s.jvalue2extractable
import org.junit.jupiter.api.Assertions.assertEquals

class AtaruHakemusParserTest extends UnitTestBase with TutuJsonFormats {
  @Mock
  var koodistoService: KoodistoService = _

  var ataruHakemusParser: AtaruHakemusParser = _

  val hakemus = JsonMethods.parse(loadJson("ataruHakemus.json")).extract[AtaruHakemus]

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    ataruHakemusParser = new AtaruHakemusParser(koodistoService)
  }

  @Test
  def parseHakija(): Unit = {
    when(koodistoService.getKoodisto("maatjavaltiot2")).thenReturn(
      List(
        KoodistoItem(
          "maatjavaltiot2_246",
          "246",
          Map(Kieli.fi -> "Suomi", Kieli.sv -> "Finland", Kieli.en -> "Finland")
        ),
        KoodistoItem(
          "maatjavaltiot2_702",
          "702",
          Map(Kieli.fi -> "Singapore", Kieli.sv -> "Singapore", Kieli.en -> "Singapore")
        ),
        KoodistoItem(
          "maatjavaltiot2_752",
          "752",
          Map(Kieli.fi -> "Ruotsi", Kieli.sv -> "Sverige", Kieli.en -> "Sweden")
        )
      )
    )

    when(koodistoService.getKoodisto("kunta")).thenReturn(
      List(
        KoodistoItem("kunta_009", "009", Map(Kieli.fi -> "Alavieska", Kieli.sv -> "Alavieska")),
        KoodistoItem("kunta_743", "743", Map(Kieli.fi -> "Seinäjoki", Kieli.sv -> "Seinäjoki")),
        KoodistoItem("kunta_505", "505", Map(Kieli.fi -> "Mäntsälä", Kieli.sv -> "Mäntsälä"))
      )
    )

    val hakija = ataruHakemusParser.parseHakija(hakemus)
    assertEquals("Testi Kolmas", hakija.etunimet)
    assertEquals("tatu", hakija.kutsumanimi)
    assertEquals("Hakija", hakija.sukunimi)
    assertEquals("180462-9981", hakija.hetu.getOrElse(""))
    assertEquals("18.04.1962", hakija.syntymaaika)
    assertEquals("+3584411222333", hakija.matkapuhelin.getOrElse(""))
    assertEquals("Sillitie 1", hakija.katuosoite)
    assertEquals("00800", hakija.postinumero)
    assertEquals("HELSINKI", hakija.postitoimipaikka)
    assertEquals("patu.kuusinen@riibasu.fi", hakija.sahkopostiosoite.getOrElse(""))
    assertEquals(
      Map(Kieli.valueOf("fi") -> "Suomi", Kieli.valueOf("sv") -> "Finland", Kieli.valueOf("en") -> "Finland"),
      hakija.kansalaisuus
    )
    assertEquals(
      Map(Kieli.valueOf("fi") -> "Suomi", Kieli.valueOf("sv") -> "Finland", Kieli.valueOf("en") -> "Finland"),
      hakija.asuinmaa
    )
    assertEquals(
      Map(Kieli.valueOf("fi") -> "Alavieska", Kieli.valueOf("sv") -> "Alavieska"),
      hakija.kotikunta
    )
  }

  @Test
  def parseWithoutOptionalData(): Unit = {
    when(koodistoService.getKoodisto("maatjavaltiot2")).thenReturn(List())
    when(koodistoService.getKoodisto("kunta")).thenReturn(List())
    val hakemusWoOpitional = hakemus.copy(
      henkilotunnus = None,
      content =
        hakemus.content.copy(answers = hakemus.content.answers.filterNot(a => a.key == "phone" || a.key == "email"))
    )
    val hakija = ataruHakemusParser.parseHakija(hakemusWoOpitional)
    assertEquals("Testi Kolmas", hakija.etunimet)
    assertEquals("tatu", hakija.kutsumanimi)
    assertEquals("Hakija", hakija.sukunimi)
    assertEquals(None, hakija.hetu)
    assertEquals("18.04.1962", hakija.syntymaaika)
    assertEquals(None, hakija.matkapuhelin)
    assertEquals("Sillitie 1", hakija.katuosoite)
    assertEquals("00800", hakija.postinumero)
    assertEquals("HELSINKI", hakija.postitoimipaikka)
    assertEquals(None, hakija.sahkopostiosoite)
    assertEquals(
      Map(),
      hakija.kansalaisuus
    )
    assertEquals(
      Map(),
      hakija.asuinmaa
    )
    assertEquals(
      Map(),
      hakija.kotikunta
    )

  }
}
