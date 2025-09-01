package fi.oph.tutu.backend.utils

import org.junit.jupiter.api.Assertions.{assertEquals, assertNotNull, assertTrue}
import org.junit.jupiter.api.Test
import com.google.gson.JsonObject
import org.junit.jupiter.api.DisplayName

class AuditUtilTest {

  @Test
  @DisplayName("Should detect added JSON fields")
  def testGetChangesAddedJson(): Unit = {
    val beforeJson = None
    val afterJson  = Some("""{"newValue":"new","nested":{"key":"value"}}""")
    val changes    = AuditUtil.getChanges(beforeJson, afterJson)

    val changesArray = changes.asJsonArray()

    // Should have two added changes (newValue and nested.key)
    assertEquals(2, changesArray.size())

    // Check that it's an added change
    val firstChange = changesArray.get(0).asInstanceOf[JsonObject]
    assertTrue(firstChange.has("fieldName"))
    assertTrue(firstChange.has("newValue"))

    // Verify the changes contain expected fields
    val fieldNames = (0 until changesArray.size())
      .map(i => changesArray.get(i).asInstanceOf[JsonObject].get("fieldName").getAsString)
      .toSet

    assertTrue(fieldNames.contains("newValue"))
    assertTrue(fieldNames.contains("nested.key"))
  }

  @Test
  @DisplayName("Should detect removed JSON fields")
  def testGetChangesRemovedJson(): Unit = {
    val beforeJson = Some("""{"value":"old","nested":{"key":"value","deep":{"level":3}}}""")
    val afterJson  = None
    val changes    = AuditUtil.getChanges(beforeJson, afterJson)

    val changesArray = changes.asJsonArray()

    // Should have three removed changes (value, nested.key, nested.deep.level)
    assertEquals(3, changesArray.size())

    // Check that it's a removed change
    val firstChange = changesArray.get(0).asInstanceOf[JsonObject]
    assertTrue(firstChange.has("fieldName"))
    assertTrue(firstChange.has("oldValue"))

    // Verify the changes contain expected fields
    val fieldNames = (0 until changesArray.size())
      .map(i => changesArray.get(i).asInstanceOf[JsonObject].get("fieldName").getAsString)
      .toSet

    assertTrue(fieldNames.contains("value"))
    assertTrue(fieldNames.contains("nested.key"))
    assertTrue(fieldNames.contains("nested.deep.level"))
  }

  @Test
  @DisplayName("Should detect updated JSON values")
  def testGetChangesUpdatedJson(): Unit = {
    val beforeJson = Some("""{"value":"old","nested":{"key":"oldValue","deep":{"level":3}}}""")
    val afterJson  = Some("""{"value":"new","nested":{"key":"newValue","deep":{"level":5}}}""")
    val changes    = AuditUtil.getChanges(beforeJson, afterJson)

    val changesArray = changes.asJsonArray()

    // Should have three updated changes
    assertEquals(3, changesArray.size())

    // Check that it's an updated change
    val firstChange = changesArray.get(0).asInstanceOf[JsonObject]
    assertTrue(firstChange.has("fieldName"))
    assertTrue(firstChange.has("oldValue"))
    assertTrue(firstChange.has("newValue"))

    // Verify the changes contain expected fields
    val fieldNames = (0 until changesArray.size())
      .map(i => changesArray.get(i).asInstanceOf[JsonObject].get("fieldName").getAsString)
      .toSet

    assertTrue(fieldNames.contains("value"))
    assertTrue(fieldNames.contains("nested.key"))
    assertTrue(fieldNames.contains("nested.deep.level"))
  }

  @Test
  @DisplayName("Should detect no changes in equal JSON")
  def testGetChangesNoChangeEqualJson(): Unit = {
    val beforeJson = Some("""{"value":"same","nested":{"key":"same","deep":{"level":3}}}""")
    val afterJson  = Some("""{"value":"same","nested":{"key":"same","deep":{"level":3}}}""")
    val changes    = AuditUtil.getChanges(beforeJson, afterJson)

    val changesArray = changes.asJsonArray()

    // Should have no changes
    assertEquals(0, changesArray.size())
  }

  @Test
  @DisplayName("Should handle None JSON inputs")
  def testGetChangesNoChangeNoneJson(): Unit = {
    val changes = AuditUtil.getChanges(None, None)

    val changesArray = changes.asJsonArray()

    // Should have no changes
    assertEquals(0, changesArray.size())
  }

