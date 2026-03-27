package fi.oph.tutu.backend.utils

import java.time.{LocalDateTime, ZoneOffset, ZonedDateTime}
import scala.math.BigDecimal

object Utility {
  def stringToSeq(s: String): Seq[String] = s.split(",").map(_.trim).toSeq
  def stringToIntSeq(s: String): Seq[Int] = s.split(",").map(_.trim.toInt).toSeq

  def toLocalDateTime(dateTime: String): LocalDateTime =
    ZonedDateTime.parse(dateTime).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime

  def toPrecision(value: Double, precision: Int) =
    BigDecimal(value).setScale(precision, BigDecimal.RoundingMode.HALF_UP).toDouble
}
