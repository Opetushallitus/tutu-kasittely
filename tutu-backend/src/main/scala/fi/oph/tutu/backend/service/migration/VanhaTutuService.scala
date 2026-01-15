package fi.oph.tutu.backend.service.migration

import fi.oph.tutu.backend.repository.migration.VanhaTutuRepository
import fi.oph.tutu.backend.utils.TutuJsonFormats
import org.json4s.*
import org.json4s.jackson.JsonMethods.*
import org.json4s.jackson.Serialization
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}
import scala.util.{Failure, Success, Try}

@Component
@Service
class VanhaTutuService(
  vanhaTutuRepository: VanhaTutuRepository
) extends TutuJsonFormats {
  val LOG: Logger = LoggerFactory.getLogger(classOf[VanhaTutuService])

  def haeVanhaTutuById(id: java.util.UUID): Try[Option[String]] = {
    Try {
      vanhaTutuRepository.get(id)
    } recoverWith { case e: Exception =>
      LOG.error(s"Vanhan tutun haku epäonnistui id:llä $id", e)
      Failure(e)
    }
  }

  def listaaHakemuksia(pageNum: Int): Seq[String] = {
    vanhaTutuRepository.list(pageNum)
  }
}
