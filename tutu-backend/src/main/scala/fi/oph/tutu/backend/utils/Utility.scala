package fi.oph.tutu.backend.utils

import fi.oph.tutu.backend.utils.Constants.FINLAND_TZ

import java.time.{LocalDateTime, ZonedDateTime}
import scala.math.BigDecimal

object Utility {
  def stringToSeq(s: String): Seq[String]              = s.split(",").map(_.trim).toSeq
  def stringToIntSeq(s: String): Seq[Int]              = s.split(",").map(_.trim.toInt).toSeq
  def toLocalDateTime(dateTime: String): LocalDateTime = ZonedDateTime
    .parse(dateTime)
    .withZoneSameInstant(FINLAND_TZ)
    .toLocalDateTime
  def currentLocalDateTime(): LocalDateTime      = ZonedDateTime.now(FINLAND_TZ).toLocalDateTime
  def toPrecision(value: Double, precision: Int) =
    BigDecimal(value).setScale(precision, BigDecimal.RoundingMode.HALF_UP).toDouble
}
