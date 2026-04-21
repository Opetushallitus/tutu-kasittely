package fi.oph.tutu.backend.repository

import slick.jdbc.SQLActionBuilder

// Consider slick-pg if this is not enough:
// https://github.com/tminglei/slick-pg/blob/master/src/main/scala/com/github/tminglei/slickpg/PgArraySupport.scala#L57
implicit val strSeqParameter: slick.jdbc.SetParameter[Seq[String]] =
  slick.jdbc.SetParameter[Seq[String]] { (param, pointedParameters) =>
    pointedParameters.setObject(param.toArray, java.sql.Types.ARRAY)
  }

implicit val intSeqParameter: slick.jdbc.SetParameter[Seq[Int]] =
  slick.jdbc.SetParameter[Seq[Int]] { (param, pointedParameters) =>
    pointedParameters.setObject(param.toArray, java.sql.Types.ARRAY)
  }

extension (a: SQLActionBuilder) def ++(b: SQLActionBuilder): SQLActionBuilder = a.concat(b)
