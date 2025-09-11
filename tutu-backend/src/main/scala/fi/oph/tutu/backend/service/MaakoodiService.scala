package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.{Kieli, KoodistoItem, Maakoodi}
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
      val nimiFi: Option[String] = item.nimi.get(Kieli.fi)
      (item.koodiArvo, nimiFi.getOrElse(""))
    }
    maakoodiRepository.syncFromKoodisto(
      mapped.map { case (koodi, nimi) =>
        KoodistoItem(koodiUri = "", koodiArvo = koodi, nimi = Map(Kieli.fi -> nimi))
      },
      muokkaajaTaiLuoja
    )
  }

  def listMaakoodit(): Seq[Maakoodi] = {
    maakoodiRepository
      .listAll()
      .map(db => Maakoodi(db.id, db.esittelijaId, db.koodi, db.nimi))
  }

  def getMaakoodi(id: java.util.UUID): Option[Maakoodi] = {
    maakoodiRepository
      .getMaakoodi(id)
      .map(db => Maakoodi(db.id, db.esittelijaId, db.koodi, db.nimi))
  }

  def updateMaakoodi(id: java.util.UUID, esittelijaId: Option[java.util.UUID], muokkaaja: String): Option[Maakoodi] = {
    maakoodiRepository
      .updateMaakoodi(id, esittelijaId, muokkaaja)
      .map(db => Maakoodi(db.id, db.esittelijaId, db.koodi, db.nimi))
  }
}
