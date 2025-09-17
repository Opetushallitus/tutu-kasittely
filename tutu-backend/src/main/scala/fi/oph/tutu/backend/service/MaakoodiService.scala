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
      (s"maatjavaltiot2_${item.koodiArvo}", nimiFi.getOrElse(""))
    }
    maakoodiRepository.syncFromKoodisto(
      mapped.map { case (koodiUri, nimi) =>
        KoodistoItem(koodiUri = koodiUri, koodiArvo = koodiUri, nimi = Map(Kieli.fi -> nimi))
      },
      muokkaajaTaiLuoja
    )
  }

  def listMaakoodit(): Seq[Maakoodi] = {
    maakoodiRepository
      .listAll()
      .map(db => Maakoodi(db.id, db.esittelijaId, db.koodiUri, db.nimi))
  }

  def getMaakoodi(id: java.util.UUID): Option[Maakoodi] = {
    maakoodiRepository
      .getMaakoodi(id)
      .map(db => Maakoodi(db.id, db.esittelijaId, db.koodiUri, db.nimi))
  }

  def updateMaakoodi(id: java.util.UUID, esittelijaId: Option[java.util.UUID], muokkaaja: String): Option[Maakoodi] = {
    maakoodiRepository
      .updateMaakoodi(id, esittelijaId, muokkaaja)
      .map(db => Maakoodi(db.id, db.esittelijaId, db.koodiUri, db.nimi))
  }
}
