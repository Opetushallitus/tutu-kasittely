package fi.oph.tutu.backend.service

import fi.oph.tutu.backend.UnitTestBase
import fi.oph.tutu.backend.domain.*
import fi.oph.tutu.backend.fixture.*
import fi.oph.tutu.backend.service.generator.perustelumuistio.*
import fi.oph.tutu.backend.utils.Constants
import org.junit.jupiter.api.{BeforeEach, Test}
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.when
import org.mockito.{Mock, MockitoAnnotations}
import org.mockito.invocation.InvocationOnMock

import java.time.LocalDateTime
import java.util.UUID

val translations = Map[String, String](
  "perustelumuistio.imipyynto.label"          -> "IMI-pyyntö:",
  "perustelumuistio.imipyynto.vastattu.label" -> "vastattu",
  "perustelumuistio.valmistuminenVahvistettu.vastaus.myonteinen" -> "Valmistuminen vahvistettu asiakirjan myöntäjältä tai toimivaltaiselta viranomaiselta\n  - Vastaus: myönteinen",
  "pferustelumuistio.valmistuminenVahvistettu.vastaus.kielteinen" -> "Valmistuminen vahvistettu asiakirjan myöntäjältä tai toimivaltaiselta viranomaiselta\n  - Vastaus: kielteinen",
  "perustelumuistio.valmistuminenVahvistettu.vastaus.vastaustaEiSaatu" -> "Valmistuminen vahvistettu asiakirjan myöntäjältä tai toimivaltaiselta viranomaiselta\n  - Vastaus: vastausta ei saatu",
  "perustelumuistio.selvityksetSaatu.vastaus.kylla"      -> "Kaikki tarvittavat selvitykset saatu: Kyllä",
  "perustelumuistio.selvityksetSaatu.vastaus.ei"         -> "Kaikki tarvittavat selvitykset saatu: Ei",
  "perustelumuistio.suostumusSahkoiseenAsiointiin.label" -> "Suostumus sähköiseen asiointiin:",
  "perustelumuistio.hakijanNimi.label"                   -> "Hakijan nimi:",
  "perustelumuistio.hakijanSyntymaaika.label"            -> "Hakijan syntymäaika: ",
  "perustelumuistio.hakemusKoskee.label"                 -> "Hakemus koskee:",
  "perustelumuistio.muuTutkinto.label"                   -> "Muu tutkinto:",
  "perustelumuistio.yhteistutkinto.value"                -> "Yhteistutkinto",
  "perustelumuistio.suoritusvuodet.label"                -> "Suoritusvuodet:",
  "perustelumuistio.ohjeellinenLaajuus.label"            -> "Ohjeellinen laajuus: ",
  "perustelumuistio.tutkintoonSisaltyiOpinnayte.label"   -> "Tutkintoon sisältyi opinnäytetyö: ",
  "perustelumuistio.tutkintoonSisaltyiHarjoittelu.label" -> "Tutkintoon sisältyi harjoittelu: ",
  "perustelumuistio.lisatietoaOpinnaytteeseenJaHArjoitteluun.label" -> "Lisätietoja opinnäytteisiin tai harjoitteluun liittyen: ",
  "perustelumuistio.virallinenTutkinnonMyontaja.kylla" -> "Virallinen tutkinnon myöntäjä: Kyllä",
  "perustelumuistio.virallinenTutkinnonMyontaja.ei"    -> "Virallinen tutkinnon myöntäjä: Ei",
  "perustelumuistio.virallinenTutkinto.kylla"          -> "Virallinen tutkinto: Kyllä",
  "perustelumuistio.virallinenTutkinto.ei"             -> "Virallinen tutkinto: Ei",
  "perustelumuistio.lahdeLahtomaanKansallinenLahde.value" -> "Lähde: Lähtömaan kansallinen lähde (verkkosivut, lainsäädäntö, julkaisut)",
  "perustelumuistio.lahdeLahtomaanVirallinenVastaus.value" -> "Lähde: Lähtömaan virallinen vastaus",
  "perustelumuistio.lahdeKansainvalinenHakuteosTaiVerkkosivusto.value" -> "Lähde: Kansainvälinen hakuteos tai verkkosivusto",
  "perustelumuistio.selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta.label" -> "Lyhyt selvitys tutkinnon myöntäjästä ja tutkinnon virallisuudesta:",
  "perustelumuistio.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa.alempi_korkeakouluaste" -> "Ylimmän tutkinnon asema lähtömaan järjestelmässä: Vähintään kolmivuotinen ensimmäisen vaiheen korkeakoulututkinto",
  "perustelumuistio.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa.ylempi_korkeakouluaste" -> "Ylimmän tutkinnon asema lähtömaan järjestelmässä: Toisen vaiheen korkeakoulututkinto",
  "perustelumuistio.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa.alempi_ja_ylempi_korkeakouluaste" -> "Ylimmän tutkinnon asema lähtömaan järjestelmässä: Yksiportainen tutkinto, johon sisältyvät ensimmäisen ja toisen vaiheen tutkinnot",
  "perustelumuistio.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa.tutkijakoulutusaste" -> "Ylimmän tutkinnon asema lähtömaan järjestelmässä: Tieteellinen jatkotutknto",
  "perustelumuistio.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa.ei_korkeakouluaste" -> "Ylimmän tutkinnon asema lähtömaan järjestelmässä: Alle korkeakoulutasoinen koulutus",
  "perustelumuistio.selvitysTutkinnonAsemastaLahtomaanJarjestelmassa.label" -> "Lyhyt selvitys tutkinnon asemasta lähtömaan järjestelmässä:",
  "perustelumuistio.jatkoOpintoKelpoisuus.toisen_vaiheen_korkeakouluopintoihin" -> "Jatko-opintokelpoisuus: toisen vaiheen korkeakouluopintoihin",
  "perustelumuistio.jatkoOpintoKelpoisuus.tieteellisiin_jatko-opintoihin" -> "Jatko-opintokelpoisuus: tieteellisiin jatko-opintoihin",
  "perustelumuistio.jatkoOpintoKelpoisuus.muu"             -> "Jatko-opintokelpoisuus: muu",
  "perustelumuistio.jatkoOpintoKelpoisuus.lisatieto.label" -> "Jatko-opintokelpoisuuus, lisätieto:",
  "perustelumuistio.aikaisemmatPaatokset.kylla"            -> "Opetushallitus on tehnyt vastaavia päätöksiä: Kyllä",
  "perustelumuistio.aikaisemmatPaatokset.ei"               -> "Opetushallitus on tehnyt vastaavia päätöksiä: Ei",
  "perustelumuistio.muuPerustelu.label"                    -> "Ratkaisun tai päätöksen muut perustelut:",
  "perustelumuistio.koulutuksenSisalto.label"              -> "Koulutuksen sisältö:",
  "perustelumuistio.uoro.koulutuserot.opettajat.monialaisetSisalto" -> "Ero monialaisten opintojen sisällössä",
  "perustelumuistio.uoro.koulutuserot.opettajat.monialaisetLaajuus" -> "Ero monialaisten opintojen laajuudessa",
  "perustelumuistio.uoro.koulutuserot.opettajat.pedagogisetSisalto" -> "Ero pedagogisten opintojen sisällössä",
  "perustelumuistio.uoro.koulutuserot.opettajat.pedagogisetLaajuus" -> "Ero pedagogisten opintojen laajuudessa",
  "perustelumuistio.uoro.koulutuserot.opettajat.kasvatustieteellisetLaajuus" -> "Ero kasvatustieteellisten opintojen laajuudessa (LO)",
  "perustelumuistio.uoro.koulutuserot.opettajat.kasvatustieteellisetVaativuus" -> "Ero kasvatustieteellisten opintojen vaativuudessa (LO)",
  "perustelumuistio.uoro.koulutuserot.opettajat.kasvatustieteellisetSisalto" -> "Ero kasvatustieteellisten opintojen sisällössä (LO)",
  "perustelumuistio.uoro.koulutuserot.opettajat.opetettavatAineetSisalto" -> "Ero opetettavan aineen opintojen sisällössä",
  "perustelumuistio.uoro.koulutuserot.opettajat.opetettavatAineetVaativuus" -> "Ero opetettavan aineen opintojen vaativuudessa",
  "perustelumuistio.uoro.koulutuserot.opettajat.opetettavatAineetLaajuus" -> "Ero opetettavan aineen opintojen laajuudessa",
  "perustelumuistio.uoro.koulutuserot.opettajat.erityisopettajaSisalto" -> "Ero erityisopettajan opintojen sisällössä",
  "perustelumuistio.uoro.koulutuserot.opettajat.erityisopettajaLaajuus" -> "Ero erityisopettajan opintojen laajuudessa",
  "perustelumuistio.uoro.koulutuserot.muu"                              -> "Muu ero",
  "perustelumuistio.uoro.koulutuserot.muuLabel"                         -> "Muu ero:",
  "perustelumuistio.uoro.koulutuserot.vkopettajat.kasvatustieteellisetLaajuus" -> "Ero kasvatustieteellisten opintojen laajuudessa",
  "perustelumuistio.uoro.koulutuserot.vkopettajat.kasvatustieteellisetSisalto" -> "Ero kasvatustieteellisten opintojen sisällössä",
  "perustelumuistio.uoro.koulutuserot.vkopettajat.opintojenLaajuus" -> "Ero varhaiskasvatuksen ja esiopetuksen opintojen laajuudessa",
  "perustelumuistio.uoro.koulutuserot.vkopettajat.opintojenSisalto" -> "Ero varhaiskasvatuksen ja esiopetuksen opintojen sisällössä",
  "perustelumuistio.uoro.koulutuserot.otm.opintojenLaajuus"   -> "Ero oikeustieteellisten opintojen laajuudessa",
  "perustelumuistio.uoro.koulutuserot.otm.opintojenVaativuus" -> "Ero oikeustieteellisten opintojen vaativuudessa",
  "perustelumuistio.uoro.koulutuserot.otm.opintojenSisalto"   -> "Ero oikeustieteellisten opintojen sisällössä",
  "perustelumuistio.uoro.muuTutkintoTaiSuoritus.label"        -> "Muu tutkinto tai opintosuoritus:",
  "perustelumuistio.ap.lakiperuste.toisessaJasenmaassaSaanneltyKoulutus" -> "Toisessa jäsenmaassa säänneltyyn ammattiin johtanut koulutus tai säännelty ammatillinen koulutus",
  "perustelumuistio.ap.lakiperuste.lahtomaassaSaavutetutOikeudet" -> "Pätevyys ammattiin lähtömaassa saavutettujen oikeuksien nojalla",
  "perustelumuistio.ap.lakiperuste.toinenEUMaaTunnustanut" -> "EU-kansalaisen EU:n ulkopuolella hankkima ammattipätevyys, jonka toinen EU-maa on tunnustanut, ja henkilöllä on jäsenmaassa hankittu",
  "perustelumuistio.ap.lakiperuste.saantelematonAmmattiJaTyokokemus" -> "Lähtömaassa sääntelemätön ammatti tai koulutus ja hakijalla vähintään vuoden ammattikokemus maasta, joka ei sääntele ammattia",
  "perustelumuistio.ap.todistusEUKansalaisuusAsemasta.label" -> "Todistus, joka todistaa EU-kansalaisuuteen rinnaisteisen aseman:",
  "perustelumuistio.ap.ammattiJohonPatevoitynyt.label" -> "Mihin ammattiin hakija on pätevöitynyt toisessa jäsenmaassa:",
  "perustelumuistio.ap.ammattitoiminnanSisalto.label"        -> "Ammattitoiminnan pääasiallinen sisältö lähtömaassa:",
  "perustelumuistio.ap.koulutuksenKestoJaSisalto.label"      -> "Koulutuksen kesto ja pääasiallinen sisältö:",
  "perustelumuistio.ap.selvitykset.lahtomaanViranomaiselta"  -> "Vastaus lähtömaan toimivaltaiselta viranomaiselta",
  "perustelumuistio.ap.selvitykset.lahtomaanLainsaadannosta" -> "Selvitetty lähtömaan lainsäädännöstä",
  "perustelumuistio.ap.selvitykset.aikaisempiTapaus" -> "Selvitetty aikaisempien samanlaisten tapausten yhteydessä",
  "perustelumuistio.ap.selvitykset.aikaisempiTapausLabel" -> "Selvitetty aikaisempien samanlaisten tapausten yhteydessä. Asiatunnus: ",
  "perustelumuistio.ap.selvitykset.asiakirjoista"             -> "Ilmenee hakijan esittämistä asiakirjoista",
  "perustelumuistio.ap.lisatietoja.label"                     -> "Lisätietoja:",
  "perustelumuistio.ap.IMIHalytyksetTarkastettu"              -> "IMI-hälytykset tarkistettu",
  "perustelumuistio.ap.muutPerustelut.label"                  -> "Muut AP-päätöksen perustelut:",
  "perustelumuistio.ap.SEUTArviointi.label"                   -> "SEUT-arviointi:",
  "perustelumuistio.lausuntopyynnot.lausunnonAntaja.muuLabel" -> "Lausunnon antaja, muu:",
  "perustelumuistio.lausuntopyynnot.lausunnonAntaja.muu"      -> "Lausunnon antaja, muu",
  "perustelumuistio.lausuntopyynnot.lausunnonAntaja.label"    -> "Lausunnon antaja:",
  "perustelumuistio.lausuntopyynnot.lahetetty.label"          -> "Lähetetty:",
  "perustelumuistio.lausuntopyynnot.saapunut.label"           -> "Saapunut:",
  "perustelumuistio.lausuntopyynnot.sisalto.label"            -> "Lausunnon sisältö:",
  "perustelumuistio.asiakirjat.esittelijanHuomiot.label"      -> "Esittelijän huomioita asiakirjoista:",
  "perustelumuistio.SEUTArviointi"                            -> "SEUT-arviointi tehty",
  "perustelumuistio.ratkaisutyyppi.paatos"                    -> "Ratkaisutyyppi: Päätös",
  "perustelumuistio.ratkaisutyyppi.peruutusTaiRaukeaminen"    -> "Ratkaisutyyppi: Peruutus tai raukeaminen",
  "perustelumuistio.ratkaisutyyppi.oikaisu"                   -> "Ratkaisutyyppi: Oikaisu",
  "perustelumuistio.ratkaisutyyppi.jatetaanTutkimatta"        -> "Ratkaisutyyppi: Jätetään tutkimatta",
  "perustelumuistio.ratkaisutyyppi.siirto"                    -> "Ratkaisutyyppi: Siirto",
  "perustelumuistio.paatostyyppi.taso"                        -> "Päätöstyyppi: Taso",
  "perustelumuistio.paatostyyppi.kelpoisuus"                  -> "Päätöstyyppi: Kelpoisuus",
  "perustelumuistio.paatostyyppi.tiettyTutkintoTaiOpinnot"    -> "Päätöstyyppi: Tietty tutkinto tai opinnot",
  "perustelumuistio.paatostyyppi.riittavatOpinnot"            -> "Päätöstyyppi: Riittävät opinnot",
  "perustelumuistio.paatostyyppi.lopullinenPaatos"            -> "Päätöstyyppi: Lopullinen päätös",
  "perustelumuistio.sovellettuLaki.uo"                        -> "Sovellettu laki: Päätös UO",
  "perustelumuistio.sovellettuLaki.ap"                        -> "Sovellettu laki: Päätös AP",
  "perustelumuistio.sovellettuLaki.apSeut"                    -> "Sovellettu laki: Päätös AP/SEUT",
  "perustelumuistio.sovellettuLaki.ro"                        -> "Sovellettu laki: Päätös RO",
  "perustelumuistio.tutkinnonNimi.label"                      -> "Tutkinnon nimi, jota päätös koskee:",
  "perustelumuistio.myonteinenTaiKielteinen.label"            -> "Päätös on myönteinen:",
  "perustelumuistio.tutkinnonTaso.alempiKorkeakoulu"          -> "Tutkinnon taso: Alempi korkeakoulututkinto",
  "perustelumuistio.tutkinnonTaso.ylempiKorkeakoulu"          -> "Tutkinnon taso: Ylempi korkeakoulututkinto",
  "perustelumuistio.kielteinenPaatos.perustelu.epavirallinenKorkeakoulu" -> "- Epävirallinen korkeakoulu",
  "perustelumuistio.kielteinenPaatos.perustelu.epavirallinenTutkinto"    -> "- Epävirallinen tutkinto",
  "perustelumuistio.kielteinenPaatos.perustelu.eiVastaaTasoltaanSuomalaista" -> "- Ei tasoltaan vastaa Suomessa suoritettavaa korkeakoulututkintoa",
  "perustelumuistio.kielteinenPaatos.perustelu.muuLabel" -> "- Muu perustelu:",
  "perustelumuistio.kielteinenPaatos.perustelu.label"    -> "Kielteisen päätöksen perustelut:",
  "perustelumuistio.peruutusTaiRaukeaminen.syy.eiSaaHakemaansa" -> "- Ei voi saada hakemaansa päätöstä, eikä halua päätöstä jonka voisi saada",
  "perustelumuistio.peruutusTaiRaukeaminen.syy.muutenTyytymatonRatkaisuun" -> "- On muuten tyytymätön ratkaisuun",
  "perustelumuistio.peruutusTaiRaukeaminen.syy.eiAPLainMukainenTaiHaettuaAmmattipatevyytta" -> "- Ei AP-lain mukainen tutkinto tai haettua ammattipätevyyttä",
  "perustelumuistio.peruutusTaiRaukeaminen.syy.eiVastaaTasoltaanSuomalaista" -> "- Ei tasoltaan vastaa Suomessa suoritettavaa korkeakoulututkintoa",
  "perustelumuistio.peruutusTaiRaukeaminen.syy.epavirallinenKorkeakouluTaiTutkinto" -> "- Epävirallinen korkeakoulu tai tutkinto",
  "perustelumuistio.peruutusTaiRaukeaminen.syy.eiEdellytyksiaROTaiTasopaatokselle" -> "- Ei edellytyksiä RO- eikä tasopäätökselle",
  "perustelumuistio.peruutusTaiRaukeaminen.syy.eiEdellytyksiaRinnastukselle" -> "- Ei edellytyksiä rinnastaa tiettyihin korkeakouluopintoihin",
  "perustelumuistio.peruutusTaiRaukeaminen.syy.hakijallaOnJoPaatosKoulutuskokonaisuudesta" -> "- Hakijalla on jo päätös samasta koulutuskokonaisuudesta",
  "perustelumuistio.peruutusTaiRaukeaminen.syy.muu"                         -> "- Muu syy, esim. aikataulu",
  "perustelumuistio.peruutusTaiRaukeaminen.syy.label"                       -> "Peruutuksen tai raukeamisen syyt:",
  "perustelumuistio.rinnastettavatTutkinnotTaiOpinnot.label"                -> "Rinnastettavat tutkinnot tai opinnot:",
  "perustelumuistio.kelpoisuudet.label"                                     -> "Kelpoisuudet:",
  "perustelumuistio.tutkinnonTaiOpinnonLisavaatimukset.taydentavatOpinnot"  -> "- Täydentävät opinnot",
  "perustelumuistio.tutkinnonTaiOpinnonLisavaatimukset.kelpoisuuskoe"       -> "- Kelpoisuuskoe",
  "perustelumuistio.tutkinnonTaiOpinnonLisavaatimukset.sopeutumisaika"      -> "- Sopeutumisaika",
  "perustelumuistio.tutkinnonTaiOpinnonLisavaatimukset.label"               -> "Lisävaatimukset:",
  "perustelumuistio.kelpoisuudenLisavaatimukset.olennaisiaEroja"            -> "- Olennaisia eroja",
  "perustelumuistio.kelpoisuudenLisavaatimukset.erotKoulutuksessa.muuLabel" -> "- Muu ero:",
  "perustelumuistio.kelpoisuudenLisavaatimukset.erotKoulutuksessa.label"    -> "Erot koulutuksessa:",
  "perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.ammattikokemus" -> "- Ammattikokemus",
  "perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.elinikainenOppiminen" -> "- Elinikäinen oppiminen",
  "perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.lisatietoLabel" -> "- Lisätieto:",
  "perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.korvaavuus.taysin" -> "- Korvaako ammattikokemus tai elinikäinen oppiminen olennaisen eron?: Täysin",
  "perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.korvaavuus.osittain" -> "- Korvaako ammattikokemus tai elinikäinen oppiminen olennaisen eron?: Osittain",
  "perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.korvaavuus.ei" -> "- Korvaako ammattikokemus tai elinikäinen oppiminen olennaisen eron?: Ei, käytetään lähtökohtaista korvaavaa toimenpidettä",
  "perustelumuistio.kelpoisuudenLisavaatimukset.label"          -> "Lisävaatimukset:",
  "perustelumuistio.korvaavaToimenpide.label"                   -> "Korvaava toimenpide:",
  "perustelumuistio.kelpoisuuskoe.sisalto.aihealue1"            -> "- Aihealue 1",
  "perustelumuistio.kelpoisuuskoe.sisalto.aihealue2"            -> "- Aihealue 2",
  "perustelumuistio.kelpoisuuskoe.sisalto.aihealue3"            -> "- Aihealue 3",
  "perustelumuistio.kelpoisuuskoe.label"                        -> "- Kelpoisuuskoe:",
  "perustelumuistio.sopeutumisajanKesto.label"                  -> "- Sopeutumisajan kesto:",
  "perustelumuistio.paatosEsitys.label"                         -> "Päätösesitys:",
  "perustelumuistio.esittelija.label"                           -> "Esittelijä:",
  "perustelumuistio.kasittelyajat.kirjauksestaEsittelyyn.label" -> "Aika kirjauspäivämäärästä esittelypäivämäärään",
  "perustelumuistio.kasittelyajat.asiakirjastaRatkaisuun.label" -> "Aika hakijan viimeisestä asiakirjasta ratkaisupäivämäärään",
  "perustelumuistio.kasittelyajat.yksikko.kuukautta" -> "kk",
  "perustelumuistio.perustelu.label"                 -> "Perustelu:"
)

