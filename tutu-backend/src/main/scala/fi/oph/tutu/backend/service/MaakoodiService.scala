package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{Kieli, KoodistoItem}
import fi.oph.tutu.backend.repository.MaakoodiRepository
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}

@Component
@Service
class MaakoodiService(
  maakoodiRepository: MaakoodiRepository
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[MaakoodiService])

  def syncMaakoodit(items: Seq[KoodistoItem], muokkaajaTaiLuoja: String): Unit = {
    val mapped = items.map { item =>
      val nimiFi: Option[String]      = item.nimi.get(Kieli.fi)
      val lyhytNimiFi: Option[String] = None
      val kuvausFi: Option[String]    = None
      (item.koodiArvo, lyhytNimiFi, nimiFi.getOrElse(""), kuvausFi)
    }
    maakoodiRepository.syncFromKoodisto(
      mapped.map { case (koodi, _, nimi, _) =>
        KoodistoItem(koodiUri = "", koodiArvo = koodi, nimi = Map(Kieli.fi -> nimi))
      },
      muokkaajaTaiLuoja
    )
  }
}
