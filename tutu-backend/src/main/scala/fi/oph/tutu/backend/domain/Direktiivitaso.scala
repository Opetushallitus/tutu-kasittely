package fi.oph.tutu.backend.domain

enum Direktiivitaso:
  case a_1384_2015_patevyystaso_1, b_1384_2015_patevyystaso_2, c_1384_2015_patevyystaso_3, d_1384_2015_patevyystaso_4,
    e_1384_2015_patevyystaso_5

object Direktiivitaso:
  def fromString(value: String): Direktiivitaso = value match
    case "a_1384_2015_patevyystaso_1" => a_1384_2015_patevyystaso_1
    case "b_1384_2015_patevyystaso_2" => b_1384_2015_patevyystaso_2
    case "c_1384_2015_patevyystaso_3" => c_1384_2015_patevyystaso_3
    case "d_1384_2015_patevyystaso_4" => d_1384_2015_patevyystaso_4
    case "e_1384_2015_patevyystaso_5" => e_1384_2015_patevyystaso_5
    case _                            => null
