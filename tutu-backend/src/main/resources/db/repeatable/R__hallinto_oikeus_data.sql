-- Viimeksi päivitetty: 2025-10-27
--
-- Tietolähteet:
-- - Yhteystiedot: https://tuomioistuimet.fi/fi/index/yhteystiedot/yhteystiedot.html
--   (Hallinto-oikeuksien puhelinnumerot, sähköpostit ja osoitteet)
-- - PTV (Palvelutietovaranto) API v11: https://kehittajille.suomi.fi/palvelut/palvelutietovaranto/ptv-tietojen-hyodyntaminen
--   (organizationId: cf00d48d-8c05-4044-a6d9-46f16f08dda2 - Suomen tuomioistuimet)
-- - Ahvenanmaan hallintotuomioistuin ylläpidetään manuaalisesti (ei PTV:ssä)
--
-- HUOM: Tämä on repeatable-migraatio joka pyyhkii ja uudelleenluo kaikki hallinto-oikeus-tiedot.
-- Tämä on tarkoituksellista, koska nämä ovat viranomaisesta ylläpidettäviä referenssitietoja
-- joita ei tule muokata manuaalisesti tietokannassa.

DELETE FROM maakunta_hallinto_oikeus;
DELETE FROM hallinto_oikeus;

INSERT INTO hallinto_oikeus (koodi, nimi, osoite, puhelin, sahkoposti, verkkosivu) VALUES
('HELSINKI',
 '{"fi": "Helsingin hallinto-oikeus", "sv": "Helsingfors förvaltningsdomstol", "en": "Helsinki Administrative Court"}'::jsonb,
 '{"fi": "Radanrakentajantie 5, 00520 Helsinki", "sv": "Banbyggarvägen 5, 00520 Helsingfors", "en": "Radanrakentajantie 5, 00520 Helsinki"}'::jsonb,
 '029 56 42069', 'helsinki.hao@oikeus.fi',
 '{"fi": "https://tuomioistuimet.fi/hallintooikeudet/helsinginhallinto-oikeus/fi/index.html", "sv": "https://tuomioistuimet.fi/hallintooikeudet/helsinginhallinto-oikeus/sv/index.html", "en": "https://tuomioistuimet.fi/hallintooikeudet/helsinginhallinto-oikeus/en/index.html"}'::jsonb
),
('TURKU',
 '{"fi": "Turun hallinto-oikeus", "sv": "Åbo förvaltningsdomstol", "en": "Turku Administrative Court"}'::jsonb,
 '{"fi": "Puolalanmäki 1, 20100 Turku", "sv": "Puolalanmäki 1, 20100 Åbo", "en": "Puolalanmäki 1, 20100 Turku"}'::jsonb,
 '029 56 46000', 'turku.ho@oikeus.fi',
 '{"fi": "https://oikeus.fi/turku", "sv": "https://oikeus.fi/turku/sv", "en": "https://oikeus.fi/turku/en"}'::jsonb
),
('HAMEENLINNA',
 '{"fi": "Hämeenlinnan hallinto-oikeus", "sv": "Tavastehus förvaltningsdomstol", "en": "Hämeenlinna Administrative Court"}'::jsonb,
 '{"fi": "Koulukatu 9, 13100 Hämeenlinna", "sv": "Koulukatu 9, 13100 Tavastehus", "en": "Koulukatu 9, 13100 Hämeenlinna"}'::jsonb,
 '029 56 46000', 'hameenlinna.ho@oikeus.fi',
 '{"fi": "https://oikeus.fi/hameenlinna", "sv": "https://oikeus.fi/hameenlinna/sv", "en": "https://oikeus.fi/hameenlinna/en"}'::jsonb
),
('ITA_SUOMI',
 '{"fi": "Itä-Suomen hallinto-oikeus", "sv": "Östra Finlands förvaltningsdomstol", "en": "Eastern Finland Administrative Court"}'::jsonb,
 '{"fi": "Kauppakatu 40, 70100 Kuopio", "sv": "Kauppakatu 40, 70100 Kuopio", "en": "Kauppakatu 40, 70100 Kuopio"}'::jsonb,
 '029 56 46000', 'itasuomi.ho@oikeus.fi',
 '{"fi": "https://oikeus.fi/itasuomi", "sv": "https://oikeus.fi/itasuomi/sv", "en": "https://oikeus.fi/itasuomi/en"}'::jsonb
),
('POHJOIS_SUOMI',
 '{"fi": "Pohjois-Suomen hallinto-oikeus", "sv": "Norra Finlands förvaltningsdomstol", "en": "Northern Finland Administrative Court"}'::jsonb,
 '{"fi": "Hallituskatu 20, 90100 Oulu", "sv": "Hallituskatu 20, 90100 Uleåborg", "en": "Hallituskatu 20, 90100 Oulu"}'::jsonb,
 '029 56 46000', 'pohjoissuomi.ho@oikeus.fi',
 '{"fi": "https://oikeus.fi/pohjoissuomi", "sv": "https://oikeus.fi/pohjoissuomi/sv", "en": "https://oikeus.fi/pohjoissuomi/en"}'::jsonb
),
('VAASA',
 '{"fi": "Vaasan hallinto-oikeus", "sv": "Vasa förvaltningsdomstol", "en": "Vaasa Administrative Court"}'::jsonb,
 '{"fi": "Koulukatu 12, 65100 Vaasa", "sv": "Koulukatu 12, 65100 Vasa", "en": "Koulukatu 12, 65100 Vaasa"}'::jsonb,
 '029 56 46000', 'vaasa.ho@oikeus.fi',
 '{"fi": "https://oikeus.fi/vaasa", "sv": "https://oikeus.fi/vaasa/sv", "en": "https://oikeus.fi/vaasa/en"}'::jsonb
),
('AHVENANMAA',
 '{"fi": "Ahvenanmaan hallintotuomioistuin", "sv": "Ålands förvaltningsdomstol", "en": "Åland Administrative Court"}'::jsonb,
 '{"fi": "Strandgatan 27, 22100 Mariehamn", "sv": "Strandgatan 27, 22100 Mariehamn", "en": "Strandgatan 27, 22100 Mariehamn"}'::jsonb,
 '029 56 46000', 'ahvenanmaa.ho@oikeus.fi',
 '{"fi": "https://oikeus.fi/ahvenanmaa", "sv": "https://oikeus.fi/ahvenanmaa/sv", "en": "https://oikeus.fi/ahvenanmaa/en"}'::jsonb
);