  @Test
  @DisplayName("Should handle malformed JSON gracefully")
  def testGetChangesMalformedJson(): Unit = {
    val beforeJson = Some("""{"valid":"json"}""")
    val afterJson  = Some("""{invalid json""")

    val changes = AuditUtil.getChanges(beforeJson, afterJson)

    val changesArray = changes.asJsonArray()

    // Should handle malformed JSON gracefully
    assertNotNull(changes)
    assertNotNull(changesArray)
  }

  @Test
  @DisplayName("Should detect changes in realistic Hakemus object updates")
  def testGetChangesRealisticHakemus(): Unit = {
    val beforeJson = Some("""{
      "hakemusOid": "1.2.246.562.11.00000000000000006666",
      "lomakeOid": "form-123",
      "hakija": {
        "etunimet": "Testi Kolmas",
        "kutsumanimi": "Tatu",
        "sukunimi": "Hakija",
        "kansalaisuus": {"fi": "Suomi", "sv": "Finland", "en": "Finland"},
        "hetu": "180462-9981",
        "syntymaaika": "18.04.1962",
        "matkapuhelin": "+3584411222333",
        "asuinmaa": {"fi": "Suomi", "sv": "Finland", "en": "Finland"},
        "katuosoite": "Sillitie 1",
        "postinumero": "00800",
        "postitoimipaikka": "HELSINKI",
        "kotikunta": {"fi": "Kajaani", "sv": "Kajana", "en": "Kajaani"},
        "sahkopostiosoite": "patu.kuusinen@riibasu.fi"
      },
      "sisalto": [
        {
          "key": "first-name",
          "value": "tatu",
          "fieldType": "textField"
        },
        {
          "key": "last-name", 
          "value": "honka",
          "fieldType": "textField"
        }
      ],
      "liitteidenTilat": [
        {
          "attachment": "582be518-e3ea-4692-8a2c-8370b40213e9",
          "state": "not-checked",
          "hakukohde": "form"
        }
      ],
      "hakemusKoskee": 1,
      "asiatunnus": "OPH-197-2025",
      "kirjausPvm": "2025-05-14T10:59:47.597Z",
      "esittelyPvm": null,
      "paatosPvm": null,
      "esittelijaOid": "1.2.246.562.24.00000000000000006666",
      "ataruHakemuksenTila": "processing-fee-paid",
      "kasittelyVaihe": "AlkukasittelyKesken",
      "muokattu": "2025-05-14T11:03:59.591Z",
      "muutosHistoria": [],
      "taydennyspyyntoLahetetty": null,
      "pyydettavatAsiakirjat": [],
      "allekirjoituksetTarkistettu": false,
      "allekirjoituksetTarkistettuLisatiedot": null,
      "alkuperaisetAsiakirjatSaatuNahtavaksi": false,
      "alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot": null,
      "selvityksetSaatu": false,
      "asiakirjamallitTutkinnoista": {},
      "imiPyynto": {
        "imiPyynto": null,
        "imiPyyntoNumero": null,
        "imiPyyntoLahetetty": null,
        "imiPyyntoVastattu": null
      },
      "apHakemus": null,
      "yhteistutkinto": false,
      "suostumusVahvistamiselleSaatu": false
    }""")

    val afterJson = Some("""{
      "hakemusOid": "1.2.246.562.11.00000000000000006666",
      "lomakeOid": "form-123",
      "hakija": {
        "etunimet": "Testi Kolmas",
        "kutsumanimi": "Tatu",
        "sukunimi": "Hakija",
        "kansalaisuus": {"fi": "Suomi", "sv": "Finland", "en": "Finland"},
        "hetu": "180462-9981",
        "syntymaaika": "18.04.1962",
        "matkapuhelin": "+3584411222333",
        "asuinmaa": {"fi": "Suomi", "sv": "Finland", "en": "Finland"},
        "katuosoite": "Sillitie 1",
        "postinumero": "00800",
        "postitoimipaikka": "HELSINKI",
        "kotikunta": {"fi": "Kajaani", "sv": "Kajana", "en": "Kajaani"},
        "sahkopostiosoite": "patu.kuusinen@riibasu.fi"
      },
      "sisalto": [
        {
          "key": "first-name",
          "value": "tatu",
          "fieldType": "textField"
        },
        {
          "key": "last-name", 
          "value": "honka",
          "fieldType": "textField"
        },
        {
          "key": "new-field",
          "value": "new-value",
          "fieldType": "textField"
        }
      ],
      "liitteidenTilat": [
        {
          "attachment": "582be518-e3ea-4692-8a2c-8370b40213e9",
          "state": "checked",
          "hakukohde": "form"
        },
        {
          "attachment": "new-attachment-id",
          "state": "not-checked",
          "hakukohde": "form"
        }
      ],
      "hakemusKoskee": 1,
      "asiatunnus": "OPH-197-2025-UPDATED",
      "kirjausPvm": "2025-05-14T10:59:47.597Z",
      "esittelyPvm": "2025-05-15T09:00:00.000Z",
      "paatosPvm": null,
      "esittelijaOid": "1.2.246.562.24.00000000000000006666",
      "ataruHakemuksenTila": "processing-fee-paid",
      "kasittelyVaihe": "Esittelyssa",
      "muokattu": "2025-05-15T09:00:00.000Z",
      "muutosHistoria": [
        {
          "time": "2025-05-15T09:00:00.000Z",
          "modifiedBy": "1.2.246.562.24.00000000000000006666"
        }
      ],
      "taydennyspyyntoLahetetty": null,
      "pyydettavatAsiakirjat": [],
      "allekirjoituksetTarkistettu": true,
      "allekirjoituksetTarkistettuLisatiedot": "Allekirjoitukset tarkistettu kopioista",
      "alkuperaisetAsiakirjatSaatuNahtavaksi": true,
      "alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot": "Yksipuoliset kopiot. Alkuperäiset kaksipuolisia.",
      "selvityksetSaatu": true,
      "asiakirjamallitTutkinnoista": {},
      "imiPyynto": {
        "imiPyynto": true,
        "imiPyyntoNumero": "122224",
        "imiPyyntoLahetetty": "2025-05-15T09:00:00.000Z",
        "imiPyyntoVastattu": null
      },
      "apHakemus": true,
      "yhteistutkinto": false,
      "suostumusVahvistamiselleSaatu": true
    }""")

    val changes = AuditUtil.getChanges(beforeJson, afterJson)

    val changesArray = changes.asJsonArray()

    // Should have total of 23 changes
    assertTrue(changesArray.size() == 23)

    val changesList = (0 until changesArray.size()).map(i => changesArray.get(i).asInstanceOf[JsonObject]).toList
    val fieldNames  = changesList.map(_.get("fieldName").getAsString).toSet

    // Verify added fields
    assertTrue(fieldNames.contains("sisalto[2].key"))
    assertTrue(fieldNames.contains("sisalto[2].value"))
    assertTrue(fieldNames.contains("sisalto[2].fieldType"))
    assertTrue(fieldNames.contains("liitteidenTilat[1].attachment"))
    assertTrue(fieldNames.contains("liitteidenTilat[1].state"))
    assertTrue(fieldNames.contains("liitteidenTilat[1].hakukohde"))
    assertTrue(fieldNames.contains("muutosHistoria[0].time"))
    assertTrue(fieldNames.contains("muutosHistoria[0].modifiedBy"))

    // Verify updated fields
    assertTrue(fieldNames.contains("asiatunnus"))
    assertTrue(fieldNames.contains("esittelyPvm"))
    assertTrue(fieldNames.contains("kasittelyVaihe"))
    assertTrue(fieldNames.contains("muokattu"))
    assertTrue(fieldNames.contains("allekirjoituksetTarkistettu"))
    assertTrue(fieldNames.contains("allekirjoituksetTarkistettuLisatiedot"))
    assertTrue(fieldNames.contains("alkuperaisetAsiakirjatSaatuNahtavaksi"))
    assertTrue(fieldNames.contains("alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot"))
    assertTrue(fieldNames.contains("selvityksetSaatu"))
    assertTrue(fieldNames.contains("imiPyynto.imiPyynto"))
    assertTrue(fieldNames.contains("imiPyynto.imiPyyntoNumero"))
    assertTrue(fieldNames.contains("imiPyynto.imiPyyntoLahetetty"))
    assertTrue(fieldNames.contains("apHakemus"))
    assertTrue(fieldNames.contains("suostumusVahvistamiselleSaatu"))

    // Verify array element updates
    assertTrue(fieldNames.contains("liitteidenTilat[0].state"))
  }

