package fi.oph.tutu.backend.security

import fi.oph.tutu.backend.repository.TutuDatabase
import jakarta.servlet.http.HttpSession
import org.slf4j.LoggerFactory
import org.springframework.session.{Session, SessionRepository}
import slick.jdbc.PostgresProfile.api.*

class JdbcSessionMappingStorage(
  sessionRepository: SessionRepository[Session],
  serviceName: String,
  tutuDatabase: TutuDatabase
) extends OphSessionMappingStorage {

  val LOG = LoggerFactory.getLogger(classOf[JdbcSessionMappingStorage])

  val mappingTableName = "virkailija_cas_client_session"
  val sessionTableName = "virkailija_session"

  @Override
  def removeSessionByMappingId(mappingId: String): HttpSession = {
    LOG.debug(s"Poistetaan sessiomappaus cas tiketillä $mappingId")
    val query =
      sql"""SELECT virkailija_session_id FROM #$mappingTableName WHERE mapped_ticket_id = $mappingId"""
        .as[String]
        .headOption
    val sessionIdOpt = tutuDatabase.run(query, "selectSessionIdByMappingId")

    sessionIdOpt
      .flatMap(sessionId => Option(sessionRepository.findById(sessionId)))
      .map(session => new HttpSessionAdapter(sessionRepository, session))
      .orNull
  }

  @Override
  def removeBySessionById(sessionId: String): Unit = {
    LOG.debug(s"Poistetaan sessiomappaus session id:llä $sessionId")
    val sql =
      sqlu"""DELETE FROM #$mappingTableName WHERE virkailija_session_id = $sessionId"""
    tutuDatabase.run(sql, "removeBySessionById")
  }

  @Override
  def addSessionById(mappingId: String, session: HttpSession): Unit = {
    // Tarkistetaan että sessio on varmasti olemassa ennen mappausta
    val sessionExistsQuery =
      sql"""SELECT COUNT(*) FROM #$sessionTableName WHERE session_id = ${session.getId}""".as[Int].head
    val exists = tutuDatabase.run(sessionExistsQuery, "checkSessionExists") == 1
    if (exists) {
      LOG.debug(
        s"Lisätään sessiomappaus, mappingId: $mappingId, sessionId: ${session.getId}"
      )
      val sql =
        sqlu"""INSERT INTO #$mappingTableName (mapped_ticket_id, virkailija_session_id) VALUES ($mappingId, ${session.getId}) ON CONFLICT (mapped_ticket_id) DO NOTHING"""
      tutuDatabase.run(sql, "addSessionById")
    } else {
      LOG.warn(s"Sessiota ${session.getId} ei löytynyt, ei lisätä sessiomappausta")
    }
  }

  @Override
  def clean(): Unit = {
    LOG.debug("Siivotaan sessiomappaukset joille ei löydy sessiota")
    val sql =
      sqlu"""DELETE FROM #$mappingTableName WHERE virkailija_session_id NOT IN (SELECT session_id FROM #$sessionTableName)"""
    tutuDatabase.run(sql, "clean")
  }

}
