package fi.oph.tutu.backend.service.generator.viesti

import fi.oph.tutu.backend.domain.{Esittelija, Kieli, PyydettavaAsiakirja, ViestiHakemusInfo}
import fi.oph.tutu.backend.service.TranslationService
import fi.oph.tutu.backend.utils.Constants.TAYDENNYSPYYNTO_VASTAUSAIKA_PAIVIA
import fi.oph.tutu.backend.utils.TutuJsonFormats
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.stereotype.{Component, Service}

import java.time.{LocalDateTime, ZoneId, ZonedDateTime}
import java.time.format.DateTimeFormatter

@Component
@Service
class ViestiSisaltoGenerator(translationService: TranslationService) extends TutuJsonFormats {
  val LOG: Logger                         = LoggerFactory.getLogger(classOf[ViestiSisaltoGenerator])
  private val DATE_FORMATTER              = DateTimeFormatter.ofPattern("dd.MM.yyyy")
  private val KAANNOSTYYPPISET_ASIAKIRJAT = Set("tutkintotodistustenkaannokset", "liitteidenkaannokset")

  private def rivi(kieli: Kieli, translationKey: String, parameters: Map[String, String] = Map()): String = {
    val translation = translationService.getTranslation(kieli, translationKey, parameters)
    s"""<span style="white-space: pre-wrap;">$translation</span>"""
  }

  private def kappale(
    kieli: Kieli,
    translationKey: String | Array[String],
    parameters: Map[String, String] = Map()
  ): String = {
    val rivit = translationKey match {
      case key: String         => rivi(kieli, key, parameters)
      case keys: Array[String] => keys.map(key => rivi(kieli, key, parameters)).mkString("<br>")
    }
    s"""<p>$rivit</p>"""
  }

  private def kappaleet(
    kieli: Kieli,
    translationKeys: Seq[String],
    parameters: Map[String, String] = Map()
  ): String =
    translationKeys.map(key => kappale(kieli, key, parameters)).mkString

  private def otsikko(kieli: Kieli, translationKey: String): String =
    s"""<p><b><strong style="white-space: pre-wrap;">${translationService.getTranslation(
        kieli,
        translationKey
      )}</strong></b></p>"""

  private[service] def maaraAika(timezone: ZoneId) =
    ZonedDateTime.now(timezone).plusDays(TAYDENNYSPYYNTO_VASTAUSAIKA_PAIVIA).format(DATE_FORMATTER)

  private def pyydettavaAsiakirja(index: Int, kieli: Kieli, asiakirja: PyydettavaAsiakirja): String = {
    val transKey = s"hakemus.viesti.taydennyspyynto.pyydettavatAsiakirjat.${asiakirja.asiakirjanTyyppi}"
    s"""<li value="$index"><span style="white-space: pre-wrap;">${translationService.getTranslation(
        kieli,
        transKey
      )}</span></li>"""
  }

  private def kaannosLaatijaInfo(viestiHakemusInfo: ViestiHakemusInfo): String = {
    if (viestiHakemusInfo.pyydettavatAsiakirjat.map(_.asiakirjanTyyppi).exists(KAANNOSTYYPPISET_ASIAKIRJAT.contains)) {
      val kieli = viestiHakemusInfo.kieli
      s"""${otsikko(kieli, "hakemus.viesti.taydennyspyynto.pyydettavatAsiakirjat.kaannoksenLaatija.otsikko")}
         |<ul>
         |<li value="1"><span style="white-space: pre-wrap;">${translationService.getTranslation(
          kieli,
          "hakemus.viesti.taydennyspyynto.pyydettavatAsiakirjat.kaannoksenLaatija.suomessaAuktorisoitu"
        )}</span><br>
         |<span style="white-space: pre-wrap;">${translationService.getTranslation(
          kieli,
          "hakemus.viesti.taydennyspyynto.pyydettavatAsiakirjat.kaannoksenLaatija.suomessaAuktorisoitu.lista"
        )}</span></li>
         |<li value="2"><span style="white-space: pre-wrap;">${translationService.getTranslation(
          kieli,
          "hakemus.viesti.taydennyspyynto.pyydettavatAsiakirjat.kaannoksenLaatija.lahtomaassaVirallinen"
        )} ${translationService.getTranslation(kieli, "yleiset.tai")}</span></li>
         |<li value="3"><span style="white-space: pre-wrap;">${translationService.getTranslation(
          kieli,
          "hakemus.viesti.taydennyspyynto.pyydettavatAsiakirjat.kaannoksenLaatija.asiakirjanAntaja"
        )}</span></li>
         |</ul>
         |""".stripMargin
    } else {
      ""
    }
  }
  private def pyydettavatAsiakirjat(viestiHakemusInfo: ViestiHakemusInfo): String = {
    if (viestiHakemusInfo.pyydettavatAsiakirjat.isEmpty) {
      ""
    } else {
      val kieli          = viestiHakemusInfo.kieli
      val asiakirjaLista = viestiHakemusInfo.pyydettavatAsiakirjat.zipWithIndex.map { case (asiakirja, idx) =>
        pyydettavaAsiakirja(idx + 1, kieli, asiakirja)
      }
      s"""${otsikko(kieli, "hakemus.viesti.taydennyspyynto.pyydettavatAsiakirjat.otsikko")}
         |<ul>${asiakirjaLista.mkString}</ul>
         |${kaannosLaatijaInfo(viestiHakemusInfo)}
         |""".stripMargin
    }
  }

