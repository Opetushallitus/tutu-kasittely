CREATE UNIQUE INDEX idx_unique_hakemus_osa_sisainen
ON muistio (hakemus_id, hakemuksen_osa, sisainen_huomio);
