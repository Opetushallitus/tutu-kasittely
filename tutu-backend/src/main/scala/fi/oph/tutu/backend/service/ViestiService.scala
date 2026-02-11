package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.SortDef.Undefined
import fi.oph.tutu.backend.domain.{DbHakemus, HakemusOid, SortDef, Viesti, ViestiListItem}
import fi.oph.tutu.backend.repository.{HakemusRepository, TutuDatabase, ViestiRepository}
import fi.oph.tutu.backend.utils.TutuJsonFormats
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}

import java.util.UUID
import scala.math.Ordering.comparatorToOrdering

@Component
@Service
class ViestiService(
  viestiRepository: ViestiRepository,
  hakemusRepository: HakemusRepository,
  onrService: OnrService,
  db: TutuDatabase
) extends TutuJsonFormats {
  val LOG: Logger = LoggerFactory.getLogger(classOf[ViestiService])

  def haeViestiLista(hakemusOid: HakemusOid, sort: String): Seq[ViestiListItem] = {
    val viestiLista = hakemusRepository.haeHakemus(hakemusOid) match {
      case Some(dbHakemus: DbHakemus) =>
        viestiRepository
          .haeViestiLista(dbHakemus.id)
          .map(viesti => {
            val vahvistaja = onrService.haeHenkilo(viesti.vahvistaja) match {
              case Left(error)    => ""
              case Right(henkilo) => s"${henkilo.kutsumanimi} ${henkilo.sukunimi}"
            }
            viesti.copy(vahvistaja = vahvistaja)
          })
      case _ => List()
    }
    sort match {
      case null => viestiLista
      case _    =>
        val sortSplit = sort.split(":")
        val sortParam = sortSplit.headOption.getOrElse("undefined")
        val sortDef   = SortDef.fromString(sortSplit.lastOption.getOrElse("undefined"))
        sortDef match {
          case Undefined => viestiLista
          case _         =>
            val sorted = sortParam match {
              case "vahvistettu" => viestiLista.sortBy(_.vahvistettu)
              case "otsikko"     => viestiLista.sortBy(_.otsikko)
              case "vahvistaja"  => viestiLista.sortBy(_.vahvistaja)
              case _             => viestiLista.sortBy(_.viestityyppi.toString)
            }
            sortDef match {
              case SortDef.Asc  => sorted
              case SortDef.Desc => sorted.reverse
              case _            => viestiLista
            }
        }
    }
  }

  def haeViestiTyoversio(hakemusOid: HakemusOid): Option[Viesti] = {
    hakemusRepository.haeHakemus(hakemusOid) match {
      case Some(dbHakemus: DbHakemus) =>
        viestiRepository.haeVahvistamatonViesti(dbHakemus.id) match {
          case Some(viesti) => Some(viesti)
          case None         =>
            LOG.info(
              s"Hakemuksella ${hakemusOid} ei ole keskeneräistä (vahvistamatonta) viestiä, palautetaan uusi viesti"
            )
            Some(Viesti(hakemusId = Some(dbHakemus.id)))
        }
      case _ =>
        None
    }
  }

  def haeViesti(id: UUID): Option[Viesti] = {
    viestiRepository.haeViesti(id) match {
      case Some(viesti) =>
        viesti.vahvistaja match {
          case Some(vahvistajaOid) =>
            val vahvistaja = onrService.haeHenkilo(vahvistajaOid) match {
              case Left(error)    => None
              case Right(henkilo) => Some(s"${henkilo.kutsumanimi} ${henkilo.sukunimi}")
            }
            Some(viesti.copy(vahvistaja = vahvistaja))
          case _ => Some(viesti.copy(vahvistaja = None))
        }
      case _ => None
    }
  }

  def tallennaViesti(
    hakemusOid: HakemusOid,
    viesti: Viesti,
    luojaTaiMuokkaaja: String
  ): (Option[Viesti], Option[Viesti]) = {
    hakemusRepository.haeHakemus(hakemusOid) match {
      case Some(dbHakemus: DbHakemus) =>
        val currentViesti = viesti.id match {
          case Some(viestiId) => haeViesti(viestiId)
          case _              => None
        }
        val newOrUpdatedViesti = currentViesti match {
          case Some(existing) => viestiRepository.tallennaViesti(existing.id.get, viesti, luojaTaiMuokkaaja)
          case _              => viestiRepository.lisaaViesti(dbHakemus.id, viesti, luojaTaiMuokkaaja)
        }
        (currentViesti, Some(newOrUpdatedViesti))
      case _ => (None, None)
    }
  }

  def poistaViesti(id: UUID): Int = {
    viestiRepository.poistaViesti(id)
  }
}