  def generateTaydennyspyyntoSisalto(viestiHakemusInfo: ViestiHakemusInfo): String = {
    val kieli = viestiHakemusInfo.kieli
    s"""${otsikko(kieli, "hakemus.viesti.taydennyspyynto.ylaOtsikko")}
       |${kappale(
        kieli,
        Array("hakemus.viesti.sisalto.maaraaika", "hakemus.viesti.sisalto.asiatunnus"),
        Map(
          "date"       -> maaraAika(viestiHakemusInfo.requestTimezone),
          "asiatunnus" -> viestiHakemusInfo.asiatunnus.map(at => s"($at)").getOrElse("")
        )
      )}
       |${kappaleet(kieli, Seq("hakemus.viesti.sisalto.tervehdys", "hakemus.viesti.sisalto.tietoaHakemuksesta"))}
       |${otsikko(kieli, "hakemus.viesti.taydennyspyynto")}
       |${kappaleet(
        kieli,
        Seq("hakemus.viesti.taydennyspyynto.yleisOhje", "hakemus.viesti.taydennyspyynto.tarkentavaOhje")
      )}
       |${otsikko(kieli, "hakemus.viesti.taydennyspyynto.maaraaika.otsikko")}
       |${kappaleet(
        kieli,
        Seq(
          "hakemus.viesti.taydennyspyynto.maaraaika.yleisOhje",
          "hakemus.viesti.taydennyspyynto.maaraaika.tarkentavaOhje",
          "hakemus.viesti.taydennyspyynto.maaraaika.lisaaikaOhje"
        )
      )}
       |${pyydettavatAsiakirjat(viestiHakemusInfo)}
       |${otsikko(kieli, "hakemus.viesti.taydennyspyynto.kasittelyAika.otsikko")}
       |${kappale(kieli, "hakemus.viesti.taydennyspyynto.kasittelyAika.info")}
       |<br>${kappale(kieli, "hakemus.viesti.sisalto.lisatietoInfo")}
       |${generateAllekirjoitus(viestiHakemusInfo)}
       |""".stripMargin
  }

  def generateAllekirjoitus(viestiHakemusInfo: ViestiHakemusInfo): String = {
    val kieli           = viestiHakemusInfo.kieli
    val esittelija      = viestiHakemusInfo.esittelija
    val tervehdysTeksti =
      translationService.getTranslation(kieli, "hakemus.viesti.allekirjoitus.tervehdys")
    val ophTeksti =
      translationService.getTranslation(kieli, "hakemus.viesti.allekirjoitus.opetushallitus")
    val sahkopostiRivi =
      if (esittelija.sahkoposti.isDefined)
        s"""|<br><span style="white-space: pre-wrap;">${esittelija.sahkoposti.get}</span>"""
      else ""
    val puhnoRivi =
      if (esittelija.puhelinnumero.isDefined)
        s"""|<br><span style="white-space: pre-wrap;">${esittelija.puhelinnumero.get}</span>"""
      else ""
    s"""<p>
       |<span style="white-space: pre-wrap;">$tervehdysTeksti,</span>
       |<br><br>
       |<span style="white-space: pre-wrap;">${esittelija.kokoNimi()}</span>
       |<br>
       |<span style="white-space: pre-wrap;">$ophTeksti</span>
         $sahkopostiRivi
         $puhnoRivi
       |</p>""".stripMargin.replaceAll("\n", "")
  }
}
