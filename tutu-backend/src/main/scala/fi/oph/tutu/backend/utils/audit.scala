package fi.oph.tutu.backend.utils

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import com.google.gson.{JsonArray, JsonParser}
import fi.vm.sade.auditlog.*
import fi.vm.sade.javautils.http.HttpServletRequestUtils
import jakarta.servlet.http.HttpServletRequest
import org.ietf.jgss.Oid
import org.slf4j.LoggerFactory
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder

import java.net.InetAddress

object AuditLogger extends Logger {
  private val logger = LoggerFactory.getLogger(classOf[Audit])

  override def log(msg: String): Unit = logger.info(msg)
}

object AuditLog extends AuditLog(AuditLogger)

class AuditLog(val logger: Logger) {

  val audit               = new Audit(logger, "tutu", ApplicationType.VIRKAILIJA)
  private val errorLogger = LoggerFactory.getLogger(classOf[AuditLog])

  def logRead(kohde: String, tunniste: String, operaatio: AuditOperation, request: HttpServletRequest): Unit =
    val target = new Target.Builder().setField(kohde, tunniste).build()
    audit.log(getUser(request), operaatio, target, Changes.EMPTY)

  def logCreate(user: User, targetFields: Map[String, String], operaatio: AuditOperation, muutokset: Any): Unit =
    val target = new Target.Builder()
    for ((key, value) <- targetFields)
      target.setField(key, value)
    // Tämä kludge on lisätty koska audit-lokirjaston gson-konfiguraatio ei kykene serialisoimaan esim. java.time.Instant-luokkia
    // (eikä paljon muutakaan), mutta kirjaston metodit haluavat kuitenkin parametreina gson-objekteja.
    // Tällä tavoin audit lokille voi antaa suoraan entiteetin ja kaikki kentät tallennetaan.
    val elements: JsonArray = new JsonArray()
    elements.add(JsonParser.parseString(mapper.writeValueAsString(muutokset)))
    audit.log(user, operaatio, target.build(), elements)

  def logChanges(user: User, targetFields: Map[String, String], operaatio: AuditOperation, changes: Changes): Unit =
    val target = new Target.Builder()
    for ((key, value) <- targetFields)
      target.setField(key, value)
    audit.log(user, operaatio, target.build(), changes)

  def logWithParams(
    request: HttpServletRequest,
    operation: Operation,
    raporttiParams: Map[String, Any]
  ): Unit =
    try {
      val paramsJson = toJson(raporttiParams)
      val target     =
        new Target.Builder().setField("parametrit", paramsJson).build()
      audit.log(getUser(request), operation, target, Changes.EMPTY)
    } catch {
      case e: Exception =>
        errorLogger.error(s"Auditlokitus epäonnistui: ${e.getMessage}")
        throw AuditException(e.getMessage)
    }

  val mapper = {
    // luodaan objectmapper jonka pitäisi pystyä serialisoimaan "kaikki mahdollinen"
    val mapper = new ObjectMapper()
    mapper.registerModule(DefaultScalaModule)
    mapper.registerModule(new JavaTimeModule())
    mapper.registerModule(new Jdk8Module())
    mapper
  }

  def toJson(value: Any): String =
    try
      mapper.writeValueAsString(value)
    catch {
      case e: Exception =>
        errorLogger.error("JSON-konversio epäonnistui: " + e.getMessage)
        throw AuditException(e.getMessage)
    }

  def getUser(request: HttpServletRequest): User = {
    val userOid = getCurrentPersonOid()
    val ip      = getInetAddress(request)
    new User(
      userOid,
      ip,
      request.getSession(false).getId(),
      Option(request.getHeader("User-Agent")).getOrElse("Tuntematon user agent")
    )
  }

  def getCurrentPersonOid(): Oid = {
    val authentication: Authentication =
      SecurityContextHolder.getContext().getAuthentication()
    if (authentication != null) {
      try {
        new Oid(authentication.getName())
      } catch {
        case e: Exception =>
          errorLogger.error(
            s"Käyttäjän oidin luonti epäonnistui: ${authentication.getName}"
          )
          throw AuditException(e.getMessage)
      }
    } else {
      null
    }
  }

  def getInetAddress(request: HttpServletRequest): InetAddress = {
    InetAddress.getByName(
      HttpServletRequestUtils.getRemoteAddress(
        request.getHeader("XFF_ORIGINAL").split(",").head.trim,
        request.getHeader("XFF_ORIGINAL"),
        request.getRemoteAddr,
        request.getRequestURI
      )
    )
  }
}

trait AuditOperation extends Operation {
  val name: String
}

object AuditOperation {
  // Tapahtumat

  case object Login extends AuditOperation {
    val name = "KIRJAUTUMINEN"
  }

  case object StartMigration extends AuditOperation {
    val name = "START_VANHATUTU_MIGRATION"
  }

  // Kirjoitus operaatiot

  case object CreateHakemus extends AuditOperation {
    val name = "HAKEMUKSEN_LUONTI"
  }

  case object CreateMuistio extends AuditOperation {
    val name = "MUISTION_LUONTI"
  }

  case object CreatePerustelu extends AuditOperation {
    val name = "PERUSTELUN_LUONTI"
  }

  // Päivitys operaatiot

  case object UpdateHakemus extends AuditOperation {
    val name = "HAKEMUKSEN_PAIVITYS"
  }

  case object UpdateMaakoodi extends AuditOperation {
    val name = "MAAKOODI_PAIVITYS"
  }

  // Luku operaatiot

  case object ReadLiitteenTiedot extends AuditOperation {
    val name = "LIITTEEN_TIEDOT_LUKU"
  }

  case object ReadHakemus extends AuditOperation {
    val name = "HAKEMUKSEN_LUKU"
  }

  case object ReadHakemukset extends AuditOperation {
    val name = "HAKEMUKSIEN_LUKU"
  }

  case object ReadEsittelija extends AuditOperation {
    val name = "ESITTELIJAN_LUKU"
  }

  case object ReadMuistio extends AuditOperation {
    val name = "MUISTION_LUKU"
  }

  case object ReadMaakoodit extends AuditOperation {
    val name = "MAAKOODIEN_LUKU"
  }

  case object ReadPerustelu extends AuditOperation {
    val name = "PERUSTELUN_LUKU"
  }

  case object ReadVanhaTutu extends AuditOperation {
    val name = "VANHA_TUTU_LUKU"
  }

  case object UpdatePerustelu extends AuditOperation {
    val name = "PERUSTELUN_PAIVITYS"
  }

  case object CreatePaatos extends AuditOperation {
    val name = "PAATOKSEN_LUONTI"
  }

  case object UpdatePaatos extends AuditOperation {
    val name = "PAATOKSEN_MUOKKAUS"
  }

  case object ReadPaatos extends AuditOperation {
    val name = "PAATOKSEN_LUKU"
  }
}

case class AuditException(message: String) extends Exception(message)
