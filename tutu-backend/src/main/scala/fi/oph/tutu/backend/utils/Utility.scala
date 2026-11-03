package fi.oph.tutu.backend.utils

import fi.oph.tutu.backend.domain.Kielistetty

import java.time.{LocalDateTime, ZoneOffset, ZonedDateTime}
import scala.util.{Failure, Success, Try}

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

  def validateAikavali(alkuPvm: Option[String], loppuPvm: Option[String]): Option[String] = {
    def parse(nimi: String, arvo: Option[String]): Either[String, Option[ZonedDateTime]] =
      arvo match {
        case None    => Right(None)
        case Some(s) =>
          Try(Utility.toUtcDateTime(s)) match {
            case Success(dt) => Right(Some(dt))
            case Failure(_)  => Left(s"Virheellinen $nimi: '$s' (odotettu ISO 8601, esim. 2025-01-01T00:00:00Z)")
          }
      }

    val tulos = for {
      alku  <- parse("alkuPvm", alkuPvm)
      loppu <- parse("loppuPvm", loppuPvm)
      _     <- (alku, loppu) match {
        case (Some(a), Some(l)) if a.isAfter(l) => Left("alkuPvm ei voi olla loppuPvm:n jälkeen")
        case _                                  => Right(())
      }
    } yield ()
    tulos.left.toOption
  }
}
