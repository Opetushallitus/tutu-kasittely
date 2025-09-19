ALTER TABLE perustelu_yleiset
    RENAME TO perustelu;

ALTER TABLE perustelu
    ADD COLUMN IF NOT EXISTS perustelu_uo_ro_sisalto JSONB DEFAULT '{}'::jsonb NOT NULL;

ALTER TABLE perustelu
    ADD COLUMN IF NOT EXISTS lausunto_pyynto_lisatiedot TEXT;

ALTER TABLE perustelu
    ADD COLUMN IF NOT EXISTS lausunto_sisalto TEXT;

COMMENT ON COLUMN perustelu.perustelu_uo_ro_sisalto IS 'Perustelun UO/RO sisältö (JSONB)';
COMMENT ON COLUMN perustelu.lausunto_pyynto_lisatiedot IS 'Lausuntopyyntöjen lisätiedot';
COMMENT ON COLUMN perustelu.lausunto_sisalto IS 'Lausunnon sisältö';

UPDATE perustelu
SET perustelu_uo_ro_sisalto = pu.perustelun_sisalto
FROM perustelu_uo_ro pu
WHERE perustelu.id = pu.perustelu_id;

ALTER TABLE lausuntopyynto
    DROP CONSTRAINT fk_lausuntopyynto_lausuntotieto;
ALTER TABLE lausuntopyynto
    RENAME COLUMN lausuntotieto_id TO perustelu_id;
ALTER TABLE lausuntopyynto
    ADD CONSTRAINT fk_lausuntopyynto_perustelu FOREIGN KEY (perustelu_id) REFERENCES perustelu (id);

UPDATE perustelu
SET lausunto_sisalto           = l.sisalto,
    lausunto_pyynto_lisatiedot = l.pyyntojen_lisatiedot
FROM lausuntotieto l
WHERE perustelu.id = l.perustelu_id;

DROP TABLE perustelu_uo_ro;
DROP TABLE lausuntotieto;