class PerusteluMuistioGeneratorTest extends UnitTestBase {

  val noneHakemus: Option[Hakemus]           = None
  val noneAtaruHakemus: Option[AtaruHakemus] = None
  val nonePerustelu: Option[Perustelu]       = None
  val nonePaatos: Option[Paatos]             = None

  val emptyPerustelu: Option[Perustelu] = Some(
    Perustelu(
      id = None,
      hakemusId = None,
      virallinenTutkinnonMyontaja = None,
      virallinenTutkinto = None,
      lahdeLahtomaanKansallinenLahde = false,
      lahdeLahtomaanVirallinenVastaus = false,
      lahdeKansainvalinenHakuteosTaiVerkkosivusto = false,
      selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta = "",
      ylimmanTutkinnonAsemaLahtomaanJarjestelmassa = None,
      selvitysTutkinnonAsemastaLahtomaanJarjestelmassa = "",
      aikaisemmatPaatokset = None,
      jatkoOpintoKelpoisuus = None,
      jatkoOpintoKelpoisuusLisatieto = None,
      muuPerustelu = None,
      lausuntoPyyntojenLisatiedot = None,
      lausunnonSisalto = None,
      lausuntopyynnot = Seq.empty,
      luotu = None,
      luoja = None,
      muokattu = None,
      muokkaaja = None,
      uoRoSisalto = UoRoSisalto(),
      apSisalto = APSisalto(
        IMIHalytysTarkastettu = None
      )
    )
  )

