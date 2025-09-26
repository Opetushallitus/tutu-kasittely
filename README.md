# Tutkintojen tunnustamisen hakemusten käsittelypalvelu

[![Tutu-backend](https://github.com/Opetushallitus/tutu-kasittely/actions/workflows/build-backend.yml/badge.svg)](https://github.com/Opetushallitus/tutu-kasittely/actions/workflows/build-backend.yml)
[![Tutu-frontend](https://github.com/Opetushallitus/tutu-kasittely/actions/workflows/build-frontend.yml/badge.svg)](https://github.com/Opetushallitus/tutu-kasittely/actions/workflows/build-frontend.yml)

Palvelu tutu-hakemusten käsittelyyn.

# Tutu-backend

Backend käyttää Java Corretton versiota 21.

Backendiä ajetaan IDEA:ssa. Kehitysympäristön konfiguraatio määritellään `application-dev.properties`-nimisessä tiedostossa

```
spring.datasource.url=jdbc:postgresql://localhost:5433/tutu
spring.datasource.username=app
spring.datasource.password=app

flyway.locations=classpath:db/migration

opintopolku.virkailija.url=https://virkailija.untuvaopintopolku.fi
#opintopolku.virkailija.url=https://virkailija.testiopintopolku.fi

cas.url=${opintopolku.virkailija.url}/cas

tutu.ui.url=https://localhost:3123
tutu.backend.url=https://localhost:8444/tutu-backend
tutu-backend.cas.username=<CAS-KAYTTAJATUNNUS>
tutu-backend.cas.password=<CAS-SALASANA>
# Untuvan käyttöoikeusryhmät
tutu-backend.esittelija.kayttooikeusryhma.ids=71713274,71713307
#logging.level.org.springframework.cache=TRACE
logger.scala.slick.jdbc.JdbcBackend.statement=DEBUG

#logging.level.org.springframework.security=DEBUG
#logging.level.org.jasig.cas.client=DEBUG
#logging.level.org.apereo.cas=DEBUG
#logging.level.org.springframework.web=DEBUG

server.port=8444
#self-signed SSL-sertifikaatti lokaalia kayttoa varten - ota pois kommenteista jos olet ajanut generate_certs.sh
#server.ssl.key-store=classpath:localhost-keystore.p12
#server.ssl.key-store-password=tutubackendkey
#server.ssl.key-store-type=PKCS12
#server.ssl.key-alias=tutu-backend
```

Backendiä voi ajaa lokaalia dockeriin käynnistettävää postgresia vasten.

`justfile`:stä löytyy komento tietokannan pystyttämiseen.

[just](https://github.com/casey/just) on
komentorivityökalu komentojen dokumentoimiseen ja ajamiseen. Esimerkiksi `just start-postgresql` käynnistää lokaalin kannan docker-konttiin ja `just start-all` käynnistää tietokannan, backendin ja frontendin.

`just`:in asentaminen ei ole välttämätöntä backendin ajamiseksi,
vaan voit katsoa tarvittavat komennot `justfile`:stä ja ajaa ne sellaisinaan komentoriviltä.

Lokaalisti Ideassa backendia ajaessa lisää `spring.profiles.active=dev`-rivi `application.properties`-tiedostoon
tai anna käynnistysparametri `--spring.profiles.active=dev`.
Jotta properties-tiedostot luetaan hakemiston oph-configuration alta, tulee antaa käynnistysparametri `spring.config.additional-location=classpath:/oph-configuration/application.properties`

# Lokaali HTTPS

Lokaaliympäristössä backendin ja käyttöliittymän käyttö https yli cas-autentikoinnilla ja sessiohallinnalla edellyttää sertifikaattien ja keystoren generointia.
Nämä saa luotua ajamalla projektin juuressa skriptin `generate_certs.sh`.

# Swagger

Tutu-backendin rajapinnat on dokumentoitu Swaggeriä käyttäen ja se löytyy osoitteesta: `http://localhost:8444/tutu-backend/swagger-ui/index.html`.

## Filemaker XML-migraatiopalvelu

### Yleiskuvaus

Sovellus hakee XML-tiedostoja dokumenttipalvelusta `https://github.com/Opetushallitus/dokumenttipalvelu` (jopa 2GB), ja lataa mahdollisesti massiivisen XML-tiedoston ja käsittelee sen streampohjaisesti hallittaviin paloihin ja muuntaa JSON-muotoon.

### Arkkitehtuuri

1. **XML-haku**: `MigrationService` hakee tiedoston `dokumenttipalvelu`-palvelusta joka on dev ympäristössä mock ja tuotannossa AWS S3
2. **Paloittelu**: `XmlChunker` jakaa tiedoston konfiguraatiossa määriteltyihin paloihin
3. **Tallennus**: Palat tallennetaan `vanha_tutu_migration`-tauluun
4. **Käsittely**: `ChunkProcessor` muuntaa XML-palat JSON:ksi ja tallentaa `vanha_tutu`-tauluun

### Konfiguraatio

#### Migraatiopalvelun konfiguraatio

Konfiguraatio määritellään `application-dev.properties` ja `application-prod.properties` tiedostoissa:

- **Dev** (`application-dev.properties`): 100 riviä/pala, 50MB muisti, max 10 palaa (yhteensä max. 1000 data-entiteettiä yhdestä XML-tiedostosta)
- **Prod** (`application-prod.properties`): 200 riviä/pala, 100MB muisti, max 150 palaa (yhteensä max. 30 000 data-entiteettiä yhdestä XML-tiedostosta)

```properties
# application-prod.properties
tutu.migration.chunking.environment=prod
tutu.migration.chunking.chunk-size=200
tutu.migration.chunking.max-memory-mb=100
tutu.migration.chunking.max-chunks=150
```

#### Dokumenttipalvelun konfiguraatio

Dokumenttipalvelu vaatii seuraavat konfiguraatiot:

**Kehitysympäristö (dev):**

```properties
# Mock dokumenttipalvelu dev/test kehitysympäristössä
dokumenttipalvelu.mock.enabled=true
dokumenttipalvelu.mock.base-url=http://localhost:8080/mock-dokumenttipalvelu
```

**Tuotantoympäristö (prod):**

```properties
# AWS S3 dokumenttipalvelu tuotannossa
dokumenttipalvelu.aws.region={AWS_REGION}
dokumenttipalvelu.aws.bucket-name={AWS_BUCKET}
dokumenttipalvelu.aws.access-key-id=${AWS_ACCESS_KEY_ID}
dokumenttipalvelu.aws.secret-access-key=${AWS_SECRET_ACCESS_KEY}
```

### Swagger-rajapinnat

- `GET /api/migration/start?key={fileKey}` - Käynnistää migraation
- `GET /api/vanha-tutu/{id}` - Hakee migroidun tiedon ID:n perusteella

### Migraatiopalvelun lisätoiminnot

- **Migraation jatkaminen**: `MigrationService.resumeMigration()` - Jatkaa keskeytynyttä migraatiota
- **Tilastot**: `MigrationService.getMigrationStats()` - Hakee migraation käsittelytilastot
- **Automaattinen siivous**: Käsitellyt palat poistetaan automaattisesti migraation jälkeen
- **Muistinkäytön arviointi**: `XmlChunker.getMemoryEstimate()` - Arvioi optimaalisen palakoon

### Filemaker XML testidatan generointi

```bash
# Generoi erikokoisia testitiedostoja
# Lisää jokaiseen tietokenttään TEXT, NUMBER tai DATE 50% todennäköisyydellä NULL tai default-sisällön.
python3 generate_test_data.py

# Luo tiedostot:
# - vanha_tutu_s.xml (20 testitapausta)
# - vanha_tutu_m.xml (200 testitapausta)
# - vanha_tutu_l.xml (2000 testitapausta)
# - vanha_tutu_xl.xml (10000 testitapausta)
```

### Tietokantataulut

- `vanha_tutu_migration`: XML-palat (id, chunk_index, total_chunks, xml_chunk, processed, created_at, processed_at)
- `vanha_tutu`: JSON-data (id, data_json JSONB)
