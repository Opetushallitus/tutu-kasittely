package fi.oph.tutu.backend.service.generator.paatosteksti

import fi.oph.tutu.backend.domain.PaatosTyyppi.Taso
import fi.oph.tutu.backend.domain.{Hakemus, Paatos}

val tasopaatosFi = s"""
<b>Tutkinnon rinnastaminen</b>

Hakijan suorittama korkeakoulututkinto rinnastetaan Suomessa suoritettavaan

alempaan/ylempään

korkeakoulututkintoon.

  Perustelu:

  Opetushallitus on arvioinut hakijan tutkinnon vastaavan tasoltaan Suomessa suoritettavaa

alempaa/ylempää

korkeakoulututkintoa.

  Arvio perustuu siihen, että tutkintoon johtanut korkeakouluopintojen kokonaisuus vastaa laajuudeltaan, vaativuudeltaan ja suuntautumiseltaan

alempaan/ylempään

korkeakoulututkintoon johtavaa korkeakouluopintojen kokonaisuutta.

Sovelletut oikeusohjeet: Laki ulkomailla suoritettujen korkeakouluopintojen tuottamasta virkakelpoisuudesta (1385/2015), 2, 3 ja 6 §

Valitusoikeus

Tähän päätökseen saa hakea muutosta valittamalla

X:n hallinto-oikeudelle [HO määrittyisi automaattisesti hakijan kotikunnan mukaan].

Liitteenä olevasta valitusosoituksesta ilmenee valituksen määräaika ja se, miten muutosta haettaessa on meneteltävä.

  Maksun oikaisu

Päätöksestä perityt maksut perustuvat opetus- ja kulttuuriministeriön asetukseen Opetushallituksen ja sen erillisyksiköiden suoritteiden maksullisuudesta (1188/2023, 1 ja 2 §). Maksuihin voi vaatia oikaisua Opetushallitukselta. Liitteenä olevasta oikaisuvaatimusosoituksesta ilmenee oikaisuvaatimuksen määräaika ja se, miten oikaisua vaadittaessa on meneteltävä."""

val tasopaatosSv = s"""<b>Jämställande av examen</b>

Den högskoleexamen som sökanden har avlagt jämställs med

lägre/högre

högskoleexamen som avläggs i Finland.

  Motivering:

  Utbildningsstyrelsen har bedömt att sökandens examen till sin nivå motsvarar en

lägre/högre

högskoleexamen som avläggs i Finland. Bedömningen grundar sig på att den helhet av högskolestudier som har lett till examen med hänsyn till dess omfång, svårighetsgrad och inriktning motsvarar den helhet av högskolestudier som leder till

lägre/högre

högskoleexamen.

  Tillämpade rättsnormer: Lagen om den tjänstebehörighet som högskolestudier utomlands medför (1385/2015), 2, 3 och 6 §

Besvärsrätt

Ändring i detta beslut får sökas genom besvär hos

X förvaltningsdomstol.

Besvärstiden och förfarandet framgår av bifogade besvärsanvisning.

  Omprövning som berör avgifterna

Avgifterna för beslutet baserar sig på undervisnings- och kulturministeriets förordning om Utbildningsstyrelsens och dess fristående enheters avgiftsbelagda prestationer (1188/2023, 1 och 2 §). Omprövning som berör avgifterna kan begäras av Utbildningsstyrelsen. Av bifogade anvisning för begäran om omprövning framgår tiden för begäran om omprövning och ansökningsförfarandet."""

def generate(
  hakemus: Option[Hakemus],
  paatos: Option[Paatos],
  paatosKieli: String
): String = {
  val isTasopaatos = paatos.get.paatosTiedot.exists(paatosTieto => paatosTieto.paatosTyyppi.get == Taso)

  isTasopaatos match {
    case false => "Tällä hetkellä esikatselu on saatavilla vain tasopäätökselle."
    case true  => if (paatosKieli == "fi") tasopaatosFi else tasopaatosSv
  }
}