  val someHakemus: Option[Hakemus] = Some(
    Hakemus(
      hakemusOid = UUID.randomUUID().toString,
      lomakeOid = UUID.randomUUID().toString,
      lomakeId = 1527182,
      lomakkeenKieli = "en",
      hakija = hakijaFixture,
      sisalto = Seq(
        SisaltoItem(
          key = Constants.ATARU_HAKEMUS_KOSKEE.generatedId,
          fieldType = "String",
          value = Seq(
            SisaltoValue(
              label = Map(
                Kieli.fi -> "HakemusKoskee -- fi",
                Kieli.sv -> "HakemusKoskee -- sv",
                Kieli.en -> "HakemusKoskee -- en"
              ),
              value = "",
              followups = Seq.empty
            )
          ),
          label = Map(
            Kieli.fi -> "Hakemus koskee",
            Kieli.sv -> "Hakemus koskee",
            Kieli.en -> "Hakemus koskee"
          ),
          children = Seq.empty,
          infoText = None
        ),
        SisaltoItem(
          key = Constants.ATARU_SAHKOISEN_ASIOINNIN_LUPA.generatedId,
          fieldType = "String",
          value = Seq(
            SisaltoValue(
              label = Map(
                Kieli.fi -> "Sähköinen asiointi sallittu: Kyllä",
                Kieli.sv -> "Sähköinen asiointi sallittu: Kyllä",
                Kieli.en -> "Sähköinen asiointi sallittu: Kyllä"
              ),
              value = "",
              followups = Seq.empty
            )
          ),
          label = Map(
            Kieli.fi -> "Sähköinen asiointi sallittu",
            Kieli.sv -> "Sähköinen asiointi sallittu",
            Kieli.en -> "Sähköinen asiointi sallittu"
          ),
          children = Seq.empty,
          infoText = None
        )
      ),
      liitteidenTilat = Seq.empty,
      hakemusKoskee = 1,
      asiatunnus = None,
      saapumisPvm = None,
      esittelyPvm = None,
      paatosPvm = None,
      esittelijaOid = None,
      ataruHakemuksenTila = AtaruHakemuksenTila.Kasittelyssa,
      kasittelyVaihe = KasittelyVaihe.AlkukasittelyKesken,
      muokattu = None,
      muokkaaja = "",
      muutosHistoria = Seq.empty,
      taydennyspyyntoLahetetty = None,
      yhteistutkinto = true,
      asiakirja = Some(
        Asiakirja(
          selvityksetSaatu = true,
          valmistumisenVahvistus = ValmistumisenVahvistus(
            valmistumisenVahvistus = true,
            valmistumisenVahvistusPyyntoLahetetty = None,
            valmistumisenVahvistusSaatu = None,
            valmistumisenVahvistusVastaus = Some(ValmistumisenVahvistusVastaus.Myonteinen),
            valmistumisenVahvistusLisatieto = None
          ),
          imiPyynto = ImiPyynto(
            imiPyynto = Some(true),
            imiPyyntoNumero = Some("IMI-nro 3"),
            imiPyyntoLahetetty = Some(LocalDateTime.of(2020, 5, 15, 0, 0)),
            imiPyyntoVastattu = Some(LocalDateTime.of(2020, 6, 1, 0, 0))
          ),
          esittelijanHuomioita = Some("Muistioon merkittävää tekstiä asiakirjoista -- body")
        )
      ),
      esittelijanHuomioita = None
    )
  )

