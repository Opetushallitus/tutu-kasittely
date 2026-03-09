package fi.oph.tutu.backend.domain

case class HakemusListResult(
  items: Seq[HakemusListItem],
  totalCount: Long,
  page: Int,
  pageSize: Int,
  totalPages: Int
)
