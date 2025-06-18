package fi.oph.tutu.backend

import java.io.FileNotFoundException
import scala.io.Source

class UnitTestBase {
  def loadJson(fileName: String): String = {
    val stream = Option(getClass.getClassLoader.getResourceAsStream(fileName))
      .getOrElse(throw new FileNotFoundException(s"$fileName not found in classpath"))

    Source.fromInputStream(stream).mkString
  }
}