-- Maakunta-mappaukset (VNA 865/2016)
INSERT INTO maakunta_hallinto_oikeus (maakunta_koodi, hallinto_oikeus_id) VALUES
('01', (SELECT id FROM hallinto_oikeus WHERE koodi = 'HELSINKI')),
('02', (SELECT id FROM hallinto_oikeus WHERE koodi = 'TURKU')),
('04', (SELECT id FROM hallinto_oikeus WHERE koodi = 'TURKU')),
('05', (SELECT id FROM hallinto_oikeus WHERE koodi = 'HAMEENLINNA')),
('06', (SELECT id FROM hallinto_oikeus WHERE koodi = 'HAMEENLINNA')),
('08', (SELECT id FROM hallinto_oikeus WHERE koodi = 'HAMEENLINNA')),
('13', (SELECT id FROM hallinto_oikeus WHERE koodi = 'HAMEENLINNA')),
('07', (SELECT id FROM hallinto_oikeus WHERE koodi = 'ITA_SUOMI')),
('09', (SELECT id FROM hallinto_oikeus WHERE koodi = 'ITA_SUOMI')),
('10', (SELECT id FROM hallinto_oikeus WHERE koodi = 'ITA_SUOMI')),
('11', (SELECT id FROM hallinto_oikeus WHERE koodi = 'ITA_SUOMI')),
('12', (SELECT id FROM hallinto_oikeus WHERE koodi = 'ITA_SUOMI')),
('17', (SELECT id FROM hallinto_oikeus WHERE koodi = 'POHJOIS_SUOMI')),
('18', (SELECT id FROM hallinto_oikeus WHERE koodi = 'POHJOIS_SUOMI')),
('19', (SELECT id FROM hallinto_oikeus WHERE koodi = 'POHJOIS_SUOMI')),
('14', (SELECT id FROM hallinto_oikeus WHERE koodi = 'VAASA')),
('15', (SELECT id FROM hallinto_oikeus WHERE koodi = 'VAASA')),
('16', (SELECT id FROM hallinto_oikeus WHERE koodi = 'VAASA')),
('21', (SELECT id FROM hallinto_oikeus WHERE koodi = 'AHVENANMAA'));

UPDATE hallinto_oikeus SET muokattu = CURRENT_TIMESTAMP;