  @Test
  @DisplayName("Should detect changes in Hakemus with nested complex structures")
  def testGetChangesHakemusNestedComplex(): Unit = {
    val beforeJson = Some("""{
      "hakemusOid": "1.2.246.562.11.00000000000000006667",
      "hakija": {
        "kansalaisuus": {"fi": "Suomi", "sv": "Finland"},
        "asuinmaa": {"fi": "Suomi", "sv": "Finland"},
        "kotikunta": {"fi": "Helsinki", "sv": "Helsingfors"}
      },
      "sisalto": [
        {
          "key": "nationality",
          "value": [["246"]],
          "fieldType": "dropdown"
        }
      ],
      "asiakirjamallitTutkinnoista": {
        "AMK": {
          "tutkinto": "Insinööri (AMK)",
          "koulutusohjelma": "Tietotekniikka"
        }
      }
    }""")

    val afterJson = Some("""{
      "hakemusOid": "1.2.246.562.11.00000000000000006667",
      "hakija": {
        "kansalaisuus": {"fi": "Suomi", "sv": "Finland", "en": "Finland"},
        "asuinmaa": {"fi": "Suomi", "sv": "Finland", "en": "Finland"},
        "kotikunta": {"fi": "Helsinki", "sv": "Helsingfors", "en": "Helsinki"}
      },
      "sisalto": [
        {
          "key": "nationality",
          "value": [["246", "358"]],
          "fieldType": "dropdown"
        }
      ],
      "asiakirjamallitTutkinnoista": {
        "AMK": {
          "tutkinto": "Insinööri (AMK)",
          "koulutusohjelma": "Tietotekniikka",
          "opintopisteet": 240
        },
        "YAMK": {
          "tutkinto": "Ylempi AMK",
          "koulutusohjelma": "Tietojenkäsittelytiede"
        }
      }
    }""")

    val changes = AuditUtil.getChanges(beforeJson, afterJson)

    val changesArray = changes.asJsonArray()

    // Should have total of 7 changes
    assertTrue(changesArray.size() == 7)

    val changesList = (0 until changesArray.size()).map(i => changesArray.get(i).asInstanceOf[JsonObject]).toList
    val fieldNames  = changesList.map(_.get("fieldName").getAsString).toSet

    // Verify nested object additions
    assertTrue(fieldNames.contains("hakija.kansalaisuus.en"))
    assertTrue(fieldNames.contains("hakija.asuinmaa.en"))
    assertTrue(fieldNames.contains("hakija.kotikunta.en"))

    // Verify array element updates
    assertTrue(fieldNames.contains("sisalto[0].value[0][1]"))

    // Verify nested map additions
    assertTrue(fieldNames.contains("asiakirjamallitTutkinnoista.AMK.opintopisteet"))
    assertTrue(fieldNames.contains("asiakirjamallitTutkinnoista.YAMK.tutkinto"))
    assertTrue(fieldNames.contains("asiakirjamallitTutkinnoista.YAMK.koulutusohjelma"))
  }

