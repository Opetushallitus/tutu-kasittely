package fi.oph.tutu.backend.domain

import com.fasterxml.jackson.core.{JsonParser, JsonToken}
import com.fasterxml.jackson.databind.{DeserializationContext, JsonDeserializer, JsonNode}
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode

import java.time.LocalDateTime
import java.util.UUID
import scala.annotation.meta.field
import scala.jdk.CollectionConverters.*

case class DbAsiakirja(
  @(Schema @field)(
    example = "de4ffbea-1763-4a43-a24d-50ee48b81ff1",
    requiredMode = RequiredMode.REQUIRED,
    maxLength = 36
  )
  id: UUID,
  @(Schema @field)(
    example = "true",
    defaultValue = "false",
    requiredMode = RequiredMode.REQUIRED
  )
  allekirjoituksetTarkistettu: Boolean,
  @(Schema @field)(
    example = "Allekirjoitukset tarkistettu kopioista",
    requiredMode = RequiredMode.NOT_REQUIRED
  )
  allekirjoituksetTarkistettuLisatiedot: Option[String],
  @(Schema @field)(
    example = "false",
    requiredMode = RequiredMode.NOT_REQUIRED
  )
  imiPyynto: Option[Boolean],
  @(Schema @field)(
    example = "122224",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 255
  )
  imiPyyntoNumero: Option[String],
  @(Schema @field)(
    example = "2025-06-14T10:59:47.597",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 50
  )
  imiPyyntoLahetetty: Option[LocalDateTime],
  @(Schema @field)(
    example = "2025-06-14T10:59:47.597",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 50
  )
  imiPyyntoVastattu: Option[LocalDateTime],
  @(Schema @field)(
    example = "true",
    defaultValue = "false",
    requiredMode = RequiredMode.REQUIRED
  )
  alkuperaisetAsiakirjatSaatuNahtavaksi: Boolean,
  @(Schema @field)(
    example = "Yksipuoliset kopiot. Alkuperäiset kaksipuolisia.",
    requiredMode = RequiredMode.NOT_REQUIRED
  )
  alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot: Option[String],
  @(Schema @field)(
    example = "true",
    requiredMode = RequiredMode.REQUIRED
  )
  selvityksetSaatu: Boolean,
  @(Schema @field)(
    example = "true",
    requiredMode = RequiredMode.NOT_REQUIRED
  )
  apHakemus: Option[Boolean],
  @(Schema @field)(
    example = "true",
    requiredMode = RequiredMode.NOT_REQUIRED
  )
  suostumusVahvistamiselleSaatu: Boolean,
  @(Schema @field)(
    example = "true",
    requiredMode = RequiredMode.NOT_REQUIRED
  )
  valmistumisenVahvistus: Boolean,
  @(Schema @field)(
    example = "2025-06-14T10:59:47.597",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 50
  )
  valmistumisenVahvistusPyyntoLahetetty: Option[LocalDateTime],
  @(Schema @field)(
    example = "2025-06-14T10:59:47.597",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 50
  )
  valmistumisenVahvistusSaatu: Option[LocalDateTime],
  @(Schema @field)(
    example = "myonteinen",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 50
  )
  valmistumisenVahvistusVastaus: Option[ValmistumisenVahvistusVastaus],
  @(Schema @field)(
    requiredMode = RequiredMode.NOT_REQUIRED
  )
  valmistumisenVahvistusLisatieto: Option[String],
  @(Schema @field)(
    example = "2025-06-14T10:59:47.597",
    requiredMode = RequiredMode.NOT_REQUIRED,
    maxLength = 50
  )
  viimeinenAsiakirjaHakijalta: Option[LocalDateTime],
  @(Schema @field)(
    example = "Huomiot muistioon",
    requiredMode = RequiredMode.NOT_REQUIRED
  )
  huomiotMuistioon: Option[String],
  @(Schema @field)(
    example = "Esittelijän huomioita",
    requiredMode = RequiredMode.NOT_REQUIRED
  )
  esittelijanHuomioita: Option[String]
)