  val tutkinnot: Seq[Tutkinto] = Seq(
    Tutkinto(
      id = None,
      jarjestys = "MUU",
      hakemusId = UUID.randomUUID,
      nimi = None,
      oppilaitos = None,
      muuTutkintoTieto = Some("Muu tutkinto sisältö")
    ),
    Tutkinto(
      id = None,
      jarjestys = "1",
      hakemusId = UUID.randomUUID,
      nimi = Some("Paras tutkinto"),
      oppilaitos = None,
      maakoodiUri = Some("mock_maakoodiuri"),
      aloitusVuosi = Some(2000),
      paattymisVuosi = Some(2001),
      ohjeellinenLaajuus = Some("20op"),
      opinnaytetyo = Some(true),
      harjoittelu = Some(false),
      perustelunLisatietoja = Some("Vastaa perusopintoja"),
      koulutusalaKoodiUri = Some("testi-koulutusala-uri")
    )
  )

  val someAtaruHakemus: Option[AtaruHakemus] = Some(
    AtaruHakemus(
      haku = None,
      etunimet = "Testi Kolmas",
      key = "",
      form_id = 1,
      content = Content(
        answers = Seq(
          Answer(
            key = Constants.ATARU_SAHKOISEN_ASIOINNIN_LUPA.generatedId,
            value = SingleValue("0"),
            fieldType = ""
          )
        )
      ),
      latestVersionCreated = "",
      state = "",
      modified = "",
      submitted = "",
      lang = "en",
      sukunimi = "Hakija",
      `application-review-notes` = None,
      henkilotunnus = None,
      `person-oid` = UUID.randomUUID().toString,
      `application-hakukohde-attachment-reviews` = Seq.empty,
      `application-hakukohde-reviews` = Seq.empty,
      hakutoiveet = Seq.empty,
      `information-request-timestamp` = None
    )
  )

