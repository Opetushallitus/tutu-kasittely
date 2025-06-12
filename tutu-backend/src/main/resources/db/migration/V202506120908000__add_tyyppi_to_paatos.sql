ALTER TABLE paatos ADD COLUMN tyyppi VARCHAR(20);
COMMENT ON COLUMN paatos.tyyppi IS 'Päätöksen tyyppi';