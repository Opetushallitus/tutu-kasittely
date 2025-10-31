package fi.oph.tutu.backend.domain

import com.fasterxml.jackson.annotation.JsonIgnore
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
  viimeinenAsiakirjaHakijalta: Option[LocalDateTime]
) {

  def mergeWithUpdatedAsiakirja(
    updatedAsiakirja: PartialAsiakirja
  ): DbAsiakirja =
    DbAsiakirja(
      id = this.id,
      allekirjoituksetTarkistettu = updatedAsiakirja.allekirjoituksetTarkistettu.getOrElse(
        this.allekirjoituksetTarkistettu
      ),
      allekirjoituksetTarkistettuLisatiedot =
        updatedAsiakirja.allekirjoituksetTarkistettuLisatiedot.orElse(this.allekirjoituksetTarkistettuLisatiedot),
      imiPyynto =
        if (updatedAsiakirja.imiPyyntoDefined()) updatedAsiakirja.imiPyynto.flatMap(_.imiPyynto) else this.imiPyynto,
      imiPyyntoNumero =
        if (updatedAsiakirja.imiPyyntoDefined()) updatedAsiakirja.imiPyynto.flatMap(_.getNumeroIfPyyntoTrue)
        else this.imiPyyntoNumero,
      imiPyyntoLahetetty =
        if (updatedAsiakirja.imiPyyntoDefined()) updatedAsiakirja.imiPyynto.flatMap(_.getLahetettyIfPyyntoTrue)
        else this.imiPyyntoLahetetty,
      imiPyyntoVastattu =
        if (updatedAsiakirja.imiPyyntoDefined()) updatedAsiakirja.imiPyynto.flatMap(_.getVastattuIfPyyntoTrue)
        else this.imiPyyntoVastattu,
      alkuperaisetAsiakirjatSaatuNahtavaksi =
        updatedAsiakirja.alkuperaisetAsiakirjatSaatuNahtavaksi.getOrElse(this.alkuperaisetAsiakirjatSaatuNahtavaksi),
      alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot = updatedAsiakirja.alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot
        .orElse(this.alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot),
      selvityksetSaatu = updatedAsiakirja.selvityksetSaatu.getOrElse(this.selvityksetSaatu),
      apHakemus = updatedAsiakirja.apHakemus.orElse(this.apHakemus),
      suostumusVahvistamiselleSaatu =
        updatedAsiakirja.suostumusVahvistamiselleSaatu.getOrElse(this.suostumusVahvistamiselleSaatu),
      valmistumisenVahvistus =
        if (updatedAsiakirja.valmistumisenVahvistusDefined())
          updatedAsiakirja.valmistumisenVahvistus.get.valmistumisenVahvistus
        else this.valmistumisenVahvistus,
      valmistumisenVahvistusPyyntoLahetetty =
        if (updatedAsiakirja.valmistumisenVahvistusDefined())
          updatedAsiakirja.valmistumisenVahvistus.flatMap(_.getPyyntoLahetettyIfVahvistusTrue)
        else this.valmistumisenVahvistusPyyntoLahetetty,
      valmistumisenVahvistusSaatu =
        if (updatedAsiakirja.valmistumisenVahvistusDefined())
          updatedAsiakirja.valmistumisenVahvistus
            .flatMap(_.getSaatuIfVahvistusTrue)
        else this.valmistumisenVahvistusSaatu,
      valmistumisenVahvistusVastaus =
        if (updatedAsiakirja.valmistumisenVahvistusDefined())
          updatedAsiakirja.valmistumisenVahvistus
            .flatMap(_.getVastausIfVahvistusTrue)
        else this.valmistumisenVahvistusVastaus,
      valmistumisenVahvistusLisatieto =
        if (updatedAsiakirja.valmistumisenVahvistusDefined())
          updatedAsiakirja.valmistumisenVahvistus
            .flatMap(_.getLisatietoIfVahvistusTrue)
        else this.valmistumisenVahvistusLisatieto,
      viimeinenAsiakirjaHakijalta =
        updatedAsiakirja.viimeinenAsiakirjaHakijalta.orElse(this.viimeinenAsiakirjaHakijalta)
    )
}

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
  viimeinenAsiakirjaHakijalta: Option[LocalDateTime] = None
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
    viimeinenAsiakirjaHakijalta = dbAsiakirja.viimeinenAsiakirjaHakijalta
  )

  def this(
    partialAsiakirja: PartialAsiakirja
  ) = this(
    allekirjoituksetTarkistettu = partialAsiakirja.allekirjoituksetTarkistettu.getOrElse(false),
    allekirjoituksetTarkistettuLisatiedot = partialAsiakirja.allekirjoituksetTarkistettuLisatiedot,
    imiPyynto = new ImiPyynto(partialAsiakirja.imiPyynto),
    alkuperaisetAsiakirjatSaatuNahtavaksi = partialAsiakirja.alkuperaisetAsiakirjatSaatuNahtavaksi.getOrElse(false),
    alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot = partialAsiakirja.alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot,
    selvityksetSaatu = partialAsiakirja.selvityksetSaatu.getOrElse(false),
    apHakemus = partialAsiakirja.apHakemus,
    suostumusVahvistamiselleSaatu = partialAsiakirja.suostumusVahvistamiselleSaatu.getOrElse(false),
    valmistumisenVahvistus = new ValmistumisenVahvistus(partialAsiakirja.valmistumisenVahvistus),
    pyydettavatAsiakirjat = partialAsiakirja.pyydettavatAsiakirjat.getOrElse(Seq.empty),
    asiakirjamallitTutkinnoista = partialAsiakirja.asiakirjamallitTutkinnoista.getOrElse(Map.empty),
    viimeinenAsiakirjaHakijalta = partialAsiakirja.viimeinenAsiakirjaHakijalta
  )
}

case class PartialAsiakirja(
  allekirjoituksetTarkistettu: Option[Boolean] = None,
  allekirjoituksetTarkistettuLisatiedot: Option[String] = None,
  imiPyynto: Option[ImiPyynto] = None,
  alkuperaisetAsiakirjatSaatuNahtavaksi: Option[Boolean] = None,
  alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot: Option[String] = None,
  selvityksetSaatu: Option[Boolean] = None,
  apHakemus: Option[Boolean] = None,
  suostumusVahvistamiselleSaatu: Option[Boolean] = None,
  pyydettavatAsiakirjat: Option[Seq[PyydettavaAsiakirja]] = None,
  asiakirjamallitTutkinnoista: Option[Map[AsiakirjamalliLahde, AsiakirjamalliTutkinnosta]] = None,
  valmistumisenVahvistus: Option[ValmistumisenVahvistus] = None,
  viimeinenAsiakirjaHakijalta: Option[LocalDateTime] = None
) {
  def imiPyyntoDefined(): Boolean              = imiPyynto.isDefined
  def valmistumisenVahvistusDefined(): Boolean = valmistumisenVahvistus.isDefined
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
        viimeinenAsiakirjaHakijalta = viimeinenAsiakirjaHakijalta
      )
    }
  }
}