  val somePerustelu: Option[Perustelu] = Some(
    Perustelu(
      id = Some(UUID.randomUUID()),
      hakemusId = Some(UUID.randomUUID()),
      virallinenTutkinnonMyontaja = Some(true),
      virallinenTutkinto = Some(true),
      lahdeLahtomaanKansallinenLahde = true,
      lahdeLahtomaanVirallinenVastaus = true,
      lahdeKansainvalinenHakuteosTaiVerkkosivusto = true,
      selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta = "Selvitetty",
      ylimmanTutkinnonAsemaLahtomaanJarjestelmassa = Some("alempi_korkeakouluaste"),
      selvitysTutkinnonAsemastaLahtomaanJarjestelmassa = "Selvitetty",
      aikaisemmatPaatokset = Some(true),
      jatkoOpintoKelpoisuus = Some("tieteellisiin_jatko-opintoihin"),
      jatkoOpintoKelpoisuusLisatieto = None,
      muuPerustelu = Some("Hyvin suoritettu"),
      lausuntoPyyntojenLisatiedot = None,
      lausunnonSisalto = Some("Hakija on suorittanut tutkinnon kirjeopintoina"),
      lausuntopyynnot = Seq(
        Lausuntopyynto(
          id = None,
          perusteluId = None,
          jarjestys = Some(1),
          lausunnonAntajaKoodiUri = Some("testi-korkeakoulu"),
          lausunnonAntajaMuu = None,
          lahetetty = Some(LocalDateTime.parse("2025-07-01T00:00:00")),
          saapunut = Some(LocalDateTime.parse("2025-07-02T00:00:00"))
        ),
        Lausuntopyynto(
          id = None,
          perusteluId = None,
          jarjestys = Some(2),
          lausunnonAntajaKoodiUri = Some("muu"),
          lausunnonAntajaMuu = Some("HOKS tuutori"),
          lahetetty = Some(LocalDateTime.parse("2025-07-01T00:00:00")),
          saapunut = None
        )
      ),
      luotu = None,
      luoja = None,
      muokattu = None,
      muokkaaja = None,
      uoRoSisalto = UoRoSisalto(
        opettajatEroMonialaisetOpinnotSisalto = Some(true),
        opettajatMuuEro = Some(true),
        opettajatMuuEroSelite = Some("Tutkinto ei vaadi opetusnäytettä"),
        muuTutkinto = Some("Muu tutkinto tai opintosuoritus -- body"),
        koulutuksenSisalto = Some("Koulutuksen sisältö muistio -- body")
      ),
      apSisalto = APSisalto(
        lakiperusteToisessaJasenmaassaSaannelty = Some(true),
        lakiperustePatevyysLahtomaanOikeuksilla = Some(true),
        lakiperusteToinenEUmaaTunnustanut = Some(true),
        lakiperusteLahtomaassaSaantelematon = Some(true),
        todistusEUKansalaisuuteenRinnasteisestaAsemasta = Some("todistus"),
        ammattiJohonPatevoitynyt = Some("lähihoitaja"),
        ammattitoiminnanPaaAsiallinenSisalto = Some("käytännön työ"),
        koulutuksenKestoJaSisalto = Some("alusta loppuun asti"),
        selvityksetLahtomaanViranomaiselta = Some(true),
        selvityksetLahtomaanLainsaadannosta = Some(true),
        selvityksetAikaisempiTapaus = Some(true),
        selvityksetAikaisemmanTapauksenAsiaTunnus = Some("asia #6"),
        selvityksetIlmeneeAsiakirjoista = Some(true),
        lisatietoja = Some("annetaan pyydettäessä"),
        IMIHalytysTarkastettu = Some(true),
        muutAPPerustelut = Some("pätevä on"),
        SEUTArviointi = Some("hyväksi todettu")
      )
    )
  )

  val somePaatos: Option[Paatos] = Some(Paatos())

  @Mock
  var koodistoService: KoodistoService = _

  def setupKorkeakoulut(): Unit = {
    when(koodistoService.haeKorkeakoulut()).thenReturn(
      Seq(
        KoodistoItem(
          koodiUri = "testi-korkeakoulu",
          koodiArvo = "testi-korkeakoulu",
          nimi = Map(
            Kieli.fi -> "Paras korkeakoulu",
            Kieli.sv -> "Bästa högskolan",
            Kieli.en -> "Best college"
          ),
          voimassaAlkuPvm = None,
          voimassaLoppuPvm = None,
          tila = None
        )
      )
    )
  }

  def setupKoulutusalat(): Unit = {
    when(koodistoService.getKoodisto("kansallinenkoulutusluokitus2016koulutusalataso1"))
      .thenReturn(
        Seq(
          KoodistoItem(
            koodiUri = "testi-koulutusala-uri",
            koodiArvo = "testi-koulutusala-uri",
            nimi = Map(
              Kieli.fi -> "Alkutuotanto",
              Kieli.sv -> "Bästa production",
              Kieli.en -> "Primary production"
            ),
            voimassaAlkuPvm = None,
            voimassaLoppuPvm = None,
            tila = None
          )
        )
      )
  }

  @Mock
  var maakoodiService: MaakoodiService = _

  def setupMaakoodit(): Unit = {
    when(maakoodiService.getMaakoodiByUri(any[String])).thenReturn(
      Some(
        Maakoodi(
          id = UUID.randomUUID,
          esittelijaId = None,
          koodiUri = "",
          fi = "Suomenmaa",
          sv = "Ruotsinmaa",
          en = "Englanninmaa"
        )
      )
    )
  }

  @Mock
  var onrService: OnrService = _

  @Mock
  var translationService: TranslationService = _

  @BeforeEach
  def setup(): Unit = {
    MockitoAnnotations.openMocks(this)
    when(
      translationService.getTranslation(any[String], any[String])
    ).thenAnswer(i => {
      val key = i.getArguments.apply(1).asInstanceOf[String]
      translations.applyOrElse(key, key => key)
    })
  }

  @Test
  def generatesAStringWhenInputsDefined(): Unit = {
    setupMaakoodit()
    setupKorkeakoulut()
    setupKoulutusalat()

    when(onrService.haeNimiOption(any[Some[String]])).thenReturn(Some("Erkki Esittelijä"))

    val result = generate(
      koodistoService,
      maakoodiService,
      onrService,
      translationService,
      someHakemus,
      tutkinnot,
      someAtaruHakemus,
      somePerustelu,
      somePaatos
    )
    assert(result.nonEmpty)
  }

  @Test
  def haeHakijanNimiProducesString(): Unit = {
    val result = haeHakijanNimi(translationService, someHakemus)
    assert(result.get.contains(hakijaFixture.etunimet))
    assert(result.get.contains(hakijaFixture.sukunimi))
  }

