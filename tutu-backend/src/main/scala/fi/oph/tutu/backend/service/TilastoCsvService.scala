package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.domain.TilastoCsvItem
import fi.oph.tutu.backend.repository.TilastoCsvRepository
import fi.oph.tutu.backend.domain.Kieli.fi
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}

import java.time.{ZoneId, ZoneOffset}
import scala.Seq

@Component
@Service
class TilastoCsvService(
  tilastoCsvRepository: TilastoCsvRepository,
  hakemusService: HakemusService,
  onrService: OnrService,
  koodistoService: KoodistoService
) {
  val LOG: Logger = LoggerFactory.getLogger(classOf[TilastoCsvService])

  private val CsvSeparator = ","
  private val CsvHeader    = Seq(
    "hyväksymispvm:n vuosi",
    "hakijan henkilötunnus",
    "tutkinto 1:n suoritusmaa",
    "tutkinto 1:n todistuksen pvm",
    "tutkinto 1:n koulutusala",
    "tutkinnon tunnustettu taso"
  )
  private val SuomiZone = ZoneId.of("Europe/Helsinki")

  private def quoteCsv(value: String): String =
    "\"" + value.replace("\"", "\"\"") + "\""

  private def escapeCsv(value: String): String =
    if (value.exists(c => c == ',' || c == '"' || c == '\n' || c == '\r'))
      "\"" + value.replace("\"", "\"\"") + "\""
    else value

  private def toCsvRow(item: TilastoCsvItem, maanimiByKoodiuri: Map[String, String]): String = {
    val maa             = item.suoritusMaaKoodiUri.flatMap(maanimiByKoodiuri.get).getOrElse("")
    val hyvaksymisVuosi = item.hyvaksymisPvm
      .atZone(ZoneOffset.UTC)         // interpret the stored value as UTC
      .withZoneSameInstant(SuomiZone) // convert to Suomi time
      .getYear
    val koulutusAlaKoodi = item.koulutusAlaKoodiUri.map(uri => uri.substring(uri.lastIndexOf('_') + 1))
    Seq(
      escapeCsv(hyvaksymisVuosi.toString),
      escapeCsv(item.henkilotunnus.getOrElse("")),
      escapeCsv(maa),
      escapeCsv(item.suoritusPvm.getOrElse("")),
      quoteCsv(koulutusAlaKoodi.getOrElse("")),
      escapeCsv(item.tutkintoTaso.map(_.numeroKoodi.toString).getOrElse(""))
    ).mkString(CsvSeparator)
  }

  def generateTilastokeskusCsv(alkuPvm: Option[String], loppuPvm: Option[String]): String = {
    var tilastoData = tilastoCsvRepository.haeTilastoData(alkuPvm, loppuPvm)
    val hakijaOids  = tilastoData.filter(_.hakijaOid.isValid).map(_.hakijaOid.toString).distinct
    val hetuByOid: Map[String, Option[String]] =
      onrService.haeHenkilot(hakijaOids) match {
        case Left(e) =>
          throw e
        case Right(hakijat) =>
          hakijat.map(h => h.oidHenkilo -> h.hetu).toMap
      }

    tilastoData = tilastoData.map(item => item.copy(henkilotunnus = hetuByOid.get(item.hakijaOid.toString).flatten))

    LOG.info(
      s"Generoidaan Tilastokeskus CSV aikavälille: ${alkuPvm.getOrElse("")} - ${loppuPvm.getOrElse("")}, ${tilastoData.size} riviä"
    )

    val maanimiByKoodiuri =
      koodistoService.getKoodisto("maatjavaltiot2").map(k => k.koodiUri -> k.nimi.getOrElse(fi, "")).toMap
    (CsvHeader.mkString(CsvSeparator) +: tilastoData.map(item => toCsvRow(item, maanimiByKoodiuri)))
      .mkString("", "\n", "\n")
  }
}
