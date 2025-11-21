package fi.oph.tutu.backend.service.generator

import java.time.format.DateTimeFormatter
import java.time.LocalDateTime

def toKyllaEi(value: Boolean): String = {
  if (value) { "Kyllä" }
  else { "Ei" }
}

def formatDate(date: LocalDateTime): String = {
  date.format(DateTimeFormatter.ofPattern("dd.MM.yyyy"))
}
