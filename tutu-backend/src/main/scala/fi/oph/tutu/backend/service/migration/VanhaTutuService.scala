package fi.oph.tutu.backend.service.migration

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.tutu.backend.repository.migration.VanhaTutuRepository
import fi.oph.tutu.backend.utils.TutuJsonFormats
import org.json4s.*
import org.json4s.jackson.JsonMethods.*
import org.json4s.jackson.Serialization
import org.json4s.native.JsonMethods.parse
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}
import scala.util.{Failure, Success, Try}

@Component
@Service
class VanhaTutuService(
  vanhaTutuRepository: VanhaTutuRepository
) extends TutuJsonFormats {
  val LOG: Logger = LoggerFactory.getLogger(classOf[VanhaTutuService])

  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)

  def haeVanhaTutuById(id: java.util.UUID): Try[Option[ObjectNode]] = {
    Try {
      vanhaTutuRepository
        .get(id)
        .map(rivi => {
          val id       = rivi.id
          val dataJson = rivi.dataJson

          val json = mapper.readTree(dataJson).asInstanceOf[ObjectNode]
          json.put("id", id)
          json
        })
    } recoverWith { case e: Exception =>
      LOG.error(s"Vanhan tutun haku epäonnistui id:llä $id", e)
      Failure(e)
    }
  }

  def listaaHakemuksia(pageNum: Int): Seq[ObjectNode] = {
    vanhaTutuRepository
      .list(pageNum)
      .map(rivi => {
        val id       = rivi.id
        val dataJson = rivi.dataJson

        val json = mapper.readTree(dataJson).asInstanceOf[ObjectNode]
        json.put("id", id)
        json
      })
  }
}
