package fi.oph.tutu.backend.utils.migration

import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.*
import scala.util.{Failure, Success}

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class XmlToJsonConverterTest {

  @Test
  @DisplayName("Muuntaa kelvollisen XML-datan JSON-objekteiksi")
  def convertXmlToJsonWithValidData(): Unit = {
    val xmlContent = """<?xml version="1.0" encoding="UTF-8"?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
  <ERRORCODE>0</ERRORCODE>
  <METADATA>
    <FIELD NAME="Name" TYPE="TEXT"/>
    <FIELD NAME="Age" TYPE="TEXT"/>
    <FIELD NAME="City" TYPE="TEXT"/>
  </METADATA>
  <RESULTSET FOUND="2">
    <ROW>
      <COL><DATA>John Doe</DATA></COL>
      <COL><DATA>30</DATA></COL>
      <COL><DATA>Helsinki</DATA></COL>
    </ROW>
    <ROW>
      <COL><DATA>Jane Smith</DATA></COL>
      <COL><DATA>25</DATA></COL>
      <COL><DATA>Turku</DATA></COL>
    </ROW>
  </RESULTSET>
</FMPXMLRESULT>"""

    val result = XmlToJsonConverter.convertXmlToJson(xmlContent)

    assertTrue(result.isSuccess)
    val jsonObjects = result.get
    assertEquals(2, jsonObjects.length)

    val firstObject = jsonObjects(0)
    assertEquals("John Doe", firstObject("Name"))
    assertEquals("30", firstObject("Age"))
    assertEquals("Helsinki", firstObject("City"))

    val secondObject = jsonObjects(1)
    assertEquals("Jane Smith", secondObject("Name"))
    assertEquals("25", secondObject("Age"))
    assertEquals("Turku", secondObject("City"))
  }

  @Test
  @DisplayName("Käsittelee tyhjän XML-sisällön oikein")
  def convertXmlToJsonWithEmptyContent(): Unit = {
    val xmlContent = """<?xml version="1.0" encoding="UTF-8"?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
  <ERRORCODE>0</ERRORCODE>
  <METADATA>
  </METADATA>
  <RESULTSET FOUND="0">
  </RESULTSET>
</FMPXMLRESULT>"""

    val result = XmlToJsonConverter.convertXmlToJson(xmlContent)

    assertTrue(result.isSuccess)
    val jsonObjects = result.get
    assertTrue(jsonObjects.isEmpty)
  }

  @Test
  @DisplayName("Käsittelee XML:n jossa on vain otsikot ilman dataa")
  def convertXmlToJsonWithOnlyHeaders(): Unit = {
    val xmlContent = """<?xml version="1.0" encoding="UTF-8"?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
  <ERRORCODE>0</ERRORCODE>
  <METADATA>
    <FIELD NAME="Name" TYPE="TEXT"/>
    <FIELD NAME="Age" TYPE="TEXT"/>
    <FIELD NAME="City" TYPE="TEXT"/>
  </METADATA>
  <RESULTSET FOUND="0">
  </RESULTSET>
</FMPXMLRESULT>"""

    val result = XmlToJsonConverter.convertXmlToJson(xmlContent)

    assertTrue(result.isSuccess)
    val jsonObjects = result.get
    assertTrue(jsonObjects.isEmpty)
  }

  @Test
  @DisplayName("Käsittelee XML:n jossa on tyhjiä arvoja")
  def convertXmlToJsonWithEmptyValues(): Unit = {
    val xmlContent = """<?xml version="1.0" encoding="UTF-8"?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
  <ERRORCODE>0</ERRORCODE>
  <METADATA>
    <FIELD NAME="Name" TYPE="TEXT"/>
    <FIELD NAME="Age" TYPE="TEXT"/>
    <FIELD NAME="City" TYPE="TEXT"/>
  </METADATA>
  <RESULTSET FOUND="2">
    <ROW>
      <COL><DATA>John Doe</DATA></COL>
      <COL><DATA></DATA></COL>
      <COL><DATA>Helsinki</DATA></COL>
    </ROW>
    <ROW>
      <COL><DATA></DATA></COL>
      <COL><DATA>25</DATA></COL>
      <COL><DATA>Turku</DATA></COL>
    </ROW>
  </RESULTSET>
</FMPXMLRESULT>"""

    val result = XmlToJsonConverter.convertXmlToJson(xmlContent)

    assertTrue(result.isSuccess)
    val jsonObjects = result.get
    assertEquals(2, jsonObjects.length)

    val firstObject = jsonObjects(0)
    assertEquals("John Doe", firstObject("Name"))
    assertEquals("", firstObject("Age"))
    assertEquals("Helsinki", firstObject("City"))

    val secondObject = jsonObjects(1)
    assertEquals("", secondObject("Name"))
    assertEquals("25", secondObject("Age"))
    assertEquals("Turku", secondObject("City"))
  }

  @Test
  @DisplayName("Muuntaa kelvollisen XML-datan JSON-merkkijonoksi")
  def convertXmlToJsonStringWithValidData(): Unit = {
    val xmlContent = """<?xml version="1.0" encoding="UTF-8"?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
  <ERRORCODE>0</ERRORCODE>
  <METADATA>
    <FIELD NAME="Name" TYPE="TEXT"/>
    <FIELD NAME="Age" TYPE="TEXT"/>
    <FIELD NAME="City" TYPE="TEXT"/>
  </METADATA>
  <RESULTSET FOUND="1">
    <ROW>
      <COL><DATA>John Doe</DATA></COL>
      <COL><DATA>30</DATA></COL>
      <COL><DATA>Helsinki</DATA></COL>
    </ROW>
  </RESULTSET>
</FMPXMLRESULT>"""

    val result = XmlToJsonConverter.convertXmlToJsonString(xmlContent)

    assertTrue(result.isSuccess)
    val jsonString = result.get
    assertTrue(jsonString.contains("John Doe"))
    assertTrue(jsonString.contains("30"))
    assertTrue(jsonString.contains("Helsinki"))
    assertTrue(jsonString.contains("Name"))
    assertTrue(jsonString.contains("Age"))
    assertTrue(jsonString.contains("City"))
  }

  @Test
  @DisplayName("Muuntaa tyhjän XML-sisällön tyhjäksi JSON-taulukoksi")
  def convertXmlToJsonStringWithEmptyContent(): Unit = {
    val xmlContent = """<?xml version="1.0" encoding="UTF-8"?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
  <ERRORCODE>0</ERRORCODE>
  <METADATA>
  </METADATA>
  <RESULTSET FOUND="0">
  </RESULTSET>
</FMPXMLRESULT>"""

    val result = XmlToJsonConverter.convertXmlToJsonString(xmlContent)

    assertTrue(result.isSuccess)
    val jsonString = result.get
    assertEquals("[]", jsonString)
  }

  @Test
  @DisplayName("Käsittelee XML:n jossa on vain yksi sarake")
  def convertXmlToJsonWithSingleColumn(): Unit = {
    val xmlContent = """<?xml version="1.0" encoding="UTF-8"?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
  <ERRORCODE>0</ERRORCODE>
  <METADATA>
    <FIELD NAME="Name" TYPE="TEXT"/>
  </METADATA>
  <RESULTSET FOUND="2">
    <ROW>
      <COL><DATA>John Doe</DATA></COL>
    </ROW>
    <ROW>
      <COL><DATA>Jane Smith</DATA></COL>
    </ROW>
  </RESULTSET>
</FMPXMLRESULT>"""

    val result = XmlToJsonConverter.convertXmlToJson(xmlContent)

    assertTrue(result.isSuccess)
    val jsonObjects = result.get
    assertEquals(2, jsonObjects.length)

    val firstObject = jsonObjects(0)
    assertEquals("John Doe", firstObject("Name"))

    val secondObject = jsonObjects(1)
    assertEquals("Jane Smith", secondObject("Name"))
  }

  @Test
  @DisplayName("Käsittelee XML:n jossa on useita sarakkeita")
  def convertXmlToJsonWithMultipleColumns(): Unit = {
    val xmlContent = """<?xml version="1.0" encoding="UTF-8"?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
  <ERRORCODE>0</ERRORCODE>
  <METADATA>
    <FIELD NAME="Name" TYPE="TEXT"/>
    <FIELD NAME="Age" TYPE="TEXT"/>
    <FIELD NAME="City" TYPE="TEXT"/>
    <FIELD NAME="Country" TYPE="TEXT"/>
    <FIELD NAME="Occupation" TYPE="TEXT"/>
  </METADATA>
  <RESULTSET FOUND="2">
    <ROW>
      <COL><DATA>John Doe</DATA></COL>
      <COL><DATA>30</DATA></COL>
      <COL><DATA>Helsinki</DATA></COL>
      <COL><DATA>Finland</DATA></COL>
      <COL><DATA>Engineer</DATA></COL>
    </ROW>
    <ROW>
      <COL><DATA>Jane Smith</DATA></COL>
      <COL><DATA>25</DATA></COL>
      <COL><DATA>Turku</DATA></COL>
      <COL><DATA>Finland</DATA></COL>
      <COL><DATA>Designer</DATA></COL>
    </ROW>
  </RESULTSET>
</FMPXMLRESULT>"""

    val result = XmlToJsonConverter.convertXmlToJson(xmlContent)

    assertTrue(result.isSuccess)
    val jsonObjects = result.get
    assertEquals(2, jsonObjects.length)

    val firstObject = jsonObjects(0)
    assertEquals("John Doe", firstObject("Name"))
    assertEquals("30", firstObject("Age"))
    assertEquals("Helsinki", firstObject("City"))
    assertEquals("Finland", firstObject("Country"))
    assertEquals("Engineer", firstObject("Occupation"))

    val secondObject = jsonObjects(1)
    assertEquals("Jane Smith", secondObject("Name"))
    assertEquals("25", secondObject("Age"))
    assertEquals("Turku", secondObject("City"))
    assertEquals("Finland", secondObject("Country"))
    assertEquals("Designer", secondObject("Occupation"))
  }

  @Test
  @DisplayName("Käsittelee virheellisesti muotoiltua XML:ää")
  def convertXmlToJsonWithMalformedXml(): Unit = {
    val malformedXml = """<?xml version="1.0" encoding="UTF-8"?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
  <ERRORCODE>0</ERRORCODE>
  <METADATA>
    <FIELD NAME="Name" TYPE="TEXT"/>
  </METADATA>
  <RESULTSET FOUND="1">
    <ROW>
      <COL><DATA>John Doe</DATA></COL>
    </ROW>
  </RESULTSET>
</FMPXMLRESULT>"""

    val result = XmlToJsonConverter.convertXmlToJson(malformedXml)

    assertTrue(result.isSuccess)
  }

  @Test
  @DisplayName("Epäonnistuu virheellisellä XML:llä")
  def convertXmlToJsonWithInvalidXml(): Unit = {
    val invalidXml = "This is not valid XML at all"

    val result = XmlToJsonConverter.convertXmlToJson(invalidXml)

    assertTrue(result.isFailure)
    assertTrue(result.failed.get.isInstanceOf[Exception])
  }

  @Test
  @DisplayName("Käsittelee XML:n jossa puuttuu metadata")
  def convertXmlToJsonWithMissingMetadata(): Unit = {
    val xmlWithoutMetadata = """<?xml version="1.0" encoding="UTF-8"?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
  <ERRORCODE>0</ERRORCODE>
  <RESULTSET FOUND="1">
    <ROW>
      <COL><DATA>John Doe</DATA></COL>
    </ROW>
  </RESULTSET>
</FMPXMLRESULT>"""

    val result = XmlToJsonConverter.convertXmlToJson(xmlWithoutMetadata)

    assertTrue(result.isSuccess)
    val jsonObjects = result.get
    assertEquals(1, jsonObjects.length)
    assertTrue(jsonObjects(0).isEmpty)
  }

  @Test
  @DisplayName("Epäonnistuu virheellisellä XML:llä JSON-merkkijonon muunnoksessa")
  def convertXmlToJsonStringWithInvalidXml(): Unit = {
    val invalidXml = "Not XML at all"

    val result = XmlToJsonConverter.convertXmlToJsonString(invalidXml)

    assertTrue(result.isFailure)
  }
}
