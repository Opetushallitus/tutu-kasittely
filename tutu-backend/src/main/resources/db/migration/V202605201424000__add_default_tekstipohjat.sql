INSERT INTO viestipohja_kategoria (nimi, luoja) VALUES ('Hakemuksen vastaanotto ja käsittely', 'Tutu') ON CONFLICT (nimi) DO NOTHING;
INSERT INTO viestipohja_kategoria (nimi, luoja) VALUES ('Ennakkotieto päätöksestä - taso', 'Tutu') ON CONFLICT (nimi) DO NOTHING;
INSERT INTO viestipohja_kategoria (nimi, luoja) VALUES ('Ennakkotieto päätöksestä - OTM', 'Tutu') ON CONFLICT (nimi) DO NOTHING;
INSERT INTO viestipohja_kategoria (nimi, luoja) VALUES ('Ennakkotieto päätöksestä - UO-opettajat', 'Tutu') ON CONFLICT (nimi) DO NOTHING;
INSERT INTO viestipohja_kategoria (nimi, luoja) VALUES ('Ennakkotieto päätöksestä - AP-päätökset', 'Tutu') ON CONFLICT (nimi) DO NOTHING;
INSERT INTO viestipohja_kategoria (nimi, luoja) VALUES ('Ennakkotieto päätöksestä - RO-päätökset', 'Tutu') ON CONFLICT (nimi) DO NOTHING;
INSERT INTO viestipohja_kategoria (nimi, luoja) VALUES ('Kelpoisuusvaatimukset', 'Tutu') ON CONFLICT (nimi) DO NOTHING;
INSERT INTO viestipohja_kategoria (nimi, luoja) VALUES ('Käsittely päättymässä', 'Tutu') ON CONFLICT (nimi) DO NOTHING;
INSERT INTO viestipohja_kategoria (nimi, luoja) VALUES ('Lopputekstit', 'Tutu') ON CONFLICT (nimi) DO NOTHING;

INSERT INTO paatospohja_kategoria (nimi, luoja) VALUES ('Ammattipätevyyden tunnustaminen', 'Tutu') ON CONFLICT (nimi) DO NOTHING;
INSERT INTO paatospohja_kategoria (nimi, luoja) VALUES ('Rinnastaminen tutkintoon tai opintoihin', 'Tutu') ON CONFLICT (nimi) DO NOTHING;
INSERT INTO paatospohja_kategoria (nimi, luoja) VALUES ('UO-kelpoisuudet', 'Tutu') ON CONFLICT (nimi) DO NOTHING;
INSERT INTO paatospohja_kategoria (nimi, luoja) VALUES ('Riittävät opinnot', 'Tutu') ON CONFLICT (nimi) DO NOTHING;
INSERT INTO paatospohja_kategoria (nimi, luoja) VALUES ('Muut', 'Tutu') ON CONFLICT (nimi) DO NOTHING;