case class Asiakirja(
  allekirjoituksetTarkistettu: Boolean = false,
  allekirjoituksetTarkistettuLisatiedot: Option[String] = None,
  imiPyynto: ImiPyynto = ImiPyynto(
    imiPyynto = None,
    imiPyyntoNumero = None,
    imiPyyntoLahetetty = None,
    imiPyyntoVastattu = None
  ),
  alkuperaisetAsiakirjatSaatuNahtavaksi: Boolean = false,
  alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot: Option[String] = None,
  selvityksetSaatu: Boolean = false,
  apHakemus: Option[Boolean] = None,
  suostumusVahvistamiselleSaatu: Boolean = false,
  valmistumisenVahvistus: ValmistumisenVahvistus = ValmistumisenVahvistus(
    valmistumisenVahvistus = false,
    valmistumisenVahvistusPyyntoLahetetty = None,
    valmistumisenVahvistusSaatu = None,
    valmistumisenVahvistusVastaus = None,
    valmistumisenVahvistusLisatieto = None
  ),
  pyydettavatAsiakirjat: Seq[PyydettavaAsiakirja] = Seq.empty,
  asiakirjamallitTutkinnoista: Map[AsiakirjamalliLahde, AsiakirjamalliTutkinnosta] = Map.empty,
  viimeinenAsiakirjaHakijalta: Option[LocalDateTime] = None,
  huomiotMuistioon: Option[String] = None,
  esittelijanHuomioita: Option[String] = None
) {
  def this(
    dbAsiakirja: DbAsiakirja,
    pyydettavatAsiakirjat: Seq[PyydettavaAsiakirja],
    asiakirjamallitTutkinnoista: Map[AsiakirjamalliLahde, AsiakirjamalliTutkinnosta]
  ) = this(
    allekirjoituksetTarkistettu = dbAsiakirja.allekirjoituksetTarkistettu,
    allekirjoituksetTarkistettuLisatiedot = dbAsiakirja.allekirjoituksetTarkistettuLisatiedot,
    imiPyynto = ImiPyynto(
      imiPyynto = dbAsiakirja.imiPyynto,
      imiPyyntoNumero = dbAsiakirja.imiPyyntoNumero,
      imiPyyntoLahetetty = dbAsiakirja.imiPyyntoLahetetty,
      imiPyyntoVastattu = dbAsiakirja.imiPyyntoVastattu
    ),
    alkuperaisetAsiakirjatSaatuNahtavaksi = dbAsiakirja.alkuperaisetAsiakirjatSaatuNahtavaksi,
    alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot = dbAsiakirja.alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot,
    selvityksetSaatu = dbAsiakirja.selvityksetSaatu,
    apHakemus = dbAsiakirja.apHakemus,
    suostumusVahvistamiselleSaatu = dbAsiakirja.suostumusVahvistamiselleSaatu,
    valmistumisenVahvistus = ValmistumisenVahvistus(
      valmistumisenVahvistus = dbAsiakirja.valmistumisenVahvistus,
      valmistumisenVahvistusPyyntoLahetetty = dbAsiakirja.valmistumisenVahvistusPyyntoLahetetty,
      valmistumisenVahvistusSaatu = dbAsiakirja.valmistumisenVahvistusSaatu,
      valmistumisenVahvistusVastaus = dbAsiakirja.valmistumisenVahvistusVastaus,
      valmistumisenVahvistusLisatieto = dbAsiakirja.valmistumisenVahvistusLisatieto
    ),
    pyydettavatAsiakirjat = pyydettavatAsiakirjat,
    asiakirjamallitTutkinnoista = asiakirjamallitTutkinnoista,
    viimeinenAsiakirjaHakijalta = dbAsiakirja.viimeinenAsiakirjaHakijalta,
    huomiotMuistioon = dbAsiakirja.huomiotMuistioon,
    esittelijanHuomioita = dbAsiakirja.esittelijanHuomioita
  )
}

