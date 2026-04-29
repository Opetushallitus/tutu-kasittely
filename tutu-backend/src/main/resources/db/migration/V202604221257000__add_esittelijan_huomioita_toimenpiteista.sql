ALTER TABLE paatostieto ADD COLUMN IF NOT EXISTS esittelijan_huomioita_toimenpiteista TEXT;

COMMENT ON COLUMN paatostieto.esittelijan_huomioita_toimenpiteista IS 'Esittelijän huomioita korvaavista toimenpiteistä';
