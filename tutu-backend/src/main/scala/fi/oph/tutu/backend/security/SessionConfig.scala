package fi.oph.tutu.backend.security

import fi.oph.tutu.backend.repository.TutuDatabase
import org.apereo.cas.client.session.SessionMappingStorage
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.{Bean, Configuration}
import org.springframework.session.{Session, SessionRepository}
import org.springframework.session.jdbc.JdbcIndexedSessionRepository

@Configuration
class SessionConfig {
  val LOG = LoggerFactory.getLogger(classOf[SessionConfig])

  @Autowired
  val db: TutuDatabase = null

  @Bean
  def sessionMappingStorage(sessionRepository: JdbcIndexedSessionRepository): SessionMappingStorage = {
    val jdbcSessionMappingStorage = new JdbcSessionMappingStorage(sessionRepository.asInstanceOf[SessionRepository[Session]], "tutu", db)
    jdbcSessionMappingStorage
  }
}