-- Add muu perustelu field to perustelu
ALTER TABLE perustelu
    ADD COLUMN IF NOT EXISTS muu_perustelu TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN perustelu.muu_perustelu IS 'Myy yleinen perustelu';

-- Copy data from muistio to perustelu
UPDATE perustelu
SET muu_perustelu = mu.sisalto
FROM muistio mu
WHERE
  perustelu.hakemus_id = mu.hakemus_id
AND
  mu.sisainen_huomio = FALSE
AND
  mu.hakemuksen_osa = 'perustelut-yleiset--muu-perustelu';

UPDATE perustelu
SET selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa = mu.sisalto
FROM muistio mu
WHERE
  perustelu.hakemus_id = mu.hakemus_id
AND
  mu.sisainen_huomio = FALSE
AND
  mu.hakemuksen_osa = 'perustelut-yleiset--selvitys-tutkinnon-asemasta';

UPDATE perustelu
SET selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta = mu.sisalto
FROM muistio mu
WHERE
  perustelu.hakemus_id = mu.hakemus_id
AND
  mu.sisainen_huomio = FALSE
AND
  mu.hakemuksen_osa = 'perustelut-yleiset--selvitys-tutkinnon-myontajasta';

-- Delete unnecessary muistio data
DELETE FROM muistio
WHERE
  sisainen_huomio = FALSE
AND
  hakemuksen_osa = 'perustelut-yleiset--muu-perustelu';

DELETE FROM muistio
WHERE
  sisainen_huomio = FALSE
AND
  hakemuksen_osa = 'perustelut-yleiset--selvitys-tutkinnon-asemasta';

DELETE FROM muistio
WHERE
  sisainen_huomio = FALSE
AND
  hakemuksen_osa = 'perustelut-yleiset--selvitys-tutkinnon-myontajasta';
