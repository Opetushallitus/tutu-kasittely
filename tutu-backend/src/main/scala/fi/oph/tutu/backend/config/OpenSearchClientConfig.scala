package fi.oph.tutu.backend.config

import org.apache.hc.core5.http.HttpHost
import org.opensearch.client.opensearch.OpenSearchClient
import org.opensearch.client.transport.httpclient5.ApacheHttpClient5TransportBuilder
import org.springframework.context.annotation.{Bean, Configuration}

@Configuration
class OpenSearchClientConfig {

  @Bean
  def openSearchClient: OpenSearchClient = {
    val host      = new HttpHost("http", "localhost", 9200)
    val builder   = ApacheHttpClient5TransportBuilder.builder(host)
    val transport = builder.build()
    new OpenSearchClient(transport)
  }
}
