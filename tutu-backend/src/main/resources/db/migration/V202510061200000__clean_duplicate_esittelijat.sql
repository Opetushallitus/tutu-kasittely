-- Puhdistaa duplikaatti-esittelijät ja päivittää viittaukset
-- Pidä vanhin rivi (pienin luotu-aikaleima)

BEGIN;

-- Tunnista pidettävät rivit: vanhin esittelija jokaiselle esittelija_oid:lle
CREATE TEMP TABLE keep_ids AS
SELECT DISTINCT ON (esittelija_oid) id, esittelija_oid
FROM esittelija
WHERE esittelija_oid IS NOT NULL
ORDER BY esittelija_oid, luotu ASC;

-- Päivitä maakoodi-viittaukset osoittamaan pidettävään esittelijään
UPDATE maakoodi m
SET esittelija_id = k.id
FROM esittelija e
JOIN keep_ids k ON e.esittelija_oid = k.esittelija_oid
WHERE m.esittelija_id = e.id
  AND e.id != k.id;

-- Päivitä hakemus-viittaukset osoittamaan pidettävään esittelijään
UPDATE hakemus h
SET esittelija_id = k.id
FROM esittelija e
JOIN keep_ids k ON e.esittelija_oid = k.esittelija_oid
WHERE h.esittelija_id = e.id
  AND e.id != k.id;

-- Poista duplikaatti-rivit (pidä vain vanhimmat)
DELETE FROM esittelija
WHERE id NOT IN (SELECT id FROM keep_ids);

COMMIT;
