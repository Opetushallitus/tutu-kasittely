package fi.oph.tutu.backend.utils

import fi.oph.tutu.backend.utils.Constants.FINLAND_TZ

import java.time.{LocalDateTime, ZonedDateTime}

object Utility {
  def stringToSeq(s: String): Seq[String]              = s.split(",").map(_.trim).toSeq
  def stringToIntSeq(s: String): Seq[Int]              = s.split(",").map(_.trim.toInt).toSeq
  def toLocalDateTime(dateTime: String): LocalDateTime = ZonedDateTime
    .parse(dateTime)
    .withZoneSameInstant(FINLAND_TZ)
    .toLocalDateTime
}