  @Test
  def haeHakijanSyntymaaikaProducesString(): Unit = {
    val result = haeHakijanSyntymaaika(translationService, someHakemus)
    assert(result.get.contains(hakijaFixture.syntymaaika))
  }

  @Test
  def haeHakemusKoskeeProducesString(): Unit = {
    val result = haeHakemusKoskee(translationService, someHakemus)
    assert(result.get.contains("HakemusKoskee -- en"))
  }

  @Test
  def haeSuostumusSahkoiseenAsiointiinProducesString(): Unit = {
    val result = haeSuostumusSahkoiseenAsiointiin(translationService, someHakemus)
    assert(result.get.contains("Sähköinen asiointi sallittu"))
  }

  @Test
  def haeMuuTutkintoProducesString(): Unit = {
    val result = haeMuuTutkinto(translationService, tutkinnot)
    assert(result.get.contains("Muu tutkinto sisältö"))
  }

  @Test
  def haeYhteistutkintoProducesString(): Unit = {
    val result = haeYhteistutkinto(translationService, someHakemus)
    assert(result.get.contains("Yhteistutkinto"))
  }

  @Test
  def haeTutkintokohtaisetTiedotProducesString(): Unit = {
    setupMaakoodit()
    setupKoulutusalat()

    val result =
      haeTutkintokohtaisetTiedot(translationService, maakoodiService, koodistoService, someHakemus, tutkinnot)
    assert(result.get.contains("Paras tutkinto"))
    assert(result.get.contains("Englanninmaa"))
  }

  @Test
  def haeYleisetPerustelutProducesNoneForNone(): Unit = {
    val result = haeYleisetPerustelut(translationService, nonePerustelu)
    assert(result.isEmpty)
  }

  @Test
  def haeYleisetPerustelutProducesNoneForEmptyPerustelu(): Unit = {
    val result = haeYleisetPerustelut(translationService, emptyPerustelu)
    assert(result.isEmpty)
  }

  @Test
  def haeYleisetPerustelutProducesStringForDataInPerustelu(): Unit = {
    val result = haeYleisetPerustelut(translationService, somePerustelu)

    assert(result.nonEmpty)
    assert(result.get.contains("Virallinen tutkinnon myöntäjä"))
    assert(result.get.contains("Virallinen tutkinto"))
    assert(result.get.contains("Lähde: Lähtömaan kansallinen lähde"))
    assert(result.get.contains("Lähde: Lähtömaan virallinen vastaus"))
    assert(result.get.contains("Lähde: Kansainvälinen hakuteos tai verkkosivusto"))
    assert(result.get.contains("Lyhyt selvitys tutkinnon myöntäjästä ja tutkinnon virallisuudesta"))
    assert(result.get.contains("Ylimmän tutkinnon asema lähtömaan järjestelmässä"))
    assert(result.get.contains("Lyhyt selvitys tutkinnon asemasta lähtömaan järjestelmässä"))
  }

  @Test
  def haeJatkoOpintoKelpoisuusProducesString(): Unit = {
    val result = haeJatkoOpintoKelpoisuus(translationService, somePerustelu)

    assert(result.get.contains("Jatko-opintokelpoisuus: tieteellisiin jatko-opintoihin"))
  }

  @Test
  def haeJatkoOpintoKelpoisuusMuuProducesString(): Unit = {
    val result = haeJatkoOpintoKelpoisuus(
      translationService,
      somePerustelu.map(perustelu =>
        perustelu.copy(
          jatkoOpintoKelpoisuus = Some("muu"),
          jatkoOpintoKelpoisuusLisatieto = Some("Jatkoon")
        )
      )
    )

    assert(result.get.contains("Jatko-opintokelpoisuus: muu"))
    assert(result.get.contains("Jatko-opintokelpoisuuus, lisätieto"))
    assert(result.get.contains("Jatkoon"))
  }

  @Test
  def haeAikaisemmatPaatoksetProducesString(): Unit = {
    val result = haeAikaisemmatPaatokset(translationService, somePerustelu)

    assert(result.get.contains("Opetushallitus on tehnyt vastaavia päätöksiä: Kyllä"))
  }

  @Test
  def haeMuuPerusteluProducesString(): Unit = {
    val result = haeMuuPerustelu(translationService, somePerustelu)

    assert(result.get.contains("Ratkaisun tai päätöksen muut perustelut"))
    assert(result.get.contains("Hyvin suoritettu"))
  }

  @Test
  def haeUoRoPerusteluProducesString(): Unit = {
    val result = haeUoRoPerustelu(translationService, somePerustelu)

    assert(result.get.contains("Ero monialaisten opintojen sisällössä"))
    assert(result.get.contains("Muu ero"))
    assert(result.get.contains("Tutkinto ei vaadi opetusnäytettä"))

    assert(result.get.contains("Koulutuksen sisältö muistio -- body"))
    assert(result.get.contains("Muu tutkinto tai opintosuoritus -- body"))
  }

  @Test
  def haeApPerusteluProducesString(): Unit = {
    val result = haeApPerustelu(translationService, somePerustelu)

    assert(
      result.get.contains(
        "Toisessa jäsenmaassa säänneltyyn ammattiin johtanut koulutus tai säännelty ammatillinen koulutus"
      )
    )
    assert(result.get.contains("Pätevyys ammattiin lähtömaassa saavutettujen oikeuksien nojalla"))
    assert(
      result.get.contains(
        "EU-kansalaisen EU:n ulkopuolella hankkima ammattipätevyys, jonka toinen EU-maa on tunnustanut, ja henkilöllä on jäsenmaassa hankittu"
      )
    )
    assert(
      result.get.contains(
        "Lähtömaassa sääntelemätön ammatti tai koulutus ja hakijalla vähintään vuoden ammattikokemus maasta, joka ei sääntele ammattia"
      )
    )

    assert(result.get.contains("Todistus, joka todistaa EU-kansalaisuuteen rinnaisteisen aseman"))
    assert(result.get.contains("Mihin ammattiin hakija on pätevöitynyt toisessa jäsenmaassa"))
    assert(result.get.contains("Ammattitoiminnan pääasiallinen sisältö lähtömaassa"))
    assert(result.get.contains("Koulutuksen kesto ja pääasiallinen sisältö"))

    assert(result.get.contains("Vastaus lähtömaan toimivaltaiselta viranomaiselta"))
    assert(result.get.contains("Selvitetty lähtömaan lainsäädännöstä"))
    assert(result.get.contains("Selvitetty aikaisempien samanlaisten tapausten yhteydessä. Asiatunnus"))
    assert(result.get.contains("Ilmenee hakijan esittämistä asiakirjoista"))

    assert(result.get.contains("Lisätietoja"))
    assert(result.get.contains("IMI-hälytykset tarkistettu"))
    assert(result.get.contains("Muut AP-päätöksen perustelut"))
    assert(result.get.contains("SEUT-arviointi"))
  }

  @Test
  def haeLausuntopyynnotProducesString(): Unit = {
    setupKorkeakoulut()

    val result = haeLausuntopyynnot(translationService, koodistoService, somePerustelu)

    assert(result.get.contains("Lausunnon antaja, muu: HOKS tuutori"))
    assert(result.get.contains("Lausunnon antaja: Paras korkeakoulu"))
    assert(result.get.contains("Lausunnon sisältö:"))
    assert(result.get.contains("Hakija on suorittanut tutkinnon kirjeopintoina"))
  }

