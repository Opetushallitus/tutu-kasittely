ALTER TABLE lausuntopyynto
DROP COLUMN lausunnon_antaja,
ADD COLUMN lausunnon_antaja_koodiuri TEXT,
ADD COLUMN lausunnon_antaja_muu TEXT,
ADD CONSTRAINT lausuntopyynto_lausunnon_antaja_koodiuri_underscore_check
    CHECK (lausunnon_antaja_koodiuri LIKE '%\_%' ESCAPE '\' OR lausunnon_antaja_koodiuri IS NULL);
