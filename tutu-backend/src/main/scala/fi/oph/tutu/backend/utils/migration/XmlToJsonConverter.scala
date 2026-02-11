package fi.oph.tutu.backend.utils.migration

import org.json4s.*
import org.json4s.jackson.Serialization
import org.json4s.jackson.Serialization.write

import scala.util.Try
import scala.xml.{NodeSeq, XML}

/**
 * XML:n muuntaminen JSON:ksi FileMaker XML-muodosta.
 *
 * Käsittelee FileMakerin tuottamaa XML-muotoa ja muuntaa sen
 * JSON-objekteiksi, joita voidaan tallentaa tietokantaan.
 */
object XmlToJsonConverter {

  /**
   * Muuntaa FileMaker XML-sisällön JSON-objekteiksi.
   *
   * Parsii METADATA-osion kenttien nimet ja RESULTSET-osion datan,
   * yhdistää ne Map[String, String] -objekteiksi.
   *
   * @param xmlContent XML-sisältö muunnettavaksi
   * @return Success(JSON-objektienLista) jos muunnos onnistuu, Failure(exception) muuten
   */
  def convertXmlToJson(xmlContent: String): Try[Seq[Map[String, String]]] = Try {
    val xml = XML.loadString(xmlContent)

    // Extract field names from METADATA section
    val fieldNames = (xml \\ "FIELD").map(_.attribute("NAME").map(_.text).getOrElse("")).toSeq

    // Extract data rows from RESULTSET
    val rows = xml \\ "ROW"

    if (rows.isEmpty) {
      Seq.empty
    } else {
      rows.map { row =>
        val columns = (row \\ "COL").map { col =>
          val data = (col \\ "DATA").text
          data
        }

        // Map field names to column values
        fieldNames.zip(columns).toMap
      }.toSeq
    }
  }

  def convertXmlToJsonString(xmlContent: String): Try[String] = {
    convertXmlToJson(xmlContent).map { jsonObjects =>
      implicit val formats = DefaultFormats
      write(jsonObjects)
    }
  }
}
