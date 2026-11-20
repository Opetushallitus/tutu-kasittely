package fi.oph.tutu.backend.domain

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.{DeserializationContext, JsonDeserializer}

import java.util.regex.Pattern

sealed abstract class OidValidator(val pattern: Pattern) {
  def isValid(s: String): Boolean = s != null && pattern.matcher(s).matches()
}

object HakemusOidValidator extends OidValidator(Pattern.compile("""^1\.2\.246\.562\.11\.\d+$"""))
object UserOidValidator    extends OidValidator(Pattern.compile("""^1\.2\.246\.562\.24\.\d{11}$"""))
object PersonOidValidator  extends OidValidator(Pattern.compile("""^1\.2\.246\.562\.(24|198)\.\d{11}$"""))

sealed trait Oid {
  val s: String
  protected def validator: OidValidator

  override def toString: String = s

  def isValid: Boolean = validator.isValid(s)
}

case class HakemusOid(s: String) extends Oid { protected def validator: OidValidator = HakemusOidValidator }
case class UserOid(s: String)    extends Oid { protected def validator: OidValidator = UserOidValidator    }
case class PersonOid(s: String)  extends Oid { protected def validator: OidValidator = PersonOidValidator  }

class HakemusOidDeserializer extends JsonDeserializer[HakemusOid] {
  override def deserialize(p: JsonParser, ctxt: DeserializationContext): HakemusOid = {
    val value = p.getValueAsString
    HakemusOid(value)
  }
}
