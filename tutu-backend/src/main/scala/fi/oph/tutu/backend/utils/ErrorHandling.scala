package fi.oph.tutu.backend.utils

import org.slf4j.Logger

object ErrorHandling {

  def withErrorHandling[T](
    operation: String,
    logger: Logger,
    onError: Throwable => T = (t: Throwable) => throw t
  )(block: => T): T = {
    try {
      block
    } catch {
      case exception: Exception =>
        logger.error(s"$operation epäonnistui", exception)
        onError(exception)
    }
  }

  def logAndThrow[T](operation: String, logger: Logger, exception: Throwable): T = {
    logger.error(s"$operation epäonnistui", exception)
    throw exception
  }
}
