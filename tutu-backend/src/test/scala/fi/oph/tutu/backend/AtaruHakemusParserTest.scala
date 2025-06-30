package fi.oph.tutu.backend

import fi.oph.tutu.backend.service.{extractValues, transformItem, traverseContent, AtaruHakemusParser, KoodistoService}
import org.junit.jupiter.api.{BeforeEach, DisplayName, Nested, Test}
import org.mockito.Mockito.when
import org.mockito.{Mock, MockitoAnnotations}
import fi.oph.tutu.backend.domain.{
  Answer,
  AtaruHakemus,
  AtaruLomake,
  EmptyValue,
  Kieli,
  KoodistoItem,
  LomakeContentItem,
  MultiValue,
  NestedValues,
  SingleValue,
  SisaltoItem,
  Valinta
}
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

  @Nested
  @DisplayName("parseSisalto")
  class ParseSisalto extends UnitTestBase with TutuJsonFormats {
    @Test
    def extractValuesWithNoAnswer(): Unit = {
      val result = extractValues(None)
      assertEquals(result, Seq())
    }

    @Test
    def extractValuesWithEmptyValueAnswer(): Unit = {
      val result = extractValues(Some(Answer(value = EmptyValue, key = "", fieldType = "")))
      assertEquals(result, Seq())
    }

    @Test
    def extractValuesWithSingleValueAnswer(): Unit = {
      val result = extractValues(Some(Answer(value = SingleValue("singleValue"), key = "", fieldType = "")))
      assertEquals(result, Seq("singleValue"))
    }

    @Test
    def extractValuesWithMultiValueAnswer(): Unit = {
      val result = extractValues(
        Some(Answer(value = MultiValue(Seq("firstValue", "secondValue")), key = "", fieldType = ""))
      )
      assertEquals(result, Seq("firstValue", "secondValue"))
    }

    @Test
    def extractValuesWithNestedValuesAnswer(): Unit = {
      val result = extractValues(
        Some(Answer(value = NestedValues(Seq(Seq("firstValue"), Seq("secondValue"))), key = "", fieldType = ""))
      )
      assertEquals(result, Seq("firstValue", "secondValue"))
    }

    @Test
    def transformItemWhenAnswerFound(): Unit = {
      val answers = Seq(
        Answer(
          key = "1",
          value = SingleValue("singleAnswer1"),
          fieldType = "testField"
        ),
        Answer(
          key = "2",
          value = SingleValue("singleAnswer2"),
          fieldType = "testField"
        ),
        Answer(
          key = "3",
          value = SingleValue("singleAnswer3"),
          fieldType = "testField"
        )
      )

      val item = LomakeContentItem(
        id = "2",
        fieldClass = "",
        fieldType = "",
        label = Map(Kieli.fi -> "fi", Kieli.sv -> "sv", Kieli.en -> "en"),
        options = Seq(
          Valinta(
            value = "singleAnswer2",
            label = Map(Kieli.fi -> "valinta2")
          )
        )
      )

      val (result, _) = transformItem(answers, item)
      val expected = SisaltoItem(
        key = "2",
        fieldType = "",
        value = Seq(Map(Kieli.fi -> "valinta2")),
        label = Map(Kieli.fi -> "fi", Kieli.sv -> "sv", Kieli.en -> "en")
      )

      assertEquals(result, expected)
    }

    @Test
    def transformItemWhenAnswerNotFound(): Unit = {
      val answers = Seq(
        Answer(
          key = "1",
          value = SingleValue("singleAnswer1"),
          fieldType = "testField"
        ),
        Answer(
          key = "2",
          value = SingleValue("singleAnswer2"),
          fieldType = "testField"
        ),
        Answer(
          key = "3",
          value = SingleValue("singleAnswer3"),
          fieldType = "testField"
        )
      )

      val item = LomakeContentItem(
        id = "4",
        fieldClass = "",
        fieldType = "",
        label = Map(Kieli.fi -> "fi", Kieli.sv -> "sv", Kieli.en -> "en"),
        options = Seq(
          Valinta(
            value = "singleAnswer2",
            label = Map(Kieli.fi -> "valinta2")
          )
        )
      )

      val (result, _) = transformItem(answers, item)
      val expected = SisaltoItem(
        key = "4",
        fieldType = "",
        value = Seq(),
        label = Map(Kieli.fi -> "fi", Kieli.sv -> "sv", Kieli.en -> "en")
      )

      assertEquals(result, expected)
    }

    @Test
    def transformItemWhenAnswerItemHasNoOptions(): Unit = {
      val answers = Seq(
        Answer(
          key = "1",
          value = SingleValue("singleAnswer1"),
          fieldType = "testField"
        ),
        Answer(
          key = "2",
          value = SingleValue("singleAnswer2"),
          fieldType = "testField"
        ),
        Answer(
          key = "3",
          value = SingleValue("singleAnswer3"),
          fieldType = "testField"
        )
      )

      val item = LomakeContentItem(
        id = "2",
        fieldClass = "",
        fieldType = "",
        label = Map(Kieli.fi -> "fi", Kieli.sv -> "sv", Kieli.en -> "en")
      )

      val (result, _) = transformItem(answers, item)
      val expected = SisaltoItem(
        key = "2",
        fieldType = "",
        value = Seq(Map(Kieli.fi -> "singleAnswer2", Kieli.sv -> "singleAnswer2", Kieli.en -> "singleAnswer2")),
        label = Map(Kieli.fi -> "fi", Kieli.sv -> "sv", Kieli.en -> "en")
      )

      assertEquals(result, expected)
    }

    @Test
    def traverseContentProducesConcensedDataStructure(): Unit = {

      /**
       *        Item101
       *        - Item201
       *        - Item202
       *          - Valinta301
       *          - Valinta302
       *            - Item401
       *            - Item402
       *        - Item203
       *          - Valinta303
       *
       *        =>
       *
       *        Sisalto101
       *        - Sisalto201
       *        - Sisalto202
       *          - Sisalto401
       *          - Sisalto402
       *        - Sisalto203
       */
      val item401 = LomakeContentItem(
        id = "401",
        fieldClass = "",
        fieldType = "",
        label = Map()
      )
      val item402 = LomakeContentItem(
        id = "402",
        fieldClass = "",
        fieldType = "",
        label = Map()
      )

      val valinta301 = Valinta(
        value = "301",
        label = Map()
      )
      val valinta302 = Valinta(
        value = "302",
        label = Map(),
        followups = Seq(
          item401,
          item402
        )
      )
      val valinta303 = Valinta(
        value = "303",
        label = Map()
      )

      val item201 = LomakeContentItem(
        id = "201",
        fieldClass = "",
        fieldType = "",
        label = Map()
      )
      val item202 = LomakeContentItem(
        id = "202",
        fieldClass = "",
        fieldType = "",
        label = Map(),
        options = Seq(
          valinta301,
          valinta302
        )
      )
      val item203 = LomakeContentItem(
        id = "203",
        fieldClass = "",
        fieldType = "",
        label = Map(),
        options = Seq(
          valinta303
        )
      )

      val item101 = LomakeContentItem(
        id = "101",
        fieldClass = "",
        fieldType = "",
        label = Map(),
        children = Seq(
          item201,
          item202,
          item203
        )
      )

      val rootItems = traverseContent(
        Seq(item101),
        item => {
          (
            SisaltoItem(
              key = item.id,
              fieldType = "",
              value = Seq(Map()),
              label = Map()
            ),
            item.options
              .map(opt => opt.followups)
              .flatten()
          )
        }
      )

      assertEquals(rootItems.size, 1)

      assertEquals(rootItems(0).key, "101")

      val childrenOf101 = rootItems(0).children

      assertEquals(childrenOf101.size, 3)

      assertEquals(childrenOf101(0).key, "201")
      assertEquals(childrenOf101(1).key, "202")
      assertEquals(childrenOf101(2).key, "203")

      val childrenOf202 = childrenOf101(1).followups

      assertEquals(childrenOf202.size, 2)

      assertEquals(childrenOf202(0).key, "401")
      assertEquals(childrenOf202(1).key, "402")

    }

  }
}
