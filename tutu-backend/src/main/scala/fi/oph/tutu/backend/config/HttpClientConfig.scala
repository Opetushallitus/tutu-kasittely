package fi.oph.tutu.backend.config

import org.asynchttpclient.{AsyncHttpClient, DefaultAsyncHttpClient, DefaultAsyncHttpClientConfig}
import org.springframework.context.annotation.{Bean, Configuration}

@Configuration
class HttpClientConfig() {

  @Bean(destroyMethod = "close")
  def asyncHttpClient(): AsyncHttpClient = {

    val config = new DefaultAsyncHttpClientConfig.Builder()
      .setMaxConnections(500)
      .setMaxConnectionsPerHost(200)
      .setConnectTimeout(java.time.Duration.ofSeconds(10))
      .setRequestTimeout(java.time.Duration.ofSeconds(30))
      .setMaxRedirects(5)
      .build()

    new DefaultAsyncHttpClient(config)
  }
}
