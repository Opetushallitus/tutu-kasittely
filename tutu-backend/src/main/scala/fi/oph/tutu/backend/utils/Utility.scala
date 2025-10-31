package fi.oph.tutu.backend.utils

object Utility {
  def stringToSeq(s: String): Seq[String] = s.split(",").map(_.trim).toSeq
}
