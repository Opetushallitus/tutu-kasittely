package fi.oph.tutu.backend.domain

import java.util.regex.Pattern

sealed trait Oid {
  val OidPattern: Pattern = Pattern.compile("""^1\.2\.246\.562\.\d+\.\d+$""")
  val s: String

  override def toString: String = s

  def isValid: Boolean = OidPattern.matcher(s).matches()
}

case class HakemusOid(s: String) extends Oid {
  override val OidPattern: Pattern = Pattern.compile("""^1\.2\.246\.562\.11\.\d+$""")
}

case class UserOid(s: String) extends Oid {
  override val OidPattern: Pattern = Pattern.compile("""^1\.2\.246\.562\.24\.\d{11}$""")
}
