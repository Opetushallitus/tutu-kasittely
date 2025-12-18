package fi.oph.tutu.backend.utils

import fi.oph.tutu.backend.domain.Kieli.*
import _root_.fi.oph.tutu.backend.domain.{AtaruKysymysId, PaatosTietoOption}

object Constants {
  val ATARU_SERVICE = "Hakemuspalvelu"
  val TUTU_SERVICE  = "Tutu"

  val HAKEMUS_KOSKEE_LOPULLINEN_PAATOS = 5

  val DATE_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSX"

  val ATARU_PAATOS_KIELI: AtaruKysymysId =
    AtaruKysymysId("82c7260d-ebf0-4521-8f18-ad37e5490670", "paatos-kieli")

  val ATARU_TUTKINTO_1_NIMI: AtaruKysymysId =
    AtaruKysymysId("ea25df4f-52a8-4540-83b7-19dffdd353f7", "tutu-first-degree-name")
  val ATARU_TUTKINTO_1_OPPILAITOS: AtaruKysymysId =
    AtaruKysymysId("f79acf0e-d410-4948-9e0a-84596b092d32", "tutu-first-degree-school")
  val ATARU_TUTKINTO_1_ALOITUS_VUOSI: AtaruKysymysId =
    AtaruKysymysId("7812a33b-1ea5-4b67-918a-660f0a1a4e22", "tutu-first-degree-start-year")
  val ATARU_TUTKINTO_1_LOPETUS_VUOSI: AtaruKysymysId =
    AtaruKysymysId("b6b2fc1f-2749-42d1-823a-4b4a33fe30b6", "tutu-first-degree-end-year")
  val ATARU_TUTKINTO_1_MAA: AtaruKysymysId =
    AtaruKysymysId("6e43a241-a3bd-4625-8035-40768a109461", "tutu-first-degree-country")
  val ATARU_TUTKINTO_1_OPINNAYTETYO: AtaruKysymysId =
    AtaruKysymysId("337c0b08-03d3-4659-9309-aa1bbe731717", "tutu-first-degree-final-project")
  val ATARU_TUTKINTO_1_HARJOITTELU: AtaruKysymysId =
    AtaruKysymysId("85d1aac5-b75f-4bba-9b52-6a42aad1c437", "tutu-first-degree-internship")

  val ATARU_TUTKINTO_2_NIMI: AtaruKysymysId =
    AtaruKysymysId("d7eb503d-44f0-4445-8eb1-5e65c22fe764", "tutu-second-degree-name")
  val ATARU_TUTKINTO_2_OPPILAITOS: AtaruKysymysId =
    AtaruKysymysId("f369367d-300a-4b36-b19b-91f3f72c841d", "tutu-second-degree-school")
  val ATARU_TUTKINTO_2_MAA: AtaruKysymysId =
    AtaruKysymysId("38a35cad-743b-43b8-96d1-e75c9674cc5e", "tutu-second-degree-country")
  val ATARU_TUTKINTO_2_ALOITUS_VUOSI: AtaruKysymysId =
    AtaruKysymysId("a76d09cf-a214-4abd-be63-cbbe63a5897b", "tutu-second-degree-start-year")
  val ATARU_TUTKINTO_2_LOPETUS_VUOSI: AtaruKysymysId =
    AtaruKysymysId("58345eb0-8179-4f5f-beb8-ef8397a63e8c", "tutu-second-degree-end-year")
  val ATARU_TUTKINTO_2_OPINNAYTETYO: AtaruKysymysId =
    AtaruKysymysId("f4da3e15-fcd6-4a65-a408-8550bfb4fbd2", "tutu-second-degree-final-project")
  val ATARU_TUTKINTO_2_HARJOITTELU: AtaruKysymysId =
    AtaruKysymysId("f0af0bb7-8e4a-4582-9e5c-dd3de9273beb", "tutu-second-degree-internship")

  val ATARU_TUTKINTO_3_NIMI: AtaruKysymysId =
    AtaruKysymysId("8a75125b-0677-4695-b76a-ed058a602b0a", "tutu-third-degree-name")
  val ATARU_TUTKINTO_3_OPPILAITOS: AtaruKysymysId =
    AtaruKysymysId("3feb11ad-354e-443f-9bcf-4cb23ca8079f", "tutu-third-degree-school")
  val ATARU_TUTKINTO_3_MAA: AtaruKysymysId =
    AtaruKysymysId("cd00fb20-b4de-4a6a-888e-0aae2c0fb49d", "tutu-third-degree-country")
  val ATARU_TUTKINTO_3_ALOITUS_VUOSI: AtaruKysymysId =
    AtaruKysymysId("8b30c1ab-885b-4989-ba1c-58b391ef35a7", "tutu-third-degree-start-year")
  val ATARU_TUTKINTO_3_LOPETUS_VUOSI: AtaruKysymysId =
    AtaruKysymysId("b7b38bf4-12bb-4e58-9399-4fb59fdb326e", "tutu-third-degree-end-year")
  val ATARU_TUTKINTO_3_OPINNAYTETYO: AtaruKysymysId =
    AtaruKysymysId("6f284c1d-15ed-4ca8-9474-69d310eed7cf", "tutu-third-degree-final-project")
  val ATARU_TUTKINTO_3_HARJOITTELU: AtaruKysymysId =
    AtaruKysymysId("7e2c9068-886e-4518-990d-938901116a1f", "tutu-third-degree-internship")

