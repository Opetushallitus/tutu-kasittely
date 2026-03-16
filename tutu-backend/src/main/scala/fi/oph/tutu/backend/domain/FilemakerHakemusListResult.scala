package fi.oph.tutu.backend.domain

import com.fasterxml.jackson.databind.node.ObjectNode

case class FilemakerHakemusListResult(
  items: Seq[ObjectNode],
  totalCount: Long,
  page: Int,
  pageSize: Int,
  totalPages: Int
)
