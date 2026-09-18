package fi.oph.tutu.backend.utils

import fi.oph.tutu.backend.domain.*
import org.json4s.*

import java.time.{LocalDate, LocalDateTime}

trait TutuJsonFormats {
  implicit val formats: Formats = {
    DefaultFormats + KoodistoItemSerializer
      + KieliKeySerializer
      + KasittelyVaiheSerializer
      + AmmattikokemusElinikainenOppiminenKorvaavuusSerializer
      + AmmattikokemuksenHuomioiminenSerializer
      + SuomessaSuoritettujenOpintojenHuomioiminenSerializer
      + ValitusKHORatkaisuSerializer
      + LocalDateTimeSerializer
      + HaORatkaisuSerializer
  }
}

object LocalDateTimeSerializer
    extends CustomSerializer[LocalDateTime](_ =>
      (
        {
          case JString(value) => LocalDateTime.parse(value)
          case unexpected     =>
            throw new MappingException(s"Cannot deserialize LocalDateTime from $unexpected")
        },
        { case dateTime: LocalDateTime =>
          JString(dateTime.toString)
        }
      )
    )

object KoodistoItemSerializer
    extends CustomSerializer[KoodistoItem](_ =>
      (
        {
          case JObject(fields) =>
            val koodiUri     = fields.collectFirst { case ("koodiUri", JString(koodiUri)) => koodiUri }.getOrElse("")
            val koodiArvo    = fields.collectFirst { case ("koodiArvo", JString(koodiArvo)) => koodiArvo }.getOrElse("")
            val nimiMetadata = fields.collectFirst { case ("metadata", JArray(metadata)) => metadata }.getOrElse(List())
            val kielistetty  = nimiMetadata.map {
              case JObject(mDataItem) =>
                val kieli = mDataItem.collectFirst { case ("kieli", JString(kieli)) => kieli }.getOrElse("")
                val nimi  = mDataItem.collectFirst { case ("nimi", JString(nimi)) => nimi }.getOrElse("")
                Kieli.valueOf(kieli.toLowerCase()) -> nimi
              case _ =>
                throw new MappingException("Invalid koodisto metadata item")
            }.toMap

            val voimassaAlkuPvm = fields.collectFirst { case ("voimassaAlkuPvm", JString(date)) =>
              LocalDate.parse(date)
            }

            val voimassaLoppuPvm = fields.collectFirst { case ("voimassaLoppuPvm", JString(date)) =>
              LocalDate.parse(date)
            }

            val tila = fields.collectFirst { case ("tila", JString(status)) => status }

            KoodistoItem(koodiUri, koodiArvo, kielistetty, voimassaAlkuPvm, voimassaLoppuPvm, tila)
          case unexpected =>
            throw new MappingException(s"Cannot deserialize KooodistoItem from $unexpected")
        },
        { case k: KoodistoItem =>
          val nimiObj = JObject(
            k.nimi.toSeq.map { case (kieli, teksti) => (kieli.toString.toLowerCase, JString(teksti)) }.toList
          )
          val koodiUri  = JString(k.koodiUri)
          val koodiArvo = JString(k.koodiArvo)
          JObject("koodiUri" -> koodiUri, "koodiArvo" -> koodiArvo, "nimi" -> nimiObj)
        }
      )
    )

object KieliKeySerializer
    extends CustomKeySerializer[Kieli](_ =>
      (
        { case key => Kieli.fromString(key) },
        { case key => key.toString }
      )
    )

object KasittelyVaiheSerializer
    extends CustomSerializer[KasittelyVaihe](_ =>
      (
        {
          case JString(value) => KasittelyVaihe.fromString(value)
          case unexpected     =>
            throw new MappingException(s"Cannot deserialize KasittelyVaihe from $unexpected")
        },
        { case vaihe: KasittelyVaihe =>
          JString(vaihe.toString)
        }
      )
    )

object AmmattikokemusElinikainenOppiminenKorvaavuusSerializer
    extends CustomSerializer[AmmattikokemusElinikainenOppiminenKorvaavuus](_ =>
      (
        {
          case JString(value) => AmmattikokemusElinikainenOppiminenKorvaavuus.fromString(value)
          case unexpected     =>
            throw new MappingException(
              s"Cannot deserialize AmmattikokemusElinikainenOppiminenKorvaavuus from $unexpected"
            )
        },
        { case korvaavuus: AmmattikokemusElinikainenOppiminenKorvaavuus =>
          JString(korvaavuus.toString)
        }
      )
    )

object AmmattikokemuksenHuomioiminenSerializer
    extends CustomSerializer[AmmattikokemuksenHuomioiminen](_ =>
      (
        {
          case JString(value) => AmmattikokemuksenHuomioiminen.fromString(value)
          case unexpected     =>
            throw new MappingException(
              s"Cannot deserialize AmmattikokemuksenHuomioiminen from $unexpected"
            )
        },
        { case korvaavuus: AmmattikokemuksenHuomioiminen =>
          JString(korvaavuus.toString)
        }
      )
    )

object SuomessaSuoritettujenOpintojenHuomioiminenSerializer
    extends CustomSerializer[SuomessaSuoritettujenOpintojenHuomioiminen](_ =>
      (
        {
          case JString(value) => SuomessaSuoritettujenOpintojenHuomioiminen.fromString(value)
          case unexpected     =>
            throw new MappingException(
              s"Cannot deserialize SuomessaSuoritettujenOpintojenHuomioiminen from $unexpected"
            )
        },
        { case korvaavuus: SuomessaSuoritettujenOpintojenHuomioiminen =>
          JString(korvaavuus.toString)
        }
      )
    )

object ValitusKHORatkaisuSerializer
    extends CustomSerializer[ValitusKHORatkaisu](_ =>
      (
        {
          case JString(value) => ValitusKHORatkaisu.fromString(value)
          case unexpected     =>
            throw new MappingException(s"Cannot deserialize ValitusKHORatkaisu from $unexpected")
        },
        { case ratkaisu: ValitusKHORatkaisu =>
          JString(ratkaisu.toString)
        }
      )
    )

object HaORatkaisuSerializer
    extends CustomSerializer[ValitusHaORatkaisu](_ =>
      (
        {
          case JString(value) => ValitusHaORatkaisu.fromString(value)
          case unexpected     =>
            throw new MappingException(
              s"Cannot deserialize HaORatkaisu from $unexpected"
            )
        },
        { case ratkaisu: ValitusHaORatkaisu =>
          JString(ratkaisu.toString)
        }
      )
    )