  @Test
  @DisplayName("Should handle PartialHakemus updates similar to controller use case")
  def testGetChangesPartialHakemus(): Unit = {
    val beforeJson = Some("""{
      "hakemusKoskee": 1,
      "asiatunnus": "OPH-197-2025",
      "kasittelyVaihe": "AlkukasittelyKesken",
      "allekirjoituksetTarkistettu": false,
      "selvityksetSaatu": false,
      "imiPyynto": {
        "imiPyynto": null,
        "imiPyyntoNumero": null
      }
    }""")

    val afterJson = Some("""{
      "hakemusKoskee": 2,
      "asiatunnus": "OPH-197-2025-UPDATED",
      "kasittelyVaihe": "Esittelyssa",
      "allekirjoituksetTarkistettu": true,
      "allekirjoituksetTarkistettuLisatiedot": "Allekirjoitukset tarkistettu",
      "selvityksetSaatu": true,
      "imiPyynto": {
        "imiPyynto": true,
        "imiPyyntoNumero": "122224",
        "imiPyyntoLahetetty": "2025-05-15T09:00:00.000Z"
      },
      "apHakemus": true,
      "yhteistutkinto": true
    }""")

    val changes = AuditUtil.getChanges(beforeJson, afterJson)

    val changesArray = changes.asJsonArray()

    // Should have total of 11 changes
    assertTrue(changesArray.size() == 11)

    val changesList = (0 until changesArray.size()).map(i => changesArray.get(i).asInstanceOf[JsonObject]).toList
    val fieldNames  = changesList.map(_.get("fieldName").getAsString).toSet

    // Verify updated fields
    assertTrue(fieldNames.contains("hakemusKoskee"))
    assertTrue(fieldNames.contains("asiatunnus"))
    assertTrue(fieldNames.contains("kasittelyVaihe"))
    assertTrue(fieldNames.contains("allekirjoituksetTarkistettu"))
    assertTrue(fieldNames.contains("selvityksetSaatu"))

    // Verify added fields
    assertTrue(fieldNames.contains("allekirjoituksetTarkistettuLisatiedot"))
    assertTrue(fieldNames.contains("apHakemus"))
    assertTrue(fieldNames.contains("yhteistutkinto"))

    // Verify nested object updates
    assertTrue(fieldNames.contains("imiPyynto.imiPyynto"))
    assertTrue(fieldNames.contains("imiPyynto.imiPyyntoNumero"))
    assertTrue(fieldNames.contains("imiPyynto.imiPyyntoLahetetty"))
  }
}
