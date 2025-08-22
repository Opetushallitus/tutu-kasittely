package fi.oph.tutu.backend

import fi.oph.tutu.backend.service.{extractValues, transformItem, traverseContent, AtaruHakemusParser, KoodistoService}
import org.junit.jupiter.api.{BeforeEach, DisplayName, Nested, Test}
import org.mockito.Mockito.when
import org.mockito.{Mock, MockitoAnnotations}
import fi.oph.tutu.backend.domain.{
  Answer,
  AtaruHakemus,
  EmptyValue,
  Kieli,
  KoodistoItem,
  LomakeContentItem,
  MultiValue,
  NestedValues,
  SingleValue,
  SisaltoItem,
  SisaltoValue,
  Valinta
}
import fi.oph.tutu.backend.utils.TutuJsonFormats
import org.json4s.native.JsonMethods
import org.json4s.jvalue2extractable
import org.junit.jupiter.api.Assertions.assertEquals

import java.util.UUID

class AtaruHakemusParserTest extends UnitTestBase with TutuJsonFormats {
  @Mock
  var koodistoService: KoodistoService = _

  var ataruHakemusParser: AtaruHakemusParser = _

  val hakemus: AtaruHakemus = JsonMethods.parse(loadJson("ataruHakemus6667.json")).extract[AtaruHakemus]

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

