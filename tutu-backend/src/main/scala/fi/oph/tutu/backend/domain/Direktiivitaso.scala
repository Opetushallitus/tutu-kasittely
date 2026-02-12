package fi.oph.tutu.backend.domain

enum Direktiivitaso:
  case a_1384_2015_patevyystaso_1, b_1384_2015_patevyystaso_2, c_1384_2015_patevyystaso_3, d_1384_2015_patevyystaso_4,
    e_1384_2015_patevyystaso_5

object Direktiivitaso:
  def optionFromString(value: String): Option[Direktiivitaso] = value match
    case "a_1384_2015_patevyystaso_1"     => Some(a_1384_2015_patevyystaso_1)
    case "b_1384_2015_patevyystaso_2"     => Some(b_1384_2015_patevyystaso_2)
    case "c_1384_2015_patevyystaso_3"     => Some(c_1384_2015_patevyystaso_3)
    case "d_1384_2015_patevyystaso_4"     => Some(d_1384_2015_patevyystaso_4)
    case "e_1384_2015_patevyystaso_5"     => Some(e_1384_2015_patevyystaso_5)
    case s if Option(s).forall(_.isBlank) => None
    case _                                => throw new IllegalArgumentException(s"Tuntematon direktiivitaso: $value")
