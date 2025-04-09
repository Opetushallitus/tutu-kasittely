# Tutkintojen tunnistamisen hakemusten käsittelypalvelu

Palvelu tutu-hakemusten käsittelyyn.

# Tutu-backend

Backend käyttää Java Corretton versiota 21.

Backendiä ajetaan IDEA:ssa. Kehitysympäristön konfiguraatio määritellään `application-dev.properties`-nimisessä tiedostossa
````
spring.datasource.url=jdbc:postgresql://localhost:5432/tutu
spring.datasource.username=app
spring.datasource.password=app

session.schema.name=tutu

flyway.locations=classpath:db/migration

opintopolku.virkailija.url=https://virkailija.hahtuvaopintopolku.fi
cas.url=${opintopolku.virkailija.url}/cas
#tutu.ui.url=https://localhost:3405
tutu.backend.url=https://localhost:8443/tutu-backend
tutu-backend.cas.username=<CAS-KAYTTAJATUNNUS>
tutu-backend.cas.password=<CAS-SALASANA>
#logging.level.org.springframework.cache=TRACE

server.port=8443
#self-signed SSL-sertifikaatti lokaalia kayttoa varten
#server.ssl.key-store=classpath:keystore.p12
#server.ssl.key-store-password=tutubackendkey
#server.ssl.key-store-type=PKCS12
#server.ssl.key-alias=tutu-backend
````

Backendiä voi ajaa lokaalia dockeriin käynnistettävää postgresia vasten.

`justfile`:stä löytyy komento tietokannan pystyttämiseen. 

[just](https://github.com/casey/just) on
komentorivityökalu komentojen dokumentoimiseen ja ajamiseen. Esimerkiksi `just start-postgresql` käynnistää lokaalin kannan docker-konttiin. `just`:in asentaminen ei ole välttämätöntä backendin ajamiseksi,
vaan voit katsoa tarvittavat komennot `justfile`:stä ja ajaa ne sellaisinaan komentoriviltä.

Lokaalisti backendia ajaessa lisää `spring.profiles.active=dev`-rivi `application.properties`-tiedostoon
tai anna käynnistysparametri `--spring.profiles.active=dev`.
Jotta properties-tiedostot luetaan hakemiston oph-configuration alta, tulee antaa käynnistysparametri `spring.config.additional-location=classpath:/oph-configuration/application.properties`

# TODO SWAGGER:

Tutu-backendin rajapinta on dokumentoitu Swaggeriä käyttäen ja se löytyy osoitteesta: `http://localhost:8080/tutu-backend/swagger-ui/index.html`.
Rajapintojen kutsuminen edellyttää kirjautumista. Kehitysympäristössä tämä tapahtuu helpoiten siten, että myös tutu-ui on
lokaalisti käynnissä ja kirjaudut sen kautta sisään ennen swaggerin rajapintojen käyttämistä.


