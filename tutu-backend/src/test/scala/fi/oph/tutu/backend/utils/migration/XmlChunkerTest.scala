package fi.oph.tutu.backend.utils.migration

import fi.oph.tutu.backend.config.migration.ChunkingConfig
import org.junit.jupiter.api.Assertions.{assertEquals, assertTrue}
import org.junit.jupiter.api.{DisplayName, Test, TestInstance}

import java.io.ByteArrayInputStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class XmlChunkerTest {
  val testConfig = new ChunkingConfig()
  testConfig.environment = "test"
  testConfig.chunkSize = 100
  testConfig.maxChunks = 10

  val xmlChunker = new XmlChunker(testConfig)

  @Test
  @DisplayName("Testaa XML-prosessointi pienellä tiedostolla")
  def testChunkerWithSmallFile(): Unit = {
    val xmlContent = """<?xml version="1.0" encoding="UTF-8"?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
  <ERRORCODE>0</ERRORCODE>
  <PRODUCT BUILD="09-05-2019" NAME="FileMaker" VERSION="ProAdvanced 18.0.3"/>
  <DATABASE DATEFORMAT="D.m.yyyy" LAYOUT="vl_esittelija" NAME="tuttu.fmp12" RECORDS="5" TIMEFORMAT="k:mm:ss "/>
  <METADATA>
    <FIELD EMPTYOK="YES" MAXREPEAT="1" NAME="Name" TYPE="TEXT"/>
    <FIELD EMPTYOK="YES" MAXREPEAT="1" NAME="Age" TYPE="TEXT"/>
    <FIELD EMPTYOK="YES" MAXREPEAT="1" NAME="City" TYPE="TEXT"/>
  </METADATA>
  <RESULTSET FOUND="5">
    <ROW MODID="1" RECORDID="1">
      <COL><DATA>John Doe</DATA></COL>
      <COL><DATA>30</DATA></COL>
      <COL><DATA>Helsinki</DATA></COL>
    </ROW>
    <ROW MODID="2" RECORDID="2">
      <COL><DATA>Jane Smith</DATA></COL>
      <COL><DATA>25</DATA></COL>
      <COL><DATA>Turku</DATA></COL>
    </ROW>
    <ROW MODID="3" RECORDID="3">
      <COL><DATA>Bob Johnson</DATA></COL>
      <COL><DATA>35</DATA></COL>
      <COL><DATA>Tampere</DATA></COL>
    </ROW>
    <ROW MODID="4" RECORDID="4">
      <COL><DATA>Alice Brown</DATA></COL>
      <COL><DATA>28</DATA></COL>
      <COL><DATA>Oulu</DATA></COL>
    </ROW>
    <ROW MODID="5" RECORDID="5">
      <COL><DATA>Charlie Wilson</DATA></COL>
      <COL><DATA>42</DATA></COL>
      <COL><DATA>Vantaa</DATA></COL>
    </ROW>
  </RESULTSET>
</FMPXMLRESULT>"""

    val result = xmlChunker.splitXmlStreamIntoChunksAndStore(
      new ByteArrayInputStream(xmlContent.getBytes("UTF-8")),
      (_, _, _) => ()
    )

    assertTrue(result.isSuccess)
    val chunkCount = result.get
    assertEquals(1, chunkCount)
  }

  @Test
  @DisplayName("Testaa XML-prosessointi tyhjällä tulosjoukolla")
  def testChunkerWithEmptyResultset(): Unit = {
    val xmlContent = """<?xml version="1.0" encoding="UTF-8"?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
  <ERRORCODE>0</ERRORCODE>
  <METADATA>
    <FIELD EMPTYOK="YES" MAXREPEAT="1" NAME="Name" TYPE="TEXT"/>
  </METADATA>
  <RESULTSET FOUND="0">
  </RESULTSET>
</FMPXMLRESULT>"""

    val result = xmlChunker.splitXmlStreamIntoChunksAndStore(
      new ByteArrayInputStream(xmlContent.getBytes("UTF-8")),
      (_, _, _) => ()
    )

    assertTrue(result.isSuccess)
    val chunkCount = result.get
    assertEquals(0, chunkCount)
  }

  @Test
  @DisplayName("Testaa XML-prosessointi virheellisellä syötteellä")
  def testChunkerWithInvalidXml(): Unit = {
    val invalidXml = "This is not valid XML content"
    val result     = xmlChunker.splitXmlStreamIntoChunksAndStore(
      new ByteArrayInputStream(invalidXml.getBytes("UTF-8")),
      (_, _, _) => ()
    )
    assertTrue(result.isFailure)
  }

  @Test
  @DisplayName("Testaa suurten tiedostojen käsittely")
  def testLargeFileProcessing(): Unit = {
    val rows = (1 to 10000)
      .map { i =>
        s"""    <ROW MODID="$i" RECORDID="$i">
        <COL><DATA>Test data for row $i with some extra content</DATA></COL>
        <COL><DATA>${i % 100}</DATA></COL>
        <COL><DATA>Additional data to increase size</DATA></COL>
      </ROW>"""
      }
      .mkString("\n")

    val xmlContent = s"""<?xml version="1.0" encoding="UTF-8"?>
      <FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
        <METADATA>
          <FIELD EMPTYOK="YES" MAXREPEAT="1" NAME="Data" TYPE="TEXT"/>
          <FIELD EMPTYOK="YES" MAXREPEAT="1" NAME="Number" TYPE="TEXT"/>
          <FIELD EMPTYOK="YES" MAXREPEAT="1" NAME="Extra" TYPE="TEXT"/>
        </METADATA>
        <RESULTSET FOUND="10000">
          $rows
        </RESULTSET>
      </FMPXMLRESULT>"""

    val inputStream = new ByteArrayInputStream(xmlContent.getBytes("UTF-8"))
    val result      = xmlChunker.splitXmlStreamIntoChunksAndStore(inputStream, (_, _, _) => ())

    assertTrue(result.isSuccess)
    val chunkCount = result.get

    // Verify chunk count instead of individual chunks
    assertTrue(chunkCount > 0, "Should have created at least one chunk")
  }

  @Test
  @DisplayName("Testaa suorituskyky eri palakoilla")
  def testPerformance(): Unit = {
    val chunkSizes = List(10, 50, 100, 500)
    chunkSizes.foreach { chunkSize =>
      testConfig.chunkSize = chunkSize

      val rows = (1 to 1000)
        .map { i =>
          s"""    <ROW MODID="$i" RECORDID="$i">
          <COL><DATA>Name$i</DATA></COL>
          <COL><DATA>${i % 100}</DATA></COL>
          <COL><DATA>City$i</DATA></COL>
        </ROW>"""
        }
        .mkString("\n")

      val xmlContent = s"""<?xml version="1.0" encoding="UTF-8"?>
        <FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
          <METADATA>
            <FIELD EMPTYOK="YES" MAXREPEAT="1" NAME="Name" TYPE="TEXT"/>
            <FIELD EMPTYOK="YES" MAXREPEAT="1" NAME="Number" TYPE="TEXT"/>
            <FIELD EMPTYOK="YES" MAXREPEAT="1" NAME="City" TYPE="TEXT"/>
          </METADATA>
          <RESULTSET FOUND="1000">
            $rows
          </RESULTSET>
        </FMPXMLRESULT>"""

      val startTime = System.currentTimeMillis()
      val result    = xmlChunker.splitXmlStreamIntoChunksAndStore(
        new ByteArrayInputStream(xmlContent.getBytes("UTF-8")),
        (_, _, _) => ()
      )
      val endTime = System.currentTimeMillis()

      assertTrue(result.isSuccess)
      val chunkCount = result.get

      val runtime    = endTime - startTime
      val memoryUsed = Runtime.getRuntime.totalMemory() - Runtime.getRuntime.freeMemory()
    }
  }

}