      val result   = transformItem(answers, item)
      val expected = SisaltoItem(
        key = "2",
        fieldType = "",
        value = Seq(SisaltoValue(Map(Kieli.fi -> "valinta2"), "singleAnswer2")),
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

      val result   = transformItem(answers, item)
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

      val result   = transformItem(answers, item)
      val expected = SisaltoItem(
        key = "2",
        fieldType = "",
        value = Seq(
          SisaltoValue(Map(Kieli.fi -> "singleAnswer2", Kieli.sv -> "singleAnswer2", Kieli.en -> "singleAnswer2"), "")
        ),
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
       *            - Item401
       *              - Valinta 501
       *          - Valinta302
       *            - Item402
       *              - Valinta 502
       *            - Item403
       *        - Item203
       *          - Valinta303
       *
       *        =>
       *
       *        SisaltoItem101
       *        - SisaltoItem202
       *          - SisaltoValue301
       *            - SisaltoItem401
       *              - SisaltoValue501
       *          - SisaltoValue302
       *            - SisaltoItem402
       *              - SisaltoValue502
       *        - SisaltoItem203
       *          - SisaltoValue303
       */

      val valinta501 = Valinta(
        value = "501",
        label = Map()
      )
      val valinta502 = Valinta(
        value = "502",
        label = Map()
      )

      val item401 = LomakeContentItem(
        id = "401",
        fieldClass = "",
        fieldType = "",
        label = Map(),
        options = Seq(valinta501)
      )
      val item402 = LomakeContentItem(
        id = "402",
        fieldClass = "",
        fieldType = "",
        label = Map(),
        options = Seq(valinta502)
      )
      val item403 = LomakeContentItem(
        id = "403",
        fieldClass = "",
        fieldType = "",
        label = Map(),
        options = Seq()
      )

      val valinta301 = Valinta(
        value = "301",
        label = Map(),
        followups = Seq(
          item401
        )
      )
      val valinta302 = Valinta(
        value = "302",
        label = Map(),
        followups = Seq(
          item402,
          item403
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

      def handleItem(item: LomakeContentItem): SisaltoItem = {
        SisaltoItem(
          key = item.id,
          fieldType = "",
          value = item.options.map(opt =>
            SisaltoValue(
              opt.label,
              opt.value,
              traverseContent(opt.followups, handleItem)
            )
          ),
          label = Map()
        )
      }

      val rootItems = traverseContent(Seq(item101), handleItem)

      assertEquals(rootItems.size, 1)

      assertEquals(rootItems.head.key, "101")

      val childrenOf101 = rootItems.head.children

      assertEquals(childrenOf101.size, 2)

      assertEquals(childrenOf101.head.key, "202")
      assertEquals(childrenOf101(1).key, "203")

      val valuesOf202 = childrenOf101.head.value
      val valuesOf203 = childrenOf101(1).value

      assertEquals(valuesOf202.size, 2)
      assertEquals(valuesOf203.size, 1)

      assertEquals(valuesOf202.head.value, "301")
      assertEquals(valuesOf202(1).value, "302")

      assertEquals(valuesOf203.head.value, "303")

      val followupsOf202 = valuesOf202.flatMap(value => value.followups)
      val followupsOf203 = valuesOf203.flatMap(value => value.followups)

      assertEquals(followupsOf202.size, 2)
      assertEquals(followupsOf203.size, 0)

      assertEquals(followupsOf202.head.key, "401")
      assertEquals(followupsOf202(1).key, "402")

      val valuesOf401 = followupsOf202.head.value

      assertEquals(valuesOf401.size, 1)

      assertEquals(valuesOf401.head.value, "501")

      val valuesOf402 = followupsOf202(1).value

      assertEquals(valuesOf402.size, 1)

      assertEquals(valuesOf402.head.value, "502")
    }
  }

  @Test
  def parseTutkinnotWithGeneratedIds(): Unit = {
    val hakemusWithKaikkiTutkinnot = JsonMethods.parse(loadJson("ataruHakemus6669.json")).extract[AtaruHakemus]
    val hakemusId                  = UUID.randomUUID()

    val tutkinnot   = ataruHakemusParser.parseTutkinnot(hakemusId, hakemusWithKaikkiTutkinnot)
    val tutkinto1   = tutkinnot.head
    val tutkinto2   = tutkinnot(1)
    val tutkinto3   = tutkinnot(2)
    val muuTutkinto = tutkinnot.last

    assertEquals(tutkinto1.hakemusId, hakemusId)
    assertEquals(Some("Tutkinto1"), tutkinto1.nimi)
    assertEquals(Some("Oppilaitos1"), tutkinto1.oppilaitos)
    assertEquals(Some(2001), tutkinto1.aloitusVuosi)
    assertEquals(Some(2003), tutkinto1.paattymisVuosi)
    assertEquals("1", tutkinto1.jarjestys)
    assertEquals(None, tutkinto1.muuTutkintoTieto)

    assertEquals(tutkinto2.hakemusId, hakemusId)
    assertEquals(Some("Tutkinto2"), tutkinto2.nimi)
    assertEquals(Some("Oppilaitos2"), tutkinto2.oppilaitos)
    assertEquals(Some(2005), tutkinto2.aloitusVuosi)
    assertEquals(Some(2005), tutkinto2.paattymisVuosi)
    assertEquals("2", tutkinto2.jarjestys)
    assertEquals(None, tutkinto2.muuTutkintoTieto)

    assertEquals(tutkinto3.hakemusId, hakemusId)
    assertEquals(Some("Tutkinto3"), tutkinto3.nimi)
    assertEquals(Some("Oppilaitos3"), tutkinto3.oppilaitos)
    assertEquals(Some(2005), tutkinto3.aloitusVuosi)
    assertEquals(Some(2025), tutkinto3.paattymisVuosi)
    assertEquals("3", tutkinto3.jarjestys)
    assertEquals(None, tutkinto3.muuTutkintoTieto)

    assertEquals(muuTutkinto.jarjestys, "MUU")
    assertEquals(muuTutkinto.hakemusId, hakemusId)
    assertEquals(None, muuTutkinto.nimi)
    assertEquals(None, muuTutkinto.oppilaitos)
    assertEquals(None, muuTutkinto.aloitusVuosi)
    assertEquals(None, muuTutkinto.paattymisVuosi)
    assertEquals(
      muuTutkinto.muuTutkintoTieto,
      Some(
        "Mä oon suorittanut tutkintoja ainakin:\n\n-Norja\n-Oulu\n-Peräseinäjoki\n\nVannon kautta kiven ja kannon, bro."
      )
    )
    assertEquals(muuTutkinto.jarjestys, "MUU")
  }

  @Test
  def parseTutkinnotWithDefinedIds(): Unit = {
    val hakemusWithKaikkiTutkinnot = JsonMethods.parse(loadJson("ataruHakemus6670.json")).extract[AtaruHakemus]
    val hakemusId                  = UUID.randomUUID()

    val tutkinnot   = ataruHakemusParser.parseTutkinnot(hakemusId, hakemusWithKaikkiTutkinnot)
    val tutkinto1   = tutkinnot.head
    val tutkinto2   = tutkinnot(1)
    val tutkinto3   = tutkinnot(2)
    val muuTutkinto = tutkinnot.last

    assertEquals(tutkinto1.hakemusId, hakemusId)
    assertEquals(Some("Päälikkö"), tutkinto1.nimi)
    assertEquals(Some("Butan Amattikoulu"), tutkinto1.oppilaitos)
    assertEquals(Some(1999), tutkinto1.aloitusVuosi)
    assertEquals(Some(2000), tutkinto1.paattymisVuosi)
    assertEquals("1", tutkinto1.jarjestys)
    assertEquals(None, tutkinto1.muuTutkintoTieto)

    assertEquals(tutkinto2.hakemusId, hakemusId)
    assertEquals(Some("Johto tehtävä"), tutkinto2.nimi)
    assertEquals(Some("Johto koulu"), tutkinto2.oppilaitos)
    assertEquals(Some(2006), tutkinto2.aloitusVuosi)
    assertEquals(Some(2007), tutkinto2.paattymisVuosi)
    assertEquals("2", tutkinto2.jarjestys)
    assertEquals(None, tutkinto2.muuTutkintoTieto)

    assertEquals(tutkinto3.hakemusId, hakemusId)
    assertEquals(Some("Apu poika"), tutkinto3.nimi)
    assertEquals(Some("Apu koulu"), tutkinto3.oppilaitos)
    assertEquals(Some(2010), tutkinto3.aloitusVuosi)
    assertEquals(Some(2011), tutkinto3.paattymisVuosi)
    assertEquals("3", tutkinto3.jarjestys)
    assertEquals(None, tutkinto3.muuTutkintoTieto)

    assertEquals(muuTutkinto.hakemusId, hakemusId)
    assertEquals(None, muuTutkinto.nimi)
    assertEquals(None, muuTutkinto.oppilaitos)
    assertEquals(None, muuTutkinto.aloitusVuosi)
    assertEquals(None, muuTutkinto.paattymisVuosi)
    assertEquals(
      muuTutkinto.muuTutkintoTieto,
      Some(
        "olem lisäksi suorittanut onnistunesti\n\n- elämän koulun perus ja ja jatko opintoja monia kymmeniä,,,, opintoviikoja\n\n\nsekä:\n\nesi merkiksi rippi koulun!!!!111"
      )
    )
    assertEquals(muuTutkinto.jarjestys, "MUU")
  }

}