class AsiakirjaDeserializer extends JsonDeserializer[Asiakirja] {
  override def deserialize(p: JsonParser, ctxt: DeserializationContext): Asiakirja = {
    if (p.getCurrentToken == JsonToken.VALUE_NULL) {
      // Return default Asiakirja with empty values
      Asiakirja()
    } else {
      val node = p.getCodec.readTree[JsonNode](p)

      // Parse simple boolean fields
      val allekirjoituksetTarkistettu = Option(node.get("allekirjoituksetTarkistettu"))
        .exists(n => !n.isNull && n.asBoolean())

      val alkuperaisetAsiakirjatSaatuNahtavaksi = Option(node.get("alkuperaisetAsiakirjatSaatuNahtavaksi"))
        .exists(n => !n.isNull && n.asBoolean())

      val selvityksetSaatu = Option(node.get("selvityksetSaatu"))
        .exists(n => !n.isNull && n.asBoolean())

      val suostumusVahvistamiselleSaatu = Option(node.get("suostumusVahvistamiselleSaatu"))
        .exists(n => !n.isNull && n.asBoolean())

      // Parse Option[String] fields
      val allekirjoituksetTarkistettuLisatiedot = Option(node.get("allekirjoituksetTarkistettuLisatiedot"))
        .filterNot(_.isNull)
        .map(_.asText)

      val alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot =
        Option(node.get("alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot"))
          .filterNot(_.isNull)
          .map(_.asText)

      val viimeinenAsiakirjaHakijalta = Option(node.get("viimeinenAsiakirjaHakijalta"))
        .filterNot(_.isNull)
        .map(date => LocalDateTime.parse(date.asText))

      val huomiotMuistioon = Option(node.get("huomiotMuistioon"))
        .filterNot(_.isNull)
        .map(_.asText)

      val esittelijanHuomioita = Option(node.get("esittelijanHuomioita"))
        .filterNot(_.isNull)
        .map(_.asText)

      // Parse Option[Boolean] field
      val apHakemus = Option(node.get("apHakemus")) match {
        case Some(jsonNode) if !jsonNode.isNull && jsonNode.isBoolean =>
          Some(jsonNode.asBoolean())
        case _ => None
      }

      // Parse nested complex objects using their custom deserializers
      val imiPyynto = Option(node.get("imiPyynto")) match {
        case Some(jsonNode) if !jsonNode.isNull =>
          val deserializer = new ImiPyyntoDeserializer()
          deserializer.deserialize(jsonNode.traverse(p.getCodec), ctxt)
        case _ =>
          ImiPyynto(imiPyynto = None, imiPyyntoNumero = None, imiPyyntoLahetetty = None, imiPyyntoVastattu = None)
      }

      val valmistumisenVahvistus = Option(node.get("valmistumisenVahvistus")) match {
        case Some(jsonNode) if !jsonNode.isNull =>
          val deserializer = new ValmistumisenVahvistusDeserializer()
          deserializer.deserialize(jsonNode.traverse(p.getCodec), ctxt)
        case _ =>
          ValmistumisenVahvistus(
            valmistumisenVahvistus = false,
            valmistumisenVahvistusPyyntoLahetetty = None,
            valmistumisenVahvistusSaatu = None,
            valmistumisenVahvistusVastaus = None,
            valmistumisenVahvistusLisatieto = None
          )
      }

      // Parse pyydettavatAsiakirjat sequence
      val pyydettavatAsiakirjat = Option(node.get("pyydettavatAsiakirjat")) match {
        case Some(arrayNode) if !arrayNode.isNull && arrayNode.isArray =>
          arrayNode
            .elements()
            .asScala
            .map { itemNode =>
              val id               = Option(itemNode.get("id")).filterNot(_.isNull).map(n => UUID.fromString(n.asText))
              val asiakirjanTyyppi = itemNode.get("asiakirjanTyyppi").asText()
              PyydettavaAsiakirja(id, asiakirjanTyyppi)
            }
            .toSeq
        case _ => Seq.empty
      }

      // Parse asiakirjamallitTutkinnoista map
      val asiakirjamallitTutkinnoista = Option(node.get("asiakirjamallitTutkinnoista")) match {
        case Some(objNode) if !objNode.isNull && objNode.isObject =>
          objNode
            .fields()
            .asScala
            .map { entry =>
              val lahde      = AsiakirjamalliLahde.valueOf(entry.getKey)
              val valueNode  = entry.getValue
              val vastaavuus = valueNode.get("vastaavuus").asBoolean()
              val kuvaus     = Option(valueNode.get("kuvaus")).filterNot(_.isNull).map(_.asText)
              lahde -> AsiakirjamalliTutkinnosta(lahde, vastaavuus, kuvaus)
            }
            .toMap
        case _ => Map.empty
      }

      Asiakirja(
        allekirjoituksetTarkistettu = allekirjoituksetTarkistettu,
        allekirjoituksetTarkistettuLisatiedot = allekirjoituksetTarkistettuLisatiedot,
        imiPyynto = imiPyynto,
        alkuperaisetAsiakirjatSaatuNahtavaksi = alkuperaisetAsiakirjatSaatuNahtavaksi,
        alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot = alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot,
        selvityksetSaatu = selvityksetSaatu,
        apHakemus = apHakemus,
        suostumusVahvistamiselleSaatu = suostumusVahvistamiselleSaatu,
        valmistumisenVahvistus = valmistumisenVahvistus,
        pyydettavatAsiakirjat = pyydettavatAsiakirjat,
        asiakirjamallitTutkinnoista = asiakirjamallitTutkinnoista,
        viimeinenAsiakirjaHakijalta = viimeinenAsiakirjaHakijalta,
        huomiotMuistioon = huomiotMuistioon,
        esittelijanHuomioita = esittelijanHuomioita
      )
    }
  }
}
