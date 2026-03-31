package fi.oph.tutu.backend

import fi.oph.tutu.backend.config.JacksonConfig

import java.io.FileNotFoundException
import scala.io.Source

class UnitTestBase {
  val mapper = JacksonConfig.mapper

  def loadJson(fileName: String): String = {
    val stream = Option(getClass.getClassLoader.getResourceAsStream(fileName))
      .getOrElse(throw new FileNotFoundException(s"$fileName not found in classpath"))

    Source.fromInputStream(stream).mkString
  }
}
