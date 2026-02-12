package fi.oph.tutu.backend.utils.migration

import org.slf4j.{Logger, LoggerFactory}
import scala.util.Try
import javax.xml.stream.{XMLInputFactory, XMLStreamConstants, XMLStreamReader}
import javax.xml.transform.stream.StreamSource
import scala.collection.mutable.ArrayBuffer
import java.io.InputStream

/**
 * Matalan tason XML-virtakäsittelijä. Käyttää StAX-pohjaista toteutusta.
 */
private[utils] object StreamProcessor {
  private val xmlInputFactory = XMLInputFactory.newInstance()
  xmlInputFactory.setProperty(XMLInputFactory.IS_COALESCING, true)

  def processXmlStreamAndStore(
    inputStream: InputStream,
    config: ChunkerConfig,
    chunkingStrategy: ChunkingStrategy,
    storeChunk: (Int, Int, String) => Unit
  ): Try[Int] = Try {
    val reader      = xmlInputFactory.createXMLStreamReader(new StreamSource(inputStream))
    val currentRows = new ArrayBuffer[String]()
    val rowBuffer   = new StringBuilder()
    var metadata    = ""
    var inRow       = false
    var chunkIndex  = 1
    var totalChunks = 0

    try {
      while (reader.hasNext) {
        reader.next() match {
          case XMLStreamConstants.START_ELEMENT if reader.getLocalName == "METADATA" =>
            metadata = captureElement(reader, "METADATA")

          case XMLStreamConstants.START_ELEMENT if reader.getLocalName == "ROW" =>
            inRow = true
            rowBuffer.clear()
            rowBuffer.append("<ROW")
            appendAttributes(reader, rowBuffer)
            rowBuffer.append(">")

          case XMLStreamConstants.END_ELEMENT if reader.getLocalName == "ROW" =>
            rowBuffer.append("</ROW>")
            currentRows += rowBuffer.toString()
            inRow = false

            // Luodaan pala kun on tarpeeksi rivejä
            if (currentRows.length >= config.chunkSize) {
              val chunk = createChunk(metadata, currentRows.toSeq, chunkIndex, 0)
              storeChunk(chunk.chunkIndex, 0, chunk.xmlChunk) // Store immediately
              currentRows.clear()
              chunkIndex += 1
              totalChunks += 1
            }

          case XMLStreamConstants.CHARACTERS if inRow =>
            rowBuffer.append(reader.getText)

          case XMLStreamConstants.START_ELEMENT if inRow =>
            val name = reader.getLocalName
            rowBuffer.append(s"<$name")
            appendAttributes(reader, rowBuffer)
            rowBuffer.append(">")

          case XMLStreamConstants.END_ELEMENT if inRow =>
            rowBuffer.append(s"</${reader.getLocalName}>")

          case _ => // Ohitetaan muut elementit
        }
      }

      // Käsitellään viimeinen pala jos siinä on dataa
      if (currentRows.nonEmpty) {
        val chunk = createChunk(metadata, currentRows.toSeq, chunkIndex, 0)
        storeChunk(chunk.chunkIndex, 0, chunk.xmlChunk) // Store immediately
        totalChunks += 1
      }

      totalChunks
    } finally {
      reader.close()
    }
  }

  private def appendAttributes(reader: XMLStreamReader, buffer: StringBuilder): Unit = {
    for (i <- 0 until reader.getAttributeCount) {
      buffer.append(s" ${reader.getAttributeLocalName(i)}=\"${reader.getAttributeValue(i)}\"")
    }
  }

  private def captureElement(reader: XMLStreamReader, elementName: String): String = {
    val buffer = new StringBuilder()
    var depth  = 1
    buffer.append(s"<$elementName>")

    while (depth > 0 && reader.hasNext) {
      reader.next() match {
        case XMLStreamConstants.START_ELEMENT =>
          depth += 1
          val name = reader.getLocalName
          buffer.append(s"<$name")
          appendAttributes(reader, buffer)
          buffer.append(">")

        case XMLStreamConstants.END_ELEMENT =>
          depth -= 1
          buffer.append(s"</${reader.getLocalName}>")

        case XMLStreamConstants.CHARACTERS =>
          buffer.append(reader.getText)

        case _ => // Ignore other elements
      }
    }

    buffer.toString()
  }

  private def createChunk(metadata: String, rows: Seq[String], chunkIndex: Int, totalChunks: Int): XmlChunk = {
    val xmlContent = s"""<?xml version="1.0" encoding="UTF-8"?>
                        |<!-- Pala $chunkIndex / $totalChunks -->
                        |<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
                        |  $metadata
                        |  <RESULTSET FOUND="${rows.length}">
                        |    ${rows.mkString("\n    ")}
                        |  </RESULTSET>
                        |</FMPXMLRESULT>""".stripMargin

    XmlChunk(chunkIndex, totalChunks, xmlContent)
  }
}