  @Test
  def haeAsiakirjatProducesString(): Unit = {
    val result = haeAsiakirjat(translationService, someHakemus)

    assert(result.get.contains("Kaikki tarvittavat selvitykset saatu: Kyllä"))
    assert(result.get.contains("Esittelijän huomioita asiakirjoista"))
    assert(result.get.contains("Muistioon merkittävää tekstiä asiakirjoista -- body"))
    assert(result.get.contains("IMI-nro 3"))
    assert(result.get.contains("01.06.2020"))
    assert(result.get.contains("myönteinen"))
  }

  @Test
  def haeSeutArviointiTehtyProducesString(): Unit = {
    val paatos = Paatos(
      seutArviointi = true
    )
    val result = haeSeutArviointiTehty(translationService, paatos)

    assert(result.get.contains("SEUT-arviointi tehty"))
  }

  @Test
  def haeRatkaisutyyppiProducesString(): Unit = {
    val paatos = Paatos(
      ratkaisutyyppi = Some(Ratkaisutyyppi.Paatos)
    )
    val result = haeRatkaisutyyppi(translationService, paatos)

    assert(result.get.contains("Ratkaisutyyppi: Päätös"))
  }

  @Test
  def haePaatosTyyppiProducesString(): Unit = {
    val paatosTiedot = PaatosTieto(
      paatosTyyppi = Some(PaatosTyyppi.Taso),
      tutkintoTaso = None
    )
    val result = haePaatosTyyppi(translationService, paatosTiedot)

    assert(result.get.contains("Päätöstyyppi: Taso"))
  }

  @Test
  def haeSovellettuLakiProducesString(): Unit = {
    val paatosTiedot = PaatosTieto(
      sovellettuLaki = Some(SovellettuLaki.uo),
      tutkintoTaso = None
    )
    val result = haeSovellettuLaki(translationService, paatosTiedot)

    assert(result.get.contains("Sovellettu laki: Päätös UO"))
  }

  @Test
  def haeTutkinnonNimiProducesString(): Unit = {
    val matchingUUID = UUID.randomUUID
    val paatosTiedot = PaatosTieto(
      tutkintoId = Some(matchingUUID),
      tutkintoTaso = None
    )
    val tutkinnot = Seq(
      Tutkinto(
        id = Some(UUID.randomUUID),
        hakemusId = UUID.randomUUID,
        jarjestys = "1",
        nimi = Some("Epätutkinto"),
        oppilaitos = Some("Valkeakosken Yliopisto")
      ),
      Tutkinto(
        id = Some(matchingUUID),
        hakemusId = UUID.randomUUID,
        jarjestys = "2",
        nimi = Some("Paras tutkinto"),
        oppilaitos = Some("Mansesterin Vapaakauppakoulu")
      ),
      Tutkinto(
        id = Some(UUID.randomUUID),
        hakemusId = UUID.randomUUID,
        jarjestys = "3",
        nimi = Some("Muuan tutkinto"),
        oppilaitos = Some("Uraoppilaitos, Pääministerilinja")
      )
    )

    val result = haeTutkinnonNimi(translationService, paatosTiedot, tutkinnot)

    assert(result.get.contains("Tutkinnon nimi, jota päätös koskee"))
    assert(result.get.contains("Paras tutkinto"))
  }

  @Test
  def haeMyonteinenTaiKielteinenProducesString(): Unit = {
    val paatosTiedot = PaatosTieto(
      myonteinenPaatos = Some(true),
      tutkintoTaso = None
    )
    val result = haeMyonteinenTaiKielteinen(translationService, paatosTiedot)

    assert(result.get.contains("Päätös on myönteinen: Kyllä"))
  }

  @Test
  def haeTutkinnonTasoProducesString(): Unit = {
    val paatosTiedot = PaatosTieto(
      tutkintoTaso = Some(TutkintoTaso.YlempiKorkeakoulu)
    )
    val result = haeTutkinnonTaso(translationService, paatosTiedot)

    assert(result.get.contains("Tutkinnon taso:"))
    assert(result.get.contains("Ylempi korkeakoulututkinto"))
  }

  @Test
  def haeKielteisenPaatosTiedonPerustelutProducesString(): Unit = {
    val paatosTiedot = PaatosTieto(
      kielteisenPaatoksenPerustelut = Some(
        KielteisenPaatoksenPerustelut(
          epavirallinenKorkeakoulu = true,
          epavirallinenTutkinto = true,
          eiVastaaSuomessaSuoritettavaaTutkintoa = true,
          muuPerustelu = true,
          muuPerusteluKuvaus = Some("Tylsä tutkinto")
        )
      ),
      tutkintoTaso = None
    )
    val result = haeKielteisenPaatosTiedonPerustelut(translationService, paatosTiedot.kielteisenPaatoksenPerustelut)

    assert(result.get.contains("Kielteisen päätöksen perustelut:"))
    assert(result.get.contains("- Epävirallinen korkeakoulu"))
    assert(result.get.contains("- Epävirallinen tutkinto"))
    assert(result.get.contains("- Ei tasoltaan vastaa Suomessa suoritettavaa korkeakoulututkintoa"))
    assert(result.get.contains("- Muu perustelu:"))
    assert(result.get.contains("Tylsä tutkinto"))
  }

  @Test
  def haeRinnastettavatTutkinnotTaiOpinnotProducesString(): Unit = {
    val paatosTiedot = PaatosTieto(
      rinnastettavatTutkinnotTaiOpinnot = Seq(
        TutkintoTaiOpinto(
          tutkintoTaiOpinto = Some("AAA_BBB_Paras tutkinto")
        )
      ),
      tutkintoTaso = None
    )
    val result = haeRinnastettavatTutkinnotTaiOpinnot(translationService, paatosTiedot)

    assert(result.get.contains("Rinnastettavat tutkinnot tai opinnot:"))
    assert(result.get.contains("Paras tutkinto"))
  }

  @Test
  def haeKelpoisuudetProducesString(): Unit = {
    val paatosTiedot = PaatosTieto(
      kelpoisuudet = Seq(
        Kelpoisuus(
          kelpoisuus = Some("AAA_BBB_Paras kelpoisuus")
        )
      ),
      tutkintoTaso = None
    )
    val result = haeKelpoisuudet(translationService, paatosTiedot)

    assert(result.get.contains("Kelpoisuudet:"))
    assert(result.get.contains("Paras kelpoisuus"))
  }

