package fi.oph.tutu.backend.utils

import fi.oph.tutu.backend.domain.Kielistetty

import java.time.{LocalDateTime, ZoneOffset, ZonedDateTime}

object Utility {
  def stringToSeq(s: String): Seq[String] = s.split(",").map(_.trim).toSeq
  def stringToIntSeq(s: String): Seq[Int] = s.split(",").map(_.trim.toInt).toSeq

  def toLocalDateTime(dateTime: String): LocalDateTime =
    ZonedDateTime.parse(dateTime).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime

  def toUtcDateTime(dateTime: String): ZonedDateTime =
    ZonedDateTime.parse(dateTime).withZoneSameInstant(ZoneOffset.UTC)

  def toPrecision(value: Double, precision: Int): Double =
    BigDecimal(value).setScale(precision, BigDecimal.RoundingMode.HALF_UP).toDouble

  def trimKielistetty(k: Kielistetty): Kielistetty = {
    k.map((k, v) => (k, v.trim))
  }
}