  val ATARU_MUU_TUTKINTO_TIETO: AtaruKysymysId =
    AtaruKysymysId("743fd221-6ec7-40d8-9758-7786e7ff2458", "tutu-other-degree-text")

  val ATARU_SAHKOISEN_ASIOINNIN_LUPA: AtaruKysymysId =
    AtaruKysymysId("1098b604-115b-4e59-ba11-073c0924e473", "sahkoisen-asioinnin-lupa")

  val ATARU_HAKEMUS_KOSKEE: AtaruKysymysId =
    AtaruKysymysId("97840c6c-3642-48d0-9f47-adf9ee1793cc", "tutu-apply-reason")

  val ATARU_LOPULLINEN_PAATOS_SUORITUSMAA: AtaruKysymysId =
    AtaruKysymysId("6e43a241-a3bd-4625-8035-40768a109461", "lopullinen-paatos-suoritusmaa")
  val ATARU_LOPULLINEN_PAATOS_VASTAAVA_EHDOLLINEN: AtaruKysymysId =
    AtaruKysymysId("ea25df4f-52a8-4540-83b7-19dffdd353f7", "lopullinen-paatos-vastaava-ehdollinen")

  // Lomakkeen avaimet
  val ATARU_LOMAKE_KELPOISUUS_AMMATTIIN_OPETUSALA_OPTIONS: AtaruKysymysId =
    AtaruKysymysId("e8cd9e32-6690-4e30-a099-e6a71c433c24", "opetusalan-ammatit-options")
  val ATARU_LOMAKE_KELPOISUUS_AMMATTIIN_VARHAISKASVATUS_OPTIONS: AtaruKysymysId =
    AtaruKysymysId("54559d94-9dff-4103-9b31-a0a4a5bbd7bd", "varhaiskasvatuksen-tehtavat-options")

  val ATARU_LOMAKE_TIETTY_TUTKINTO_TAI_OPINNOT_AINE_OPTIONS: AtaruKysymysId =
    AtaruKysymysId("370b6714-2934-4ce8-aef9-0b52f7eef4d5", "tietty-tutkinto-tai-opinnot-aine-options")
  val ATARU_LOMAKE_TIETTY_TUTKINTO_TAI_OPINNOT_OIKEUSTIETEELLINEN_OPTIONS: AtaruKysymysId =
    AtaruKysymysId("a9c20eff-b25d-4bb6-a96d-85d30a6c0d5a", "tietty-tutkinto-tai-opinnot-oikeustieteellinen-options")

  val ATARU_LOMAKE_RIITTAVAT_OPINNOT_OPTIONS: AtaruKysymysId = {
    AtaruKysymysId("337b4741-2550-4f21-adb5-69dfdcbb7829", "riittavat-opinnot-options")
  }

  // Kovakoodatut juuritason arvot päätöstiedon kelpoisuusoptioissa
  val KELPOISUUS_AMMATTIIN_OPETUSALA_ROOT_VALUE: PaatosTietoOption =
    PaatosTietoOption(
      label =
        Some(Map(fi -> "Opetusalan ammatit", sv -> "Uppgifter inom undervisningsområdet", en -> "Teaching positions")),
      value =
        Some(Map(fi -> "Opetusalan ammatit", sv -> "Uppgifter inom undervisningsområdet", en -> "Teaching positions")),
      children = Seq()
    )
  val KELPOISUUS_AMMATTIIN_VARHAISKASVATUS_ROOT_VALUE: PaatosTietoOption =
    PaatosTietoOption(
      label = Some(
        Map(
          fi -> "Varhaiskasvatuksen tehtävät",
          sv -> "Uppgifter inom småbarnspedagogik",
          en -> "Professions in early childhood education and care"
        )
      ),
      value = Some(
        Map(
          fi -> "Varhaiskasvatuksen tehtävät",
          sv -> "Uppgifter inom småbarnspedagogik",
          en -> "Professions in early childhood education and care"
        )
      ),
      children = Seq()
    )
}