  @Test
  def haePeruutusTaiRaukeaminenProducesString(): Unit = {
    val paatos = Paatos(
      peruutuksenTaiRaukeamisenSyy = Some(
        PeruutuksenTaiRaukeamisenSyy(
          eiSaaHakemaansaEikaHaluaPaatostaJonkaVoisiSaada = Some(true),
          muutenTyytymatonRatkaisuun = Some(true),
          eiApMukainenTutkintoTaiHaettuaPatevyytta = Some(true),
          eiTasoltaanVastaaSuomessaSuoritettavaaTutkintoa = Some(true),
          epavirallinenKorkeakouluTaiTutkinto = Some(true),
          eiEdellytyksiaRoEikaTasopaatokselle = Some(true),
          eiEdellytyksiaRinnastaaTiettyihinKkOpintoihin = Some(true),
          hakijallaJoPaatosSamastaKoulutusKokonaisuudesta = Some(true),
          muuSyy = Some(true)
        )
      )
    )
    val result = haePeruutusTaiRaukeaminen(translationService, paatos)

    assert(result.get.contains("Peruutuksen tai raukeamisen syyt:"))
    assert(result.get.contains("- Ei voi saada hakemaansa päätöstä, eikä halua päätöstä jonka voisi saada"))
    assert(result.get.contains("- On muuten tyytymätön ratkaisuun"))
    assert(result.get.contains("- Ei AP-lain mukainen tutkinto tai haettua ammattipätevyyttä"))
    assert(result.get.contains("- Ei tasoltaan vastaa Suomessa suoritettavaa korkeakoulututkintoa"))
    assert(result.get.contains("- Epävirallinen korkeakoulu tai tutkinto"))
    assert(result.get.contains("- Ei edellytyksiä RO- eikä tasopäätökselle"))
    assert(result.get.contains("- Ei edellytyksiä rinnastaa tiettyihin korkeakouluopintoihin"))
    assert(result.get.contains("- Hakijalla on jo päätös samasta koulutuskokonaisuudesta"))
    assert(result.get.contains("- Muu syy, esim. aikataulu"))
  }

  @Test
  def haeTutkinnonTaiOpinnonLisavaatimuksetProducesString(): Unit = {
    val lisavaatimuksetMaybe: Option[MyonteisenPaatoksenLisavaatimukset] =
      Some(
        MyonteisenPaatoksenLisavaatimukset(
          taydentavatOpinnot = true,
          kelpoisuuskoe = true,
          sopeutumisaika = true
        )
      )

    val result = haeTutkinnonTaiOpinnonLisavaatimukset(translationService, lisavaatimuksetMaybe)

    assert(result.get.contains("Lisävaatimukset:"))
    assert(result.get.contains("- Täydentävät opinnot"))
    assert(result.get.contains("- Kelpoisuuskoe"))
    assert(result.get.contains("- Sopeutumisaika"))
  }

  @Test
  def haeKelpoisuudenLisavaatimuksetProducesString(): Unit = {
    val lisavaatimuksetMaybe: Option[KelpoisuudenLisavaatimukset] =
      Some(
        KelpoisuudenLisavaatimukset(
          olennaisiaEroja = Some(true),
          erotKoulutuksessa = Some(
            ErotKoulutuksessa(
              erot = Seq(
                NamedBoolean(name = "Koulutuksen laatu", value = true)
              ),
              muuEro = Some(true),
              muuEroKuvaus = Some("Ihan eri")
            )
          ),
          korvaavaToimenpide = Some(
            KorvaavaToimenpide(
              kelpoisuuskoe = true,
              kelpoisuuskoeSisalto = Some(
                KelpoisuuskoeSisalto(
                  aihealue1 = true,
                  aihealue2 = true,
                  aihealue3 = true
                )
              ),
              sopeutumisaika = true,
              sopeutumiusaikaKestoKk = Some("6"),
              kelpoisuuskoeJaSopeutumisaika = true,
              kelpoisuuskoeJaSopeutumisaikaSisalto = Some(
                KelpoisuuskoeSisalto(
                  aihealue1 = true,
                  aihealue2 = true,
                  aihealue3 = true
                )
              ),
              kelpoisuuskoeJaSopeutumisaikaKestoKk = Some("6")
            )
          ),
          ammattikokemusJaElinikainenOppiminen = Some(
            AmmattikomemusJaElinikainenOppiminen(
              ammattikokemus = Some(true),
              elinikainenOppiminen = Some(true),
              lisatieto = Some("Kohtalainen kokemus"),
              korvaavuus = Some(AmmattikokemusElinikainenOppiminenKorvaavuus.Osittainen),
              korvaavaToimenpide = Some(
                KorvaavaToimenpide(
                  kelpoisuuskoe = true,
                  kelpoisuuskoeSisalto = Some(
                    KelpoisuuskoeSisalto(
                      aihealue1 = true,
                      aihealue2 = true,
                      aihealue3 = true
                    )
                  ),
                  sopeutumisaika = true,
                  sopeutumiusaikaKestoKk = Some("6"),
                  kelpoisuuskoeJaSopeutumisaika = true,
                  kelpoisuuskoeJaSopeutumisaikaSisalto = Some(
                    KelpoisuuskoeSisalto(
                      aihealue1 = true,
                      aihealue2 = true,
                      aihealue3 = true
                    )
                  ),
                  kelpoisuuskoeJaSopeutumisaikaKestoKk = Some("6")
                )
              )
            )
          )
        )
      )

    val result = haeKelpoisuudenLisavaatimukset(translationService, lisavaatimuksetMaybe)

    assert(result.get.contains("Lisävaatimukset:"))
    assert(result.get.contains("Erot koulutuksessa"))
    assert(result.get.contains("- Koulutuksen laatu: Kyllä"))
    assert(result.get.contains("- Muu ero: Ihan eri"))
    assert(result.get.contains("- Kelpoisuuskoe:"))
    assert(result.get.contains("- Aihealue 1"))
    assert(result.get.contains("- Aihealue 2"))
    assert(result.get.contains("- Aihealue 3"))
    assert(result.get.contains("- Ammattikokemus"))
    assert(result.get.contains("- Elinikäinen oppiminen"))
    assert(result.get.contains("- Lisätieto:"))
    assert(result.get.contains("Kohtalainen kokemus"))
    assert(result.get.contains("- Korvaako ammattikokemus tai elinikäinen oppiminen olennaisen eron?: Osittain"))
  }

  @Test
  def haeEsittelijaProducesString(): Unit = {
    when(onrService.haeNimiOption(any[Option[String]])).thenReturn(Some("Erkki Esittelijä"))

    val hakemusMaybe = someHakemus.map(_.copy(esittelijaOid = Some("1.2.3.4")))
    val result       = haeEsittelija(translationService, hakemusMaybe, onrService)

    assert(result.get.contains("Esittelijä: Erkki Esittelijä"))
  }

  @Test
  def haeKasittelyajatProducesString(): Unit = {

    val asiakirja = someHakemus.flatMap(_.asiakirja)

    val hakemusMaybe = someHakemus.map(
      _.copy(
        saapumisPvm = Some(LocalDateTime.of(2020, 5, 5, 0, 0)),
        esittelyPvm = Some(LocalDateTime.of(2020, 5, 25, 0, 0)),
        paatosPvm = Some(LocalDateTime.of(2020, 5, 25, 0, 0)),
        asiakirja = asiakirja.map(
          _.copy(
            viimeinenAsiakirjaHakijalta = Some(LocalDateTime.of(2020, 5, 5, 0, 0))
          )
        )
      )
    )

    val result = haeKasittelyajat(translationService, hakemusMaybe)

    assert(result.get.contains("Aika kirjauspäivämäärästä esittelypäivämäärään 0.7 kk"))
    assert(result.get.contains("Aika hakijan viimeisestä asiakirjasta ratkaisupäivämäärään 0.7 kk"))
  }
}
