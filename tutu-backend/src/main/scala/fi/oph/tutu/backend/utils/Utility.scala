package fi.oph.tutu.backend.utils

import fi.oph.tutu.backend.utils.Constants.{DATE_TIME_FORMAT, FINLAND_TZ}

import java.time.{LocalDateTime, ZonedDateTime}
import java.time.format.DateTimeFormatter

object Utility {
  def stringToSeq(s: String): Seq[String]              = s.split(",").map(_.trim).toSeq
  def stringToIntSeq(s: String): Seq[Int]              = s.split(",").map(_.trim.toInt).toSeq
  def toLocalDateTime(dateTime: String): LocalDateTime = ZonedDateTime
    .parse(dateTime, DateTimeFormatter.ofPattern(DATE_TIME_FORMAT))
    .withZoneSameInstant(FINLAND_TZ)
    .toLocalDateTime
}
